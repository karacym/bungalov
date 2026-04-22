'use client';

import { useEffect, useState } from 'react';

type Row = { date: string; isAvailable: boolean };

export function AvailabilityPreview({ bungalowId }: { bungalowId: string }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';
    fetch(`${base}/availability/${bungalowId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then(setRows)
      .catch(() => setError('Müsaitlik yüklenemedi'));
  }, [bungalowId]);

  if (error) {
    return <p className="text-sm font-medium text-red-600">{error}</p>;
  }

  const next = rows.slice(0, 14);

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-7">
      {next.map((r) => (
        <div
          key={r.date}
          className={`rounded-xl border px-2 py-2.5 text-center text-xs font-medium ${
            r.isAvailable
              ? 'border-emerald-200/80 bg-emerald-50/90 text-emerald-900'
              : 'border-rose-200/80 bg-rose-50/90 text-rose-900'
          }`}
        >
          <div className="text-[11px] font-semibold uppercase tracking-wide text-bgl-muted">
            {new Date(r.date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}
          </div>
          <div className="mt-0.5">{r.isAvailable ? 'Müsait' : 'Dolu'}</div>
        </div>
      ))}
    </div>
  );
}
