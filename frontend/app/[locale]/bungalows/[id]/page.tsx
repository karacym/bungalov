import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { getBungalow } from '@/lib/api';
import { ReservationForm } from '@/components/reservation-form';
import { AvailabilityPreview } from '@/components/availability-preview';

function formatPrice(v: number | string) {
  const n = typeof v === 'string' ? Number(v) : v;
  return Number.isFinite(n) ? n : 0;
}

export default async function BungalowDetailPage({ params }: { params: { locale: string; id: string } }) {
  const bungalow = await getBungalow(params.id);
  const tb = await getTranslations('bungalow');
  const price = formatPrice(bungalow.pricePerNight);

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-4 pb-24">
      <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        {bungalow.images[0] ? (
          <div className="relative aspect-[21/9] w-full min-h-[200px]">
            <Image src={bungalow.images[0]} alt={bungalow.title} fill className="object-cover" priority sizes="100vw" />
          </div>
        ) : null}
        <div className="p-6">
          <h1 className="text-2xl font-bold">{bungalow.title}</h1>
          <p className="mt-2 text-slate-700">{bungalow.description}</p>
          <p className="mt-2 font-medium text-forest">{price} TL / gece · {bungalow.location}</p>
        </div>
      </section>

      {bungalow.images.length > 1 ? (
        <section className="rounded-2xl border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">{tb('galleryTitle')}</h2>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {bungalow.images.slice(1).map((src) => (
              <div key={src} className="relative aspect-[4/3] overflow-hidden rounded-xl">
                <Image src={src} alt="" fill className="object-cover" sizes="(max-width:768px) 50vw, 33vw" />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="rounded-2xl border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">{tb('availabilityTitle')}</h2>
        <AvailabilityPreview bungalowId={bungalow.id} />
      </section>

      <section className="rounded-2xl border bg-white p-6">
        <h2 className="mb-3 text-lg font-semibold">Rezervasyon</h2>
        <ReservationForm bungalowId={bungalow.id} hint={tb('reserveHint')} />
      </section>

      <a
        href={`https://wa.me/905000000000?text=${encodeURIComponent(bungalow.title)}`}
        className="fixed bottom-4 right-4 rounded-full bg-green-600 px-4 py-3 text-white shadow-lg md:bottom-6"
      >
        WhatsApp
      </a>
      <div className="fixed bottom-0 left-0 right-0 bg-forest p-3 text-center text-sm text-white md:hidden">
        {price} TL / gece · Hizli rezervasyon yukarida
      </div>
    </main>
  );
}
