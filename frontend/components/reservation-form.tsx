'use client';

import { useState } from 'react';

export function ReservationForm({ bungalowId }: { bungalowId?: string }) {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  async function submit() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reservations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ bungalowId, checkIn, checkOut }),
    });

    setStatus(response.ok ? 'Rezervasyon olusturuldu' : 'Islem basarisiz');
  }

  return (
    <div className="space-y-2 rounded-xl border bg-white p-4">
      <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="w-full rounded border p-2" />
      <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="w-full rounded border p-2" />
      <button onClick={submit} className="w-full rounded bg-forest px-4 py-2 text-white">Rezerve Et</button>
      {status ? <p className="text-sm">{status}</p> : null}
    </div>
  );
}
