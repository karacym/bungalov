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
    <main className="pb-28 md:pb-16">
      <div className="border-b border-bgl-mist/80 bg-white/60">
        <div className="bgl-container py-8 md:py-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-bgl-muted">Bungalov</p>
          <h1 className="bgl-heading mt-2 max-w-3xl">{bungalow.title}</h1>
          <p className="mt-2 text-sm font-medium text-bgl-moss">{bungalow.location}</p>
          <p className="mt-3 text-lg font-semibold text-bgl-ink">{price} TL <span className="text-sm font-normal text-bgl-muted">/ gece</span></p>
        </div>
      </div>

      <div className="bgl-container mt-8 space-y-8 md:mt-10">
        <section className="bgl-card overflow-hidden">
          {bungalow.images[0] ? (
            <div className="relative aspect-[21/10] w-full min-h-[220px] bg-bgl-mist">
              <Image src={bungalow.images[0]} alt={bungalow.title} fill className="object-cover" priority sizes="100vw" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bgl-ink/40 to-transparent" />
            </div>
          ) : null}
          <div className="p-6 md:p-8">
            <p className="max-w-3xl text-sm leading-relaxed text-bgl-muted md:text-base">{bungalow.description}</p>
          </div>
        </section>

        {bungalow.images.length > 1 ? (
          <section className="bgl-card p-6 md:p-8">
            <h2 className="bgl-heading">{tb('galleryTitle')}</h2>
            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
              {bungalow.images.slice(1).map((src) => (
                <div key={src} className="relative aspect-[4/3] overflow-hidden rounded-xl bg-bgl-mist ring-1 ring-black/5">
                  <Image src={src} alt="" fill className="object-cover" sizes="(max-width:768px) 50vw, 33vw" />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="bgl-card p-6 md:p-8">
          <h2 className="bgl-heading">{tb('availabilityTitle')}</h2>
          <div className="mt-6">
            <AvailabilityPreview bungalowId={bungalow.id} />
          </div>
        </section>

        <section className="bgl-card p-6 md:p-8">
          <h2 className="bgl-heading">Rezervasyon</h2>
          <div className="mt-4">
            <ReservationForm bungalowId={bungalow.id} hint={tb('reserveHint')} />
          </div>
        </section>
      </div>

      <a
        href={`https://wa.me/905000000000?text=${encodeURIComponent(bungalow.title)}`}
        className="fixed bottom-20 right-5 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg ring-2 ring-white/90 md:bottom-8"
        aria-label="WhatsApp"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-white/10 bg-bgl-mossDark px-4 py-3 text-center text-sm text-white md:hidden">
        {price} TL / gece — rezervasyon yukari bolumde
      </div>
    </main>
  );
}
