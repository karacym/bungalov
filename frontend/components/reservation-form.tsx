'use client';

import { useState } from 'react';

export function ReservationForm({ bungalowId, hint }: { bungalowId?: string; hint?: string }) {
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
    <div className="space-y-4 rounded-2xl border border-bgl-mist/90 bg-gradient-to-b from-white to-bgl-cream/40 p-5 shadow-inner">
      {hint ? <p className="text-xs leading-relaxed text-bgl-muted">{hint}</p> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs font-medium text-bgl-muted">
          Giris
          <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="bgl-input mt-1.5" />
        </label>
        <label className="block text-xs font-medium text-bgl-muted">
          Cikis
          <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="bgl-input mt-1.5" />
        </label>
      </div>
      <button type="button" onClick={submit} className="bgl-btn-primary w-full sm:w-auto">
        Rezerve Et
      </button>
      {status ? (
        <p className={`text-sm font-medium ${status.includes('basarisiz') ? 'text-red-600' : 'text-bgl-moss'}`}>{status}</p>
      ) : null}
    </div>
  );
}
