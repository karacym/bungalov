import { getBungalow } from '@/lib/api';
import { ReservationForm } from '@/components/reservation-form';

export default async function BungalowDetailPage({ params }: { params: { id: string } }) {
  const bungalow = await getBungalow(params.id);

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-4">
      <section className="rounded-xl border bg-white p-6">
        <h1 className="text-2xl font-bold">{bungalow.title}</h1>
        <p className="text-slate-700">{bungalow.description}</p>
        <p className="mt-2 font-medium">{bungalow.pricePerNight} TL / gece</p>
      </section>
      <section className="rounded-xl border bg-white p-6">
        <h2 className="mb-3 text-lg font-semibold">Rezervasyon</h2>
        <ReservationForm bungalowId={bungalow.id} />
      </section>
      <button className="fixed bottom-0 left-0 right-0 bg-forest p-4 text-white md:hidden">Hizli Rezervasyon</button>
    </main>
  );
}
