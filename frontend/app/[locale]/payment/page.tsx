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

export default function PaymentPage() {
  const tp = useTranslations('payment');
  const params = useParams<{ locale: string }>();
  const searchParams = useSearchParams();
  const locale = String(params.locale ?? 'tr');
  const bungalowId = searchParams.get('bungalowId') ?? '';
  const checkIn = searchParams.get('checkIn') ?? '';
  const checkOut = searchParams.get('checkOut') ?? '';
  const guests = Number(searchParams.get('guests') ?? 1);
  const rooms = Number(searchParams.get('rooms') ?? 0);
  const adults = Number(searchParams.get('adults') ?? 0);
  const children = Number(searchParams.get('children') ?? 0);
  const nights = useMemo(() => getNightCount(checkIn, checkOut), [checkIn, checkOut]);

  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function completePayment() {
    if (!bungalowId || !checkIn || !checkOut || nights <= 0) {
      setMessage(tp('missingReservation'));
      return;
    }
    if (!guestName.trim() || !guestEmail.trim()) {
      setMessage(tp('fillNameEmail'));
      return;
    }

    setLoading(true);
    setMessage('');
    const api = getApiBaseUrl();

    try {
      const bungalowRes = await fetch(`${api}/bungalows/${bungalowId}`);
      if (!bungalowRes.ok) throw new Error(tp('bungalowLoadError'));
      const bungalow = (await bungalowRes.json()) as Bungalow;
      const pricePerNight = Number(bungalow.pricePerNight ?? 0);
      const amount = Math.max(pricePerNight * nights, 0);

      const reservationRes = await fetch(`${api}/reservations/guest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bungalowId,
          checkIn,
          checkOut,
          guestName: guestName.trim(),
          guestEmail: guestEmail.trim(),
        }),
      });
      if (!reservationRes.ok) {
        const errorData = (await reservationRes.json().catch(() => null)) as { message?: string } | null;
        throw new Error(errorData?.message ?? tp('reservationCreateError'));
      }
      const reservation = (await reservationRes.json()) as { id: string };

      const initiateRes = await fetch(`${api}/payments/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservationId: reservation.id, amount, locale }),
      });
      if (!initiateRes.ok) {
        const errorData = (await initiateRes.json().catch(() => null)) as ApiErrorPayload | null;
        throw new Error(extractApiError(errorData, tp('paymentInitError')));
      }
      const paymentInit = (await initiateRes.json()) as { redirectUrl?: string };
      if (!paymentInit.redirectUrl) throw new Error(tp('gatewayError'));
      window.location.href = paymentInit.redirectUrl;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : tp('genericError'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="bgl-container max-w-2xl py-12 md:py-16">
      <p className="bgl-section-title">{tp('eyebrow')}</p>
      <h1 className="bgl-heading mt-2">{tp('title')}</h1>
      <p className="mt-2 text-sm text-bgl-muted">{tp('intro')}</p>

      <div className="mt-8 space-y-5 rounded-2xl border border-bgl-mist bg-white p-6 shadow-soft">
        <div className="grid gap-3 rounded-xl bg-bgl-cream/50 p-4 text-sm md:grid-cols-2">
          <p>
            <span className="font-semibold text-bgl-ink">{tp('checkInLabel')}:</span> {checkIn || '-'}
          </p>
          <p>
            <span className="font-semibold text-bgl-ink">{tp('checkOutLabel')}:</span> {checkOut || '-'}
          </p>
          <p>
            <span className="font-semibold text-bgl-ink">{tp('guestsLabel')}:</span> {guests || 1}
          </p>
          {rooms > 0 || adults > 0 || children > 0 ? (
            <p>
              <span className="font-semibold text-bgl-ink">{tp('roomSplitLabel')}:</span>{' '}
              {rooms > 0 ? tp('roomsCount', { count: rooms }) : '-'}
              {adults > 0 || children > 0 ? ` · ${tp('adultsChildren', { adults, children })}` : ''}
            </p>
          ) : null}
          <p>
            <span className="font-semibold text-bgl-ink">{tp('nightsLabel')}:</span> {nights}
          </p>
        </div>

        <label className="block text-xs font-medium text-bgl-muted">
          {tp('guestName')}
          <input
            className="bgl-input mt-1.5"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder={tp('guestNamePlaceholder')}
          />
        </label>

        <label className="block text-xs font-medium text-bgl-muted">
          {tp('email')}
          <input
            className="bgl-input mt-1.5"
            type="email"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            placeholder={tp('emailPlaceholder')}
          />
        </label>

        <button type="button" onClick={completePayment} disabled={loading} className="bgl-btn-primary w-full disabled:opacity-60">
          {loading ? tp('redirecting') : tp('payOnline')}
        </button>

        <Link
          href={`/${locale}/bungalows?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`}
          className="inline-flex text-sm font-semibold text-bgl-moss hover:underline"
        >
          {tp('backToBungalows')}
        </Link>

        {message ? <p className="break-words text-sm text-bgl-muted">{message}</p> : null}
      </div>
    </main>
  );
}
