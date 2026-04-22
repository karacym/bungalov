'use client';

import { useState } from 'react';

export default function PaymentPage() {
  const [reservationId, setReservationId] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');

  async function initiate() {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reservationId, amount: Number(amount) }),
    });
    const data = await response.json();
    setMessage(data.redirectUrl ?? 'Basarisiz islem');
  }

  return (
    <main className="bgl-container max-w-lg py-12 md:py-16">
      <p className="bgl-section-title">Odeme</p>
      <h1 className="bgl-heading mt-2">Guvenli odeme</h1>
      <p className="mt-2 text-sm text-bgl-muted">Iyzico entegrasyonu icin hazir akis. Test icin rezervasyon ID ve tutar girin.</p>
      <div className="mt-8 space-y-4 rounded-2xl border border-bgl-mist bg-white p-6 shadow-soft">
        <label className="block text-xs font-medium text-bgl-muted">
          Rezervasyon ID
          <input
            className="bgl-input mt-1.5"
            value={reservationId}
            onChange={(e) => setReservationId(e.target.value)}
            placeholder="uuid..."
          />
        </label>
        <label className="block text-xs font-medium text-bgl-muted">
          Tutar (TL)
          <input className="bgl-input mt-1.5" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
        </label>
        <button type="button" onClick={initiate} className="bgl-btn-primary w-full">
          Iyzico ile odemeye gec
        </button>
        {message ? <p className="break-all text-sm text-bgl-muted">{message}</p> : null}
      </div>
    </main>
  );
}
