import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';
import { getBungalows } from '@/lib/api';
import { ReservationForm } from '@/components/reservation-form';

const HERO_BG =
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80';

const GALLERY = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
  'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&q=80',
  'https://images.unsplash.com/photo-1518780664699-7e3d4ca20947?w=800&q=80',
  'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80',
  'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80',
];

export async function generateMetadata({ params }: { params: { locale: string } }) {
  return {
    title: `Bungalov | ${params.locale.toUpperCase()}`,
    description: 'SEO optimized bungalow rental homepage',
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
  const bungalows = await getBungalows().catch(() => []);

  return (
    <main className="mx-auto max-w-6xl space-y-16 p-4 pb-8">
        <section className="relative overflow-hidden rounded-3xl text-white">
          <div className="absolute inset-0">
            <Image src={HERO_BG} alt="" fill className="object-cover" priority sizes="100vw" />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/70 via-black/40 to-forest/60" />
          </div>
          <div className="relative space-y-4 px-6 py-20 md:py-28">
            <h1 className="max-w-2xl text-3xl font-bold md:text-4xl">{t('heroTitle')}</h1>
            <p className="max-w-xl text-lg opacity-95">{t('heroSubtitle')}</p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href={`/${params.locale}/bungalows`}
                className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-forest shadow"
              >
                {tc('seeAll')}
              </Link>
              <a
                href="https://wa.me/905000000000"
                className="rounded-full border border-white/70 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
              >
                {tc('whatsapp')}
              </a>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold text-slate-900">{t('featuredTitle')}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {bungalows.slice(0, 3).map((item) => (
              <article key={item.id} className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                {item.images[0] ? (
                  <div className="relative aspect-[4/3] w-full">
                    <Image src={item.images[0]} alt={item.title} fill className="object-cover" sizes="(max-width:768px) 100vw, 33vw" />
                  </div>
                ) : null}
                <div className="p-4">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="text-sm text-slate-600">{item.location}</p>
                  <p className="mt-2 font-medium text-forest">{formatPrice(item.pricePerNight)} TL / gece</p>
                  <Link href={`/${params.locale}/bungalows/${item.id}`} className="mt-3 inline-block text-sm font-medium text-forest underline">
                    Detay
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-8 rounded-2xl border bg-white p-6 md:grid-cols-2 md:p-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{t('quickReserveTitle')}</h2>
            <p className="mt-2 text-sm text-slate-600">{tc('reserve')}</p>
            <div className="mt-4">
              <ReservationForm hint={tb('reserveHint')} />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{t('whyTitle')}</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-700">
              <li>{t('why1')}</li>
              <li>{t('why2')}</li>
              <li>{t('why3')}</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold text-slate-900">{t('galleryTitle')}</h2>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {GALLERY.map((src, i) => (
              <div key={src} className="relative aspect-square overflow-hidden rounded-xl">
                <Image src={src} alt="" fill className="object-cover" sizes="(max-width:768px) 50vw, 33vw" />
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold text-slate-900">{t('testimonialsTitle')}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { text: t('testimonial1'), author: t('author1') },
              { text: t('testimonial2'), author: t('author2') },
              { text: t('testimonial3'), author: t('author3') },
            ].map((x) => (
              <blockquote key={x.author} className="rounded-2xl border bg-white p-5 shadow-sm">
                <p className="text-slate-700">&ldquo;{x.text}&rdquo;</p>
                <footer className="mt-3 text-sm font-medium text-forest">— {x.author}</footer>
              </blockquote>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold text-slate-900">{t('mapTitle')}</h2>
          <div className="overflow-hidden rounded-2xl border shadow-sm">
            <iframe
              title="map"
              className="h-80 w-full"
              src="https://maps.google.com/maps?q=Sapanca+Turkey&t=&z=9&ie=UTF8&iwloc=&output=embed"
              loading="lazy"
            />
          </div>
        </section>
    </main>
  );
}
