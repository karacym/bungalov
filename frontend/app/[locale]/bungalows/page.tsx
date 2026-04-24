import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { getApiBaseUrl, getAvailability, getBungalows, type Bungalow } from '@/lib/api';

function formatPrice(v: number | string) {
  const n = typeof v === 'string' ? Number(v) : v;
  return Number.isFinite(n) ? n : 0;
}

function getDateList(checkIn: string, checkOut: string): string[] {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return [];
  const dates: string[] = [];
  const cursor = new Date(start);
  while (cursor < end) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

function maxGuestsFromBungalow(item: Bungalow): number {
  const maxGuests =
    Number(item.features?.maxGuests ?? item.features?.capacity ?? item.features?.guestCount ?? 2) || 2;
  return maxGuests > 0 ? maxGuests : 2;
}

async function isBungalowAvailable(bungalowId: string, checkIn: string, checkOut: string) {
  const nights = getDateList(checkIn, checkOut);
  if (!nights.length) return false;
  const rows = await getAvailability(bungalowId);
  const map = new Map(rows.map((row) => [row.date.slice(0, 10), row.isAvailable]));
  return nights.every((day) => map.get(day) !== false);
}

export default async function BungalowsPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams?: {
    checkIn?: string;
    checkOut?: string;
    guests?: string;
    adults?: string;
    children?: string;
    rooms?: string;
  };
}) {
  const tCat = await getTranslations({ locale: params.locale, namespace: 'catalog' });
  const ts = await getTranslations({ locale: params.locale, namespace: 'search' });
  const bungalows = await getBungalows();
  const apiUrl = getApiBaseUrl();
  const checkIn = searchParams?.checkIn?.trim() ?? '';
  const checkOut = searchParams?.checkOut?.trim() ?? '';
  const adults = Number(searchParams?.adults ?? 0);
  const children = Number(searchParams?.children ?? 0);
  const rooms = Number(searchParams?.rooms ?? 0);
  const guests = Number(searchParams?.guests ?? 0) || adults + children;
  const hasSearch = Boolean(checkIn && checkOut && Number.isFinite(guests) && guests > 0);

  const filteredBungalows = hasSearch
    ? (
        await Promise.all(
          bungalows
            .filter((item) => maxGuestsFromBungalow(item) >= guests)
            .map(async (item) => ({
              item,
              available: await isBungalowAvailable(item.id, checkIn, checkOut),
            })),
        )
      )
        .filter((entry) => entry.available)
        .map((entry) => entry.item)
    : bungalows;

  const filterParts: string[] = [];
  if (hasSearch) {
    if (rooms > 0) filterParts.push(tCat('roomsPart', { rooms }));
    if (adults > 0 || children > 0) {
      filterParts.push(tCat('guestsPart', { adults, children }));
    } else if (guests > 0) {
      filterParts.push(tCat('guestsOnlyPart', { guests }));
    }
  }
  const filterDetail = filterParts.join(' · ');

  return (
    <main className="pb-20">
      <div className="border-b border-bgl-mist/80 bg-gradient-to-b from-white/80 to-bgl-cream/30">
        <div className="bgl-container py-12 md:py-16">
          <p className="bgl-section-title">{tCat('eyebrow')}</p>
          <h1 className="bgl-heading mt-2 max-w-2xl">{tCat('title')}</h1>
          <p className="mt-3 max-w-2xl text-sm text-bgl-muted md:text-base">{tCat('intro')}</p>
          {hasSearch && filterDetail ? (
            <p className="mt-3 text-sm font-medium text-bgl-moss">
              {tCat('filterLine', { checkIn, checkOut, detail: filterDetail })}
            </p>
          ) : null}
        </div>
      </div>
      <div className="bgl-container mt-10 md:mt-14">
        {filteredBungalows.length === 0 ? (
          <div className="bgl-card mx-auto max-w-xl p-8 text-center">
            <p className="font-semibold text-bgl-ink">
              {hasSearch ? tCat('noResultsSearch') : tCat('noResultsEmpty')}
            </p>
            <p className="mt-2 text-sm text-bgl-muted">
              {tCat('devHint')}{' '}
              <code className="rounded bg-bgl-cream px-1 font-mono text-xs">NEXT_PUBLIC_API_URL</code>
            </p>
            <p className="mt-3 break-all font-mono text-xs text-bgl-muted">{apiUrl}</p>
          </div>
        ) : null}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredBungalows.map((item) => (
            <article key={item.id} className="group bgl-card flex flex-col">
              <div className="relative aspect-[16/11] w-full overflow-hidden bg-bgl-mist">
                {item.images[0] ? (
                  <Image
                    src={item.images[0]}
                    alt={item.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="(max-width:768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-bgl-muted">{tCat('imagePlaceholder')}</div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h2 className="text-lg font-semibold text-bgl-ink">{item.title}</h2>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-bgl-muted">{item.location}</p>
                <p className="mt-3 text-sm font-semibold text-bgl-moss">
                  {tCat('pricePerNight', { amount: formatPrice(item.pricePerNight), perNight: ts('perNight') })}
                </p>
                <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-bgl-muted">{item.description}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link
                    href={`/${params.locale}/bungalows/${item.id}`}
                    className="inline-flex w-fit items-center gap-2 rounded-full border border-bgl-moss/30 px-4 py-2 text-xs font-semibold text-bgl-moss transition hover:border-bgl-moss"
                  >
                    {tCat('explore')}
                    <span aria-hidden>→</span>
                  </Link>
                  {hasSearch ? (
                    <Link
                      href={`/${params.locale}/reservation?bungalowId=${item.id}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}&rooms=${rooms}&adults=${adults}&children=${children}`}
                      className="inline-flex w-fit items-center gap-2 rounded-full bg-bgl-moss px-4 py-2 text-xs font-semibold text-white transition hover:bg-bgl-mossDark"
                    >
                      {tCat('selectPay')}
                    </Link>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
