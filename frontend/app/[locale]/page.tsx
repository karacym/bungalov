import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { getBungalows } from '@/lib/api';
import { ReservationForm } from '@/components/reservation-form';

export async function generateMetadata({ params }: { params: { locale: string } }) {
  return {
    title: `Bungalov | ${params.locale.toUpperCase()}`,
    description: 'SEO optimized bungalow rental homepage',
  };
}

export default async function HomePage({ params }: { params: { locale: string } }) {
  const t = await getTranslations();
  const bungalows = await getBungalows().catch(() => []);

  return (
    <main className="mx-auto max-w-6xl space-y-10 p-4">
      <section className="rounded-2xl bg-forest p-8 text-white">
        <h1 className="text-3xl font-bold">{t('home.heroTitle')}</h1>
        <p className="mt-2 opacity-90">{t('home.heroSubtitle')}</p>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        {bungalows.slice(0, 3).map((item) => (
          <article key={item.id} className="rounded-xl border bg-white p-4">
            <h2 className="text-xl font-semibold">{item.title}</h2>
            <p className="text-sm text-slate-600">{item.location}</p>
            <p className="mt-2 font-medium">{item.pricePerNight} TL / gece</p>
            <Link href={`/${params.locale}/bungalows/${item.id}`} className="mt-3 inline-block text-forest">
              Detay
            </Link>
          </article>
        ))}
      </section>
      <section className="grid gap-6 md:grid-cols-2">
        <ReservationForm />
        <div className="rounded-xl border bg-white p-4">
          <h3 className="text-lg font-semibold">Neden bizi secmelisiniz?</h3>
          <ul className="mt-2 list-disc pl-5 text-sm text-slate-700">
            <li>7/24 destek</li>
            <li>Guvenli online odeme</li>
            <li>Onayli konaklama noktasi</li>
          </ul>
        </div>
      </section>
      <a href="https://wa.me/905000000000" className="fixed bottom-4 right-4 rounded-full bg-green-600 px-4 py-3 text-white shadow-lg">
        {t('cta.whatsapp')}
      </a>
    </main>
  );
}
