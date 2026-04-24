'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { getApiBaseUrl } from '@/lib/api';

type Row = { date: string; isAvailable: boolean };

function toLocalDateKey(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function localTodayKey(): string {
  const n = new Date();
  const y = n.getFullYear();
  const m = `${n.getMonth() + 1}`.padStart(2, '0');
  const d = `${n.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Ayni takvim gunune denk gelen birden fazla UTC satirini tekillestirir; biri dolu ise gun dolu sayilir. */
function mergeByLocalCalendarDay(rows: Row[]): Array<{ dateKey: string; isAvailable: boolean }> {
  const map = new Map<string, boolean>();
  for (const r of rows) {
    const key = toLocalDateKey(r.date);
    const prev = map.get(key);
    if (prev === undefined) {
      map.set(key, r.isAvailable);
    } else {
      map.set(key, prev && r.isAvailable);
    }
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateKey, isAvailable]) => ({ dateKey, isAvailable }));
}

function resolveIntlLocale(locale: string) {
  if (locale.startsWith('tr')) return 'tr-TR';
  if (locale.startsWith('ar')) return 'ar-SA';
  return 'en-GB';
}

function formatDayLabel(dateKey: string, locale: string) {
  const [y, m, d] = dateKey.split('-').map(Number);
  if (!y || !m || !d) return dateKey;
  const local = new Date(y, m - 1, d);
  return local.toLocaleDateString(resolveIntlLocale(locale), {
    day: '2-digit',
    month: 'short',
  });
}

type Props = {
  bungalowId: string;
  locale?: string;
};

export function AvailabilityPreview({ bungalowId, locale = 'tr' }: Props) {
  const t = useTranslations('bungalow');
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${getApiBaseUrl()}/availability/${bungalowId}`, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then(setRows)
      .catch(() => {
        if (controller.signal.aborted) return;
        setError(t('availabilityLoadError'));
      });
    return () => controller.abort();
  }, [bungalowId, t]);

  const merged = useMemo(() => {
    const today = localTodayKey();
    return mergeByLocalCalendarDay(rows).filter((r) => r.dateKey >= today);
  }, [rows]);
  const next = merged.slice(0, 14);

  if (error) {
    return <p className="text-sm font-medium text-red-600">{error}</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-7">
      {next.map((r) => (
        <div
          key={r.dateKey}
          className={`rounded-xl border px-2 py-2.5 text-center text-xs font-medium ${
            r.isAvailable
              ? 'border-emerald-200/80 bg-emerald-50/90 text-emerald-900'
              : 'border-rose-200/80 bg-rose-50/90 text-rose-900'
          }`}
        >
          <div className="text-[11px] font-semibold uppercase tracking-wide text-bgl-muted">
            {formatDayLabel(r.dateKey, locale)}
          </div>
          <div className="mt-0.5">{r.isAvailable ? t('dayAvailable') : t('dayUnavailable')}</div>
        </div>
      ))}
    </div>
  );
}
