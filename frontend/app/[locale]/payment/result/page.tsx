'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';

export default function PaymentResultPage() {
  const params = useParams<{ locale: string }>();
  const searchParams = useSearchParams();
  const locale = String(params.locale ?? 'tr');
  const status = searchParams.get('status');
  const reservationId = searchParams.get('reservationId') ?? '-';
  const success = status === 'success';

  return (
    <main className="bgl-container max-w-xl py-12 md:py-16">
      <div className="rounded-2xl border border-bgl-mist bg-white p-8 shadow-soft">
        <p className="bgl-section-title">Odeme Sonucu</p>
        <h1 className="bgl-heading mt-2">
          {success ? 'Odeme basariyla tamamlandi' : 'Odeme basarisiz'}
        </h1>
        <p className="mt-3 text-sm text-bgl-muted">Rezervasyon No: {reservationId}</p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link href={`/${locale}`} className="bgl-btn-primary">
            Ana sayfaya don
          </Link>
          <Link href={`/${locale}/bungalows`} className="bgl-btn-ghost border-bgl-moss/40 text-bgl-moss">
            Bungalovlari gor
          </Link>
        </div>
      </div>
    </main>
  );
}
