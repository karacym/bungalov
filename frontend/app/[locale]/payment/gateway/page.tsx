'use client';

import { useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { getApiBaseUrl } from '@/lib/api';

export default function PaymentGatewayPage() {
  const t = useTranslations('search');
  const params = useParams<{ locale: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = String(params.locale ?? 'tr');
  const reservationId = searchParams.get('reservationId') ?? '';
  const amount = searchParams.get('amount') ?? '0';
  const provider = searchParams.get('provider') ?? 'iyzico';

  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function approvePayment() {
    if (!reservationId) {
      setError(t('reservationNotFound'));
      return;
    }
    if (!cardHolder.trim() || cardNumber.replace(/\s/g, '').length < 12 || !expiry.trim() || cvv.trim().length < 3) {
      setError(t('fillCardInfo'));
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${getApiBaseUrl()}/payments/callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservationId,
          paymentStatus: 'success',
        }),
      });
      if (!response.ok) {
        throw new Error(t('paymentApproveError'));
      }
      router.replace(`/${locale}/reservation/result?status=paid&reservationId=${reservationId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('gatewayProcessError'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="bgl-container max-w-xl py-10 md:py-14">
      <p className="bgl-section-title uppercase">{provider}</p>
      <h1 className="bgl-heading mt-2">{t('securePayment')}</h1>

      <div className="mt-6 space-y-4 rounded-2xl border border-bgl-mist bg-white p-6 shadow-soft">
        <div className="rounded-lg bg-bgl-cream/60 px-3 py-2 text-sm">
          {t('amountToPay')}: <span className="font-semibold">{amount} TL</span>
        </div>

        <label className="block text-xs font-medium text-bgl-muted">
          {t('cardHolder')}
          <input
            className="bgl-input mt-1.5"
            value={cardHolder}
            onChange={(e) => setCardHolder(e.target.value)}
            placeholder="AD SOYAD"
          />
        </label>

        <label className="block text-xs font-medium text-bgl-muted">
          {t('cardNumber')}
          <input
            className="bgl-input mt-1.5"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            placeholder="0000 0000 0000 0000"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs font-medium text-bgl-muted">
            {t('expiry')}
            <input
              className="bgl-input mt-1.5"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              placeholder="12/29"
            />
          </label>
          <label className="block text-xs font-medium text-bgl-muted">
            {t('cvvLabel')}
            <input
              className="bgl-input mt-1.5"
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
              placeholder="123"
            />
          </label>
        </div>

        <button type="button" onClick={approvePayment} disabled={loading} className="bgl-btn-primary w-full disabled:opacity-60">
          {loading ? t('processingPayment') : t('completePayment')}
        </button>
        {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      </div>
    </main>
  );
}
