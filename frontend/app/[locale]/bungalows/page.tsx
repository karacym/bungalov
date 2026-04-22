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
    <main className="mx-auto max-w-6xl p-4 pb-12">
      <h1 className="mb-4 text-2xl font-bold">Bungalovlar</h1>
      <div className="grid gap-4 md:grid-cols-3">
        {bungalows.map((item) => (
          <article key={item.id} className="overflow-hidden rounded-xl border bg-white shadow-sm">
            {item.images[0] ? (
              <div className="relative aspect-[16/10] w-full">
                <Image src={item.images[0]} alt={item.title} fill className="object-cover" sizes="(max-width:768px) 100vw, 33vw" />
              </div>
            ) : null}
            <div className="p-4">
              <h2 className="font-semibold">{item.title}</h2>
              <p className="text-sm text-slate-600">{item.location}</p>
              <p className="mt-1 text-sm font-medium text-forest">{formatPrice(item.pricePerNight)} TL / gece</p>
              <p className="mt-2 line-clamp-3 text-sm text-slate-700">{item.description}</p>
              <Link href={`/${params.locale}/bungalows/${item.id}`} className="mt-3 inline-block text-forest">
                Incele
              </Link>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
