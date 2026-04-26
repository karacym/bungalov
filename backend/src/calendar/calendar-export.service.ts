import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ReservationSource, ReservationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

function escapeIcsText(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
}

function formatIcsDateUtcMidnight(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

@Injectable()
export class CalendarExportService {
  constructor(private readonly prisma: PrismaService) {}

  async buildIcs(token: string): Promise<string | null> {
    const bungalow = await this.prisma.bungalow.findFirst({
      where: { icalExportToken: token },
    });
    if (!bungalow) return null;

    const reservations = await this.prisma.reservation.findMany({
      where: {
        bungalowId: bungalow.id,
        source: ReservationSource.DIRECT,
        status: { in: [ReservationStatus.pending, ReservationStatus.paid] },
      },
      orderBy: { checkIn: 'asc' },
    });

    const lines: string[] = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Bungalov//TR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ];

    const now = new Date();
    const stamp = formatIcsDateUtcMidnight(now);

    for (const r of reservations) {
      const uid = `${r.id}@bungalov`;
      const start = formatIcsDateUtcMidnight(r.checkIn);
      const end = formatIcsDateUtcMidnight(r.checkOut);
      const summary = escapeIcsText(`Dolu — ${bungalow.title}`);
      lines.push('BEGIN:VEVENT', `UID:${uid}`, `DTSTAMP:${stamp}T120000Z`, `DTSTART;VALUE=DATE:${start}`, `DTEND;VALUE=DATE:${end}`, `SUMMARY:${summary}`, 'TRANSP:OPAQUE', 'END:VEVENT');
    }

    lines.push('END:VCALENDAR');
    return lines.join('\r\n') + '\r\n';
  }

  async ensureExportToken(bungalowId: string): Promise<string> {
    const b = await this.prisma.bungalow.findUnique({ where: { id: bungalowId } });
    if (!b) throw new NotFoundException('Bungalow not found');
    if (b.icalExportToken) return b.icalExportToken;
    const token = randomUUID();
    await this.prisma.bungalow.update({
      where: { id: bungalowId },
      data: { icalExportToken: token },
    });
    return token;
  }

  async rotateExportToken(bungalowId: string): Promise<{ icalExportToken: string }> {
    const token = randomUUID();
    await this.prisma.bungalow.update({
      where: { id: bungalowId },
      data: { icalExportToken: token },
    });
    return { icalExportToken: token };
  }
}
