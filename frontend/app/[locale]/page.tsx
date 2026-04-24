import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';
import { getBungalows } from '@/lib/api';
import { ReservationForm } from '@/components/reservation-form';
import { HeroBackgroundSlider } from '@/components/home/hero-background-slider';
import { HomeMapSection } from '@/components/home/home-map-section';
import { DEFAULT_HOME_HERO_IMAGES } from '@/lib/site-pages-config';

const GALLERY = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80',
  'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1200&q=80',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80',
  'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=80',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80',
  'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200&q=80',
];

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'meta' });
  return {
    title: t('homeTitle', { locale: params.locale.toUpperCase() }),
    description: t('homeDescription'),
  };
}

function formatPrice(v: number | string) {
  const n = typeof v === 'string' ? Number(v) : v;
  return Number.isFinite(n) ? n : 0;
}

export default async function HomePage({ params }: { params: { locale: string } }) {
  const t = await getTranslations('home');
  const tc = await getTranslations('cta');
  const tb = await getTranslations('bungalow');
  const ts = await getTranslations('search');
  const tCommon = await getTranslations({ locale: params.locale, namespace: 'common' });
  const bungalows = await getBungalows();

  return (
    <main className="pb-16">
      <section className="bgl-container pt-6 md:pt-10">
        <div className="relative overflow-hidden rounded-[2rem] text-white shadow-card ring-1 ring-black/5">
          <HeroBackgroundSlider fallbackImages={DEFAULT_HOME_HERO_IMAGES} />
          <div className="relative flex flex-col gap-6 px-6 py-16 md:px-12 md:py-24">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
              {t('heroEyebrow')}
              {t('heroBrandSep')}
              {t('heroBrandName')}
            </p>
            <h1 className="max-w-2xl text-3xl font-bold leading-tight tracking-tight md:text-5xl md:leading-[1.1]">
              {t('heroTitle')}
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-white/90 md:text-lg">{t('heroSubtitle')}</p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href={`/${params.locale}/bungalows`} className="bgl-btn-primary bg-white text-bgl-moss hover:bg-bgl-cream">
                {tc('seeAll')}
              </Link>
              <a href="https://wa.me/905000000000" className="bgl-btn-ghost border-white/40 bg-white/10 text-white hover:bg-white/20">
                {tc('whatsapp')}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="bgl-container mt-6 md:mt-8">
        <div className="rounded-[2rem] border border-bgl-mist/90 bg-white/95 p-6 shadow-soft md:p-8">
          <p className="bgl-section-title">{t('bookingEyebrow')}</p>
          <h2 className="bgl-heading mt-2">{t('quickReserveTitle')}</h2>
          <p className="mt-2 text-sm text-bgl-muted">{tc('reserve')}</p>
          <div className="mt-5">
            <ReservationForm hint={ts('resultsSubtitle')} locale={params.locale} />
          </div>
        </div>
      </section>

      <section className="bgl-container mt-16 md:mt-24">
        <p className="bgl-section-title">{t('collectionEyebrow')}</p>
        <h2 className="bgl-heading mt-2">{t('featuredTitle')}</h2>
        <p className="mt-2 max-w-2xl text-sm text-bgl-muted md:text-base">{t('featuredIntro')}</p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {bungalows.slice(0, 3).map((item) => (
            <article key={item.id} className="group bgl-card transition hover:-translate-y-0.5 hover:shadow-card">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-bgl-mist">
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
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-bgl-ink/80 to-transparent p-4 pt-12">
                  <p className="text-xs text-white/80">{item.location}</p>
                  <p className="text-sm font-semibold text-white">
                    {t('priceLine', { amount: formatPrice(item.pricePerNight), perNight: ts('perNight') })}
                  </p>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold text-bgl-ink">{item.title}</h3>
                <Link
                  href={`/${params.locale}/bungalows/${item.id}`}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-bgl-moss hover:text-bgl-mossDark"
                >
                  {ts('viewDetails')}
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bgl-container mt-16 md:mt-24">
        <div className="flex flex-col justify-center rounded-[2rem] bg-bgl-cream/80 p-6 ring-1 ring-bgl-mist/80 md:p-10">
          <p className="bgl-section-title">{t('whyBlockEyebrow')}</p>
          <h2 className="bgl-heading mt-2">{t('whyTitle')}</h2>
          <ul className="mt-6 space-y-4 text-sm text-bgl-muted md:text-base">
            {[t('why1'), t('why2'), t('why3')].map((line) => (
              <li key={line} className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-bgl-moss" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bgl-container mt-16 md:mt-24">
        <p className="bgl-section-title">{t('galleryEyebrow')}</p>
        <h2 className="bgl-heading mt-2">{t('galleryTitle')}</h2>
        <div className="mt-10 grid grid-cols-2 gap-2 md:grid-cols-4 md:grid-rows-2 md:gap-3">
          {GALLERY.map((src, i) => (
            <div
              key={src}
              className={`relative overflow-hidden rounded-2xl bg-bgl-mist ring-1 ring-black/5 ${
                i === 0 ? 'col-span-2 aspect-[16/10] md:row-span-2 md:aspect-auto md:min-h-[320px]' : 'aspect-square'
              }`}
            >
              <Image src={src} alt="" fill className="object-cover transition duration-700 hover:scale-105" sizes="(max-width:768px) 50vw, 25vw" />
            </div>
          ))}
        </div>
      </section>

      <section className="bgl-container mt-16 md:mt-24">
        <p className="bgl-section-title">{t('testimonialsEyebrow')}</p>
        <h2 className="bgl-heading mt-2">{t('testimonialsTitle')}</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { text: t('testimonial1'), author: t('author1') },
            { text: t('testimonial2'), author: t('author2') },
            { text: t('testimonial3'), author: t('author3') },
          ].map((x) => (
            <blockquote key={x.author} className="bgl-card p-6">
              <p className="text-sm leading-relaxed text-bgl-muted md:text-base">&ldquo;{x.text}&rdquo;</p>
              <footer className="mt-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-bgl-moss/10 text-sm font-bold text-bgl-moss">
                  {x.author.charAt(0)}
                </span>
                <span className="text-sm font-semibold text-bgl-ink">{x.author}</span>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      <section className="bgl-container mt-16 md:mt-24">
        <p className="bgl-section-title">{t('mapEyebrow')}</p>
        <h2 className="bgl-heading mt-2">{t('mapTitle')}</h2>
        <HomeMapSection />
      </section>

      <a
        href="https://wa.me/905000000000"
        className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg ring-2 ring-white/80 transition hover:scale-105 md:bottom-8 md:right-8"
        aria-label={tCommon('a11yWhatsApp')}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </main>
  );
}
