import Link from 'next/link';
import { getBungalows } from '@/lib/api';

export default async function BungalowsPage({ params }: { params: { locale: string } }) {
  const bungalows = await getBungalows();

  return (
    <main className="mx-auto max-w-6xl p-4">
      <h1 className="mb-4 text-2xl font-bold">Bungalovlar</h1>
      <div className="grid gap-4 md:grid-cols-3">
        {bungalows.map((item) => (
          <article key={item.id} className="rounded-xl border bg-white p-4">
            <h2 className="font-semibold">{item.title}</h2>
            <p className="text-sm">{item.description.slice(0, 110)}...</p>
            <Link href={`/${params.locale}/bungalows/${item.id}`} className="text-forest">
              Incele
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}
