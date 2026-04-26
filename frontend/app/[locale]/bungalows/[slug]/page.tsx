import Link from 'next/link';
import type { Metadata } from 'next';
import { permanentRedirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { bungalowDetailPath, getApiBaseUrl, getBungalow } from '@/lib/api';
import { ReservationForm } from '@/components/reservation-form';
import { AvailabilityPreview } from '@/components/availability-preview';
import { BungalowGalleryLightbox } from '@/components/bungalow-gallery-lightbox';
import { getSiteBranding } from '@/lib/site-branding';
import {
  buildBungalowMetaDescription,
  buildBungalowTitleSegment,
  bungalowJsonLd,
} from '@/lib/seo-bungalow';

function formatPrice(v: number | string) {
  const n = typeof v === 'string' ? Number(v) : v;
  return Number.isFinite(n) ? n : 0;
}

function siteOrigin(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').trim().replace(/\/$/, '');
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const bungalow = await getBungalow(params.slug);
  const branding = await getSiteBranding();
  const site = branding.siteName?.trim() || 'Bungalov';
  if (!bungalow) {
    return {
      title: site,
      robots: { index: false, follow: true },
    };
  }
  const t = await getTranslations({ locale: params.locale, namespace: 'bungalowDetail' });
  const titleSeg = buildBungalowTitleSegment(bungalow);
  const description = buildBungalowMetaDescription(bungalow, t('metaReserveCta'));
  const path = bungalowDetailPath(params.locale, bungalow);
  const canonical = `${siteOrigin()}${path}`;
  const ogImage = bungalow.images[0];

  return {
    title: titleSeg,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${titleSeg} | ${site}`,
      description,
      url: canonical,
      type: 'website',
      ...(ogImage ? { images: [{ url: ogImage, alt: bungalow.title }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${titleSeg} | ${site}`,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

export default async function BungalowDetailPage({
  params,
  searchParams,
}: {
  params: { locale: string; slug: string };
  searchParams?: { checkIn?: string; checkOut?: string; guests?: string };
}) {
  const bungalow = await getBungalow(params.slug);
  const tb = await getTranslations('bungalow');
  const td = await getTranslations({ locale: params.locale, namespace: 'bungalowDetail' });
  const ts = await getTranslations({ locale: params.locale, namespace: 'search' });
  const tCommon = await getTranslations({ locale: params.locale, namespace: 'common' });
  const checkIn = searchParams?.checkIn?.trim() ?? '';
  const checkOut = searchParams?.checkOut?.trim() ?? '';
  const guests = Number(searchParams?.guests ?? 2);

  if (!bungalow) {
    const apiUrl = getApiBaseUrl();
    return (
      <main className="bgl-container max-w-2xl py-16 md:py-24">
        <div className="bgl-card p-8 text-center md:p-10">
          <h1 className="bgl-heading">{td('loadErrorTitle')}</h1>
          <p className="mt-3 text-sm text-bgl-muted">
            {td('loadErrorBody')}{' '}
            <code className="rounded bg-bgl-cream px-1.5 py-0.5 font-mono text-xs text-bgl-ink">NEXT_PUBLIC_API_URL</code>
          </p>
          <p className="mt-2 break-all font-mono text-xs text-bgl-muted">{apiUrl}</p>
          <Link href={`/${params.locale}/bungalows`} className="bgl-btn-primary mt-8 inline-flex">
            {td('backToList')}
          </Link>
        </div>
      </main>
    );
  }

  const canonicalPath = bungalowDetailPath(params.locale, bungalow);
  if (bungalow.slug?.trim() && params.slug === bungalow.id) {
    const q = new URLSearchParams();
    if (checkIn) q.set('checkIn', checkIn);
    if (checkOut) q.set('checkOut', checkOut);
    if (Number.isFinite(guests) && guests > 0) q.set('guests', String(guests));
    const qs = q.toString();
    permanentRedirect(`/${params.locale}/bungalows/${bungalow.slug}${qs ? `?${qs}` : ''}`);
  }

  const price = formatPrice(bungalow.pricePerNight);
  const jsonLd = bungalowJsonLd(bungalow, `${siteOrigin()}${canonicalPath}`);
  const imageAlts = bungalow.images.map((_, i) =>
    i === 0
      ? td('heroImageAlt', { title: bungalow.title, location: bungalow.location })
      : td('galleryImageAlt', { title: bungalow.title, n: i + 1 }),
  );

  return (
    <main className="pb-28 md:pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="border-b border-bgl-mist/80 bg-white/60">
        <div className="bgl-container py-8 md:py-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-bgl-muted">{td('eyebrow')}</p>
          <h1 className="bgl-heading mt-2 max-w-3xl">{bungalow.title}</h1>
          <p className="mt-2 text-sm font-medium text-bgl-moss">{bungalow.location}</p>
          <p className="mt-3 text-lg font-semibold text-bgl-ink">
            {price} TL <span className="text-sm font-normal text-bgl-muted">{td('perNightSuffix')}</span>
          </p>
        </div>
      </div>

      <div className="bgl-container mt-8 space-y-8 md:mt-10">
        <BungalowGalleryLightbox images={bungalow.images} alts={imageAlts} title={bungalow.title}>
          <div className="p-6 md:p-8">
            <h2 id="bungalow-details-heading" className="text-lg font-semibold tracking-tight text-bgl-ink md:text-xl">
              {td('detailsHeading')}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-bgl-muted md:text-base">{bungalow.description}</p>
          </div>
        </BungalowGalleryLightbox>

        <section className="bgl-card p-6 md:p-8" aria-labelledby="bungalow-availability-heading">
          <h2 id="bungalow-availability-heading" className="bgl-heading">
            {tb('availabilityTitle')}
          </h2>
          <div className="mt-6">
            <AvailabilityPreview bungalowId={bungalow.id} locale={params.locale} />
          </div>
        </section>

        <section className="bgl-card overflow-visible p-6 md:p-8" aria-labelledby="bungalow-reservation-heading">
          <h2 id="bungalow-reservation-heading" className="bgl-heading">
            {td('reservationSection')}
          </h2>
          <div className="mt-4">
            <ReservationForm
              bungalowId={bungalow.id}
              calendarMode="bungalow"
              hint={tb('reserveHint')}
              locale={params.locale}
              initialCheckIn={checkIn}
              initialCheckOut={checkOut}
              initialGuests={Number.isFinite(guests) && guests > 0 ? guests : 2}
            />
          </div>
        </section>
      </div>

      <a
        href={`https://wa.me/905000000000?text=${encodeURIComponent(bungalow.title)}`}
        className="fixed bottom-20 right-5 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg ring-2 ring-white/90 md:bottom-8"
        aria-label={tCommon('a11yWhatsApp')}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-white/10 bg-bgl-mossDark px-4 py-3 text-center text-sm text-white md:hidden">
        {td('mobileSticky', {
          amount: price,
          perNight: ts('perNight'),
          hint: td('mobileStickyHint'),
        })}
      </div>
    </main>
  );
}
