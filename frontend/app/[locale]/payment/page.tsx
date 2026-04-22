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
    <main className="mx-auto max-w-md space-y-3 p-4">
      <h1 className="text-2xl font-bold">Odeme</h1>
      <input className="w-full rounded border p-2" placeholder="Reservation ID" value={reservationId} onChange={(e) => setReservationId(e.target.value)} />
      <input className="w-full rounded border p-2" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
      <button onClick={initiate} className="w-full rounded bg-forest p-2 text-white">Iyzico ile Odemeye Gec</button>
      {message ? <p className="text-sm text-slate-700">{message}</p> : null}
    </main>
  );
}
