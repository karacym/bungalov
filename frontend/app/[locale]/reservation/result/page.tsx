'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function ReservationResultPage() {
  const t = useTranslations('search');
  const params = useParams<{ locale: string }>();
  const locale = String(params.locale ?? 'tr');
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const reservationId = searchParams.get('reservationId') ?? '-';

  const isPaid = status === 'paid';
  const isFailed = status === 'failed';

  return (
    <main className="bgl-container max-w-xl py-12 md:py-16">
      <div className="rounded-2xl border border-bgl-mist bg-white p-8 shadow-soft">
        <p className="bgl-section-title">{t('reservationResult')}</p>
        <h1 className="bgl-heading mt-2">
          {isPaid
            ? t('reservationPaid')
            : isFailed
              ? t('reservationFailed')
              : t('reservationSavedPending')}
        </h1>
        <p className="mt-3 text-sm text-bgl-muted">
          {t('reservationNo')}: {reservationId}
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href={`/${locale}`} className="bgl-btn-primary">{t('homeLink')}</Link>
          <Link href={`/${locale}/search`} className="bgl-btn-ghost border-bgl-moss/40 text-bgl-moss">{t('newSearch')}</Link>
        </div>
      </div>
    </main>
  );
}
