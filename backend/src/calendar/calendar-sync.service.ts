import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import * as nodeIcal from 'node-ical';
import { Prisma, ReservationSource, ReservationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const CHANNEL_USER_EMAIL = 'channel-sync@internal.bungalov';

function toUtcDateOnly(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 12, 0, 0, 0));
}

function addDaysUtc(d: Date, days: number): Date {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + days);
  return x;
}

function isVEvent(x: unknown): x is { type: 'VEVENT'; uid?: string; start?: Date; end?: Date; status?: string; rrule?: unknown; summary?: string } {
  return typeof x === 'object' && x !== null && (x as { type?: string }).type === 'VEVENT';
}

@Injectable()
export class CalendarSyncService {
  private readonly logger = new Logger(CalendarSyncService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron('*/15 * * * *')
  scheduledSync(): void {
    void this.syncAllBungalows().catch((e) => this.logger.error(e instanceof Error ? e.message : String(e)));
  }

  async listAdminCalendarEvents(bungalowId: string, fromStr: string, toStr: string) {
    const start = this.parseYmd(fromStr);
    const endDay = this.parseYmd(toStr);
    const endExclusive = addDaysUtc(endDay, 1);

    const rows = await this.prisma.reservation.findMany({
      where: {
        bungalowId,
        status: { not: ReservationStatus.cancelled },
        checkIn: { lt: endExclusive },
        checkOut: { gt: start },
      },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { checkIn: 'asc' },
    });

    return {
      events: rows.map((r) => ({
        id: r.id,
        checkIn: r.checkIn.toISOString(),
        checkOut: r.checkOut.toISOString(),
        source: r.source,
        status: r.status,
        guestName: r.user?.name ?? 'Misafir',
      })),
    };
  }

  async syncAllBungalows(): Promise<{ ok: boolean; bungalowId: string; imported: number; skipped: number; error?: string }[]> {
    const channelUser = await this.prisma.user.findUnique({ where: { email: CHANNEL_USER_EMAIL } });
    if (!channelUser) {
      this.logger.warn(`Kanal kullanicisi yok: ${CHANNEL_USER_EMAIL} (seed calistirin)`);
      return [];
    }

    const bungalows = await this.prisma.bungalow.findMany({
      where: { externalIcalUrl: { not: '' } },
    });

    const out: { ok: boolean; bungalowId: string; imported: number; skipped: number; error?: string }[] = [];
    for (const b of bungalows) {
      const url = b.externalIcalUrl?.trim();
      if (!url) continue;
      try {
        const r = await this.syncBungalow(b.id, url, channelUser.id);
        out.push({ ok: true, bungalowId: b.id, imported: r.imported, skipped: r.skipped });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        this.logger.warn(`iCal senkron basarisiz bungalow=${b.id}: ${msg}`);
        out.push({ ok: false, bungalowId: b.id, imported: 0, skipped: 0, error: msg });
      }
    }
    return out;
  }

  private parseYmd(s: string): Date {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s.trim());
    if (!m) return new Date(s);
    return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12, 0, 0, 0));
  }

  private async syncBungalow(
    bungalowId: string,
    url: string,
    channelUserId: string,
  ): Promise<{ imported: number; skipped: number }> {
    const syncId = `ical:${bungalowId}`;
    const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(25_000) });
    if (!res.ok) {
      throw new Error(`iCal HTTP ${res.status}`);
    }
    const text = await res.text();
    const data = nodeIcal.sync.parseICS(text);
    const seenUids = new Set<string>();
    let imported = 0;
    let skipped = 0;

    const bungalow = await this.prisma.bungalow.findUnique({ where: { id: bungalowId } });
    if (!bungalow) return { imported: 0, skipped: 0 };

    for (const comp of Object.values(data)) {
      if (!isVEvent(comp)) continue;
      const ev = comp;
      if (ev.rrule) {
        skipped += 1;
        continue;
      }
      const rawUid = typeof ev.uid === 'string' && ev.uid.trim() ? ev.uid.trim() : '';
      const uid = rawUid || `hash-${bungalowId}-${String(ev.start)}`;
      seenUids.add(uid);

      if (ev.status === 'CANCELLED') {
        await this.prisma.reservation.updateMany({
          where: {
            bungalowId,
            source: ReservationSource.AIRBNB,
            externalUid: uid,
            syncId,
          },
          data: { status: ReservationStatus.cancelled },
        });
        continue;
      }

      const startRaw = ev.start instanceof Date ? ev.start : null;
      if (!startRaw || Number.isNaN(startRaw.getTime())) {
        skipped += 1;
        continue;
      }
      const checkIn = toUtcDateOnly(startRaw);
      let checkOut: Date;
      if (ev.end instanceof Date && !Number.isNaN(ev.end.getTime())) {
        checkOut = toUtcDateOnly(ev.end);
      } else {
        checkOut = addDaysUtc(checkIn, 1);
      }
      if (checkOut <= checkIn) {
        skipped += 1;
        continue;
      }

      const conflict = await this.prisma.reservation.findFirst({
        where: {
          bungalowId,
          status: { not: ReservationStatus.cancelled },
          checkIn: { lt: checkOut },
          checkOut: { gt: checkIn },
          NOT: {
            AND: [{ source: ReservationSource.AIRBNB }, { externalUid: uid }],
          },
        },
      });

      const existing = await this.prisma.reservation.findFirst({
        where: { bungalowId, source: ReservationSource.AIRBNB, externalUid: uid, syncId },
      });

      if (conflict && !existing) {
        skipped += 1;
        continue;
      }

      const totalPrice = new Prisma.Decimal(0);

      await this.prisma.reservation.upsert({
        where: {
          bungalowId_externalUid: { bungalowId, externalUid: uid },
        },
        create: {
          userId: channelUserId,
          bungalowId,
          checkIn,
          checkOut,
          guests: 1,
          totalPrice,
          status: ReservationStatus.paid,
          source: ReservationSource.AIRBNB,
          externalUid: uid,
          syncId,
        },
        update: {
          checkIn,
          checkOut,
          status: ReservationStatus.paid,
          totalPrice,
          guests: 1,
          userId: channelUserId,
        },
      });
      imported += 1;
    }

    const staleWhere: Prisma.ReservationWhereInput = {
      bungalowId,
      source: ReservationSource.AIRBNB,
      syncId,
      status: { not: ReservationStatus.cancelled },
      ...(seenUids.size > 0 ? { externalUid: { notIn: [...seenUids] } } : {}),
    };
    await this.prisma.reservation.updateMany({
      where: staleWhere,
      data: { status: ReservationStatus.cancelled },
    });

    return { imported, skipped };
  }
}
