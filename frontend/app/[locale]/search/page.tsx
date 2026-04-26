import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { bungalowDetailPath, searchBungalows } from '@/lib/api';

function formatPrice(v: number | string) {
  const n = typeof v === 'string' ? Number(v) : v;
  return Number.isFinite(n) ? n : 0;
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'meta' });
  return {
    title: t('searchTitle'),
    description: t('searchDescription'),
  };
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams?: { checkIn?: string; checkOut?: string; guests?: string };
}) {
  const t = await getTranslations('search');
  const checkIn = searchParams?.checkIn?.trim() ?? '';
  const checkOut = searchParams?.checkOut?.trim() ?? '';
  const guests = Number(searchParams?.guests ?? 1);
  const hasQuery = Boolean(checkIn && checkOut && guests > 0);

  const bungalows = hasQuery
    ? await searchBungalows({
        checkIn,
        checkOut,
        guests,
      })
    : [];

  return (
    <main className="pb-20">
      <div className="border-b border-bgl-mist/80 bg-gradient-to-b from-white/90 to-bgl-cream/30">
        <div className="bgl-container py-10 md:py-14">
          <h1 className="bgl-heading">{t('resultsTitle')}</h1>
          <p className="mt-2 text-sm text-bgl-muted">{t('resultsSubtitle')}</p>
          {hasQuery ? (
            <p className="mt-3 text-sm font-medium text-bgl-moss">
              {checkIn} - {checkOut} · {guests} {t('person')}
            </p>
          ) : null}
        </div>
      </div>

      <div className="bgl-container mt-8">
        {bungalows.length === 0 ? (
          <div className="bgl-card mx-auto max-w-2xl p-8 text-center">
            <p className="text-sm text-bgl-muted">{t('noResults')}</p>
            <Link href={`/${params.locale}`} className="bgl-btn-primary mt-6 inline-flex">
              {t('searchButton')}
            </Link>
          </div>
        ) : null}

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {bungalows.map((item) => {
            const features = Object.entries((item.features ?? {}) as Record<string, unknown>)
              .filter(([, value]) => value === true || typeof value === 'string')
              .slice(0, 3);

            return (
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
                    <div className="flex h-full items-center justify-center text-bgl-muted">{t('imagePlaceholder')}</div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="text-lg font-semibold text-bgl-ink">{item.title}</h2>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wide text-bgl-muted">{item.location}</p>
                  <p className="mt-2 text-sm font-semibold text-bgl-moss">
                    {t('pricePerNight', {
                      amount: formatPrice(item.pricePerNight),
                      perNight: t('perNight'),
                    })}
                  </p>
                  {features.length > 0 ? (
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {features.map(([key, value]) => (
                        <li
                          key={key}
                          className="rounded-full border border-bgl-mist bg-bgl-cream/40 px-2.5 py-1 text-[11px] text-bgl-muted"
                        >
                          {typeof value === 'string' ? value : key}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link
                      href={`${bungalowDetailPath(params.locale, item)}?checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}&guests=${guests}`}
                      className="inline-flex items-center gap-2 rounded-full border border-bgl-moss/30 px-4 py-2 text-xs font-semibold text-bgl-moss transition hover:border-bgl-moss"
                    >
                      {t('viewDetails')}
                    </Link>
                    <Link
                      href={`/${params.locale}/reservation?bungalowId=${item.id}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`}
                      className="inline-flex items-center gap-2 rounded-full bg-bgl-moss px-4 py-2 text-xs font-semibold text-white transition hover:bg-bgl-mossDark"
                    >
                      {t('continueReservation')}
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
