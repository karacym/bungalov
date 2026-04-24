'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { getApiBaseUrl } from '@/lib/api';

type Bungalow = {
  id: string;
  title: string;
  pricePerNight: number | string;
};

type ApiErrorPayload = {
  message?: string | string[];
  error?: string;
};

function extractApiError(payload: ApiErrorPayload | null, fallback: string) {
  if (!payload) return fallback;
  if (Array.isArray(payload.message) && payload.message.length > 0) {
    return payload.message.join(', ');
  }
  if (typeof payload.message === 'string' && payload.message.trim()) {
    return payload.message;
  }
  if (typeof payload.error === 'string' && payload.error.trim()) {
    return payload.error;
  }
  return fallback;
}

function getNightCount(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return 0;
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export default function ReservationPage() {
  const t = useTranslations('search');
  const params = useParams<{ locale: string }>();
  const searchParams = useSearchParams();
  const locale = String(params.locale ?? 'tr');
  const bungalowId = searchParams.get('bungalowId') ?? '';
  const checkIn = searchParams.get('checkIn') ?? '';
  const checkOut = searchParams.get('checkOut') ?? '';
  const guests = Number(searchParams.get('guests') ?? 1);
  const nights = useMemo(() => getNightCount(checkIn, checkOut), [checkIn, checkOut]);

  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function createReservation(payNow: boolean) {
    if (!bungalowId || !checkIn || !checkOut || nights <= 0) {
      setMessage(t('invalidInfo'));
      return;
    }
    if (!guestName.trim() || !guestEmail.trim() || !phone.trim()) {
      setMessage(t('fillContact'));
      return;
    }

    setLoading(true);
    setMessage('');
    const api = getApiBaseUrl();

    try {
      const bungalowRes = await fetch(`${api}/bungalows/${bungalowId}`);
      if (!bungalowRes.ok) throw new Error(t('bungalowLoadError'));
      const bungalow = (await bungalowRes.json()) as Bungalow;
      const nightly = Number(bungalow.pricePerNight ?? 0);
      const total = Math.max(nightly * nights, 0);

      const reservationRes = await fetch(`${api}/reservations/guest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bungalowId,
          checkIn,
          checkOut,
          guestName: `${guestName.trim()} (${phone.trim()})`,
          guestEmail: guestEmail.trim(),
          guests,
        }),
      });
      if (!reservationRes.ok) {
        const errorData = (await reservationRes.json().catch(() => null)) as { message?: string } | null;
        throw new Error(errorData?.message ?? t('reservationCreateError'));
      }
      const reservation = (await reservationRes.json()) as { id: string };

      if (!payNow) {
        window.location.href = `/${locale}/reservation/result?status=pending&reservationId=${reservation.id}`;
        return;
      }

      const initiateRes = await fetch(`${api}/payments/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservationId: reservation.id,
          amount: total,
          locale,
        }),
      });
      if (!initiateRes.ok) {
        const errorData = (await initiateRes.json().catch(() => null)) as ApiErrorPayload | null;
        throw new Error(extractApiError(errorData, t('paymentInitError')));
      }
      const paymentInit = (await initiateRes.json()) as { redirectUrl?: string };
      if (!paymentInit.redirectUrl) throw new Error(t('gatewayError'));
      window.location.href = paymentInit.redirectUrl;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t('unknownError'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="bgl-container max-w-2xl py-12 md:py-16">
      <p className="bgl-section-title">{t('reservationTitle')}</p>
      <h1 className="bgl-heading mt-2">{t('continueReservation')}</h1>

      <div className="mt-6 space-y-5 rounded-2xl border border-bgl-mist bg-white p-6 shadow-soft">
        <div className="grid gap-3 rounded-xl bg-bgl-cream/50 p-4 text-sm md:grid-cols-2">
          <p>
            <span className="font-semibold text-bgl-ink">{t('checkIn')}:</span> {checkIn || '-'}
          </p>
          <p>
            <span className="font-semibold text-bgl-ink">{t('checkOut')}:</span> {checkOut || '-'}
          </p>
          <p>
            <span className="font-semibold text-bgl-ink">{t('guests')}:</span> {guests}
          </p>
          <p>
            <span className="font-semibold text-bgl-ink">{t('nights')}:</span> {nights}
          </p>
        </div>

        <label className="block text-xs font-medium text-bgl-muted">
          {t('name')}
          <input
            className="bgl-input mt-1.5"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder={t('name')}
          />
        </label>
        <label className="block text-xs font-medium text-bgl-muted">
          {t('email')}
          <input
            className="bgl-input mt-1.5"
            type="email"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            placeholder={t('emailPlaceholder')}
          />
        </label>
        <label className="block text-xs font-medium text-bgl-muted">
          {t('phone')}
          <input
            className="bgl-input mt-1.5"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t('phonePlaceholder')}
          />
        </label>

        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => void createReservation(true)}
            disabled={loading}
            className="bgl-btn-primary w-full disabled:opacity-60"
          >
            {t('payNow')}
          </button>
          <button
            type="button"
            onClick={() => void createReservation(false)}
            disabled={loading}
            className="bgl-btn-ghost w-full border border-bgl-moss/40 text-bgl-moss disabled:opacity-60"
          >
            {t('payLater')}
          </button>
        </div>

        <Link
          href={`/${locale}/search?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`}
          className="inline-flex text-sm font-semibold text-bgl-moss hover:underline"
        >
          {t('backToSearch')}
        </Link>

        {message ? <p className="text-sm text-rose-700">{message}</p> : null}
      </div>
    </main>
  );
}
