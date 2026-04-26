import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { ReviewSource } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type GooglePlaceReview = {
  author_name?: string;
  text?: string;
  rating?: number;
  time?: number;
};

type PlaceDetailsResponse = {
  status: string;
  error_message?: string;
  result?: { reviews?: GooglePlaceReview[] };
};

const MAX_AUTHOR = 255;

function truncAuthor(name: string): string {
  const t = name.trim() || 'Google kullanicisi';
  return t.length > MAX_AUTHOR ? t.slice(0, MAX_AUTHOR) : t;
}

@Injectable()
export class GoogleMapsService {
  private readonly logger = new Logger(GoogleMapsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  @Cron('0 */6 * * *')
  scheduledSyncAll(): void {
    void this.syncAllBungalowsWithPlaceId().catch((e) =>
      this.logger.warn(e instanceof Error ? e.message : String(e)),
    );
  }

  async syncAllBungalowsWithPlaceId(): Promise<void> {
    const key = this.config.get<string>('GOOGLE_MAPS_API_KEY')?.trim();
    if (!key) {
      this.logger.debug('GOOGLE_MAPS_API_KEY tanimli degil; zamanlanmis Google yorum senkronu atlandi.');
      return;
    }
    const rows = await this.prisma.bungalow.findMany({
      select: { id: true, googlePlaceId: true },
    });
    for (const row of rows) {
      const pid = row.googlePlaceId?.trim();
      if (!pid) continue;
      try {
        await this.syncReviewsForBungalow(row.id);
      } catch (e) {
        this.logger.warn(`Google yorum senkronu bungalow=${row.id}: ${e instanceof Error ? e.message : e}`);
      }
    }
  }

  /**
   * Places API (Place Details) ile son yorumlari cekip Review tablosuna yazar.
   * Ayni (bungalow, kaynak, zaman, yazar) tekrarlanmaz (upsert).
   */
  async syncReviewsForBungalow(bungalowId: string): Promise<{ upserted: number; status: string }> {
    const key = this.config.get<string>('GOOGLE_MAPS_API_KEY')?.trim();
    if (!key) {
      return { upserted: 0, status: 'MISSING_API_KEY' };
    }

    const bungalow = await this.prisma.bungalow.findUnique({
      where: { id: bungalowId },
      select: { id: true, googlePlaceId: true },
    });
    if (!bungalow?.googlePlaceId?.trim()) {
      return { upserted: 0, status: 'NO_PLACE_ID' };
    }

    const placeId = bungalow.googlePlaceId.trim();
    const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
    url.searchParams.set('place_id', placeId);
    url.searchParams.set('fields', 'reviews');
    url.searchParams.set('reviews_sort', 'newest');
    url.searchParams.set('key', key);

    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(20_000) });
    if (!res.ok) {
      throw new Error(`Google HTTP ${res.status}`);
    }
    const data = (await res.json()) as PlaceDetailsResponse;

    if (data.status === 'ZERO_RESULTS') {
      return { upserted: 0, status: 'ZERO_RESULTS' };
    }
    if (data.status !== 'OK') {
      const msg = data.error_message ?? data.status;
      throw new Error(`Google Places: ${msg}`);
    }

    const raw = data.result?.reviews ?? [];
    const sorted = [...raw].sort((a, b) => (b.time ?? 0) - (a.time ?? 0));
    const top = sorted.slice(0, 5);

    let upserted = 0;
    for (const r of top) {
      const timeUnix = typeof r.time === 'number' && Number.isFinite(r.time) ? Math.floor(r.time) : null;
      if (timeUnix === null) continue;
      const authorName = truncAuthor(String(r.author_name ?? ''));
      const text = String(r.text ?? '').trim();
      const rating = typeof r.rating === 'number' && Number.isFinite(r.rating) ? Math.round(r.rating) : 0;
      const reviewedAt = new Date(timeUnix * 1000);

      await this.prisma.review.upsert({
        where: {
          bungalowId_source_googleTimeUnix_authorName: {
            bungalowId,
            source: ReviewSource.GOOGLE,
            googleTimeUnix: timeUnix,
            authorName,
          },
        },
        create: {
          bungalowId,
          source: ReviewSource.GOOGLE,
          authorName,
          text,
          rating,
          googleTimeUnix: timeUnix,
          reviewedAt,
        },
        update: {
          text,
          rating,
          reviewedAt,
        },
      });
      upserted += 1;
    }

    return { upserted, status: 'OK' };
  }
}
