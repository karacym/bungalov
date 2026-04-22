import Image from 'next/image';
import Link from 'next/link';
import { getBungalows } from '@/lib/api';

function formatPrice(v: number | string) {
  const n = typeof v === 'string' ? Number(v) : v;
  return Number.isFinite(n) ? n : 0;
}

export default async function BungalowsPage({ params }: { params: { locale: string } }) {
  const bungalows = await getBungalows();

  return (
    <main className="pb-20">
      <div className="border-b border-bgl-mist/80 bg-gradient-to-b from-white/80 to-bgl-cream/30">
        <div className="bgl-container py-12 md:py-16">
          <p className="bgl-section-title">Katalog</p>
          <h1 className="bgl-heading mt-2 max-w-2xl">Bungalovlar</h1>
          <p className="mt-3 max-w-2xl text-sm text-bgl-muted md:text-base">
            Her bungalov dogal malzemeler, genis cam cepheler ve veranda odakli planlanmistir.
          </p>
        </div>
      </div>
      <div className="bgl-container mt-10 md:mt-14">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {bungalows.map((item) => (
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
                  <div className="flex h-full items-center justify-center text-bgl-muted">Gorsel</div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h2 className="text-lg font-semibold text-bgl-ink">{item.title}</h2>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-bgl-muted">{item.location}</p>
                <p className="mt-3 text-sm font-semibold text-bgl-moss">{formatPrice(item.pricePerNight)} TL / gece</p>
                <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-bgl-muted">{item.description}</p>
                <Link
                  href={`/${params.locale}/bungalows/${item.id}`}
                  className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-bgl-moss px-4 py-2 text-xs font-semibold text-white transition hover:bg-bgl-mossDark"
                >
                  Incele
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
