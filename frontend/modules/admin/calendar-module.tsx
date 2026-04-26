'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Bungalow, ReservationSource } from './types';
import { useCallback, useEffect, useMemo, useState } from 'react';

type CalEvent = {
  id: string;
  checkIn: string;
  checkOut: string;
  source: ReservationSource;
  status: string;
  guestName: string;
};

type Props = {
  bungalows: Bungalow[];
  fetchCalendarEvents: (bungalowId: string, from: string, to: string) => Promise<{ events: CalEvent[] }>;
};

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function coversDay(checkIn: string, checkOut: string, dayKey: string): boolean {
  const ci = checkIn.slice(0, 10);
  const co = checkOut.slice(0, 10);
  return dayKey >= ci && dayKey < co;
}

export function CalendarModule({ bungalows, fetchCalendarEvents }: Props) {
  const [selectedBungalowId, setSelectedBungalowId] = useState<string>(bungalows[0]?.id ?? '');
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadErr, setLoadErr] = useState('');

  const range = useMemo(() => {
    const now = new Date();
    const from = ymd(now);
    const end = new Date(now);
    end.setDate(end.getDate() + 42);
    const to = ymd(end);
    return { from, to };
  }, []);

  const load = useCallback(async () => {
    if (!selectedBungalowId) return;
    setLoading(true);
    setLoadErr('');
    try {
      const res = await fetchCalendarEvents(selectedBungalowId, range.from, range.to);
      setEvents(res.events ?? []);
    } catch (e) {
      setLoadErr(e instanceof Error ? e.message : 'Takvim alinamadi');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [fetchCalendarEvents, range.from, range.to, selectedBungalowId]);

  useEffect(() => {
    void load();
  }, [load]);

  const days = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 42 }, (_, idx) => {
      const date = new Date(now);
      date.setDate(now.getDate() + idx);
      const key = ymd(date);
      return { key, day: date.getDate(), month: date.getMonth() + 1 };
    });
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rezervasyon takvimi</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 md:grid-cols-2">
          <select
            className="bgl-input"
            value={selectedBungalowId}
            onChange={(e) => setSelectedBungalowId(e.target.value)}
          >
            {bungalows.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
          <p className="text-xs text-bgl-muted md:self-center">
            Airbnb kayitlari turuncu; web/manuel pembe. Airbnb gunleri salt okunur (ana kaynak dis platform).
          </p>
        </div>

        {loadErr ? <p className="text-xs text-rose-700">{loadErr}</p> : null}
        {loading ? <p className="text-xs text-bgl-muted">Yukleniyor...</p> : null}

        <div className="grid grid-cols-7 gap-2">
          {days.map((item) => {
            const dayEvents = events.filter((ev) => coversDay(ev.checkIn, ev.checkOut, item.key));
            const hasAirbnb = dayEvents.some((ev) => ev.source === 'AIRBNB');
            const hasDirect = dayEvents.some((ev) => ev.source === 'DIRECT' || ev.source === 'BOOKING');
            const palette = hasAirbnb
              ? 'border-orange-300 bg-orange-50'
              : hasDirect
                ? 'border-rose-200 bg-rose-50'
                : 'border-emerald-200 bg-emerald-50';
            return (
              <div key={item.key} className={`rounded-xl border p-2 text-left ${palette}`}>
                <p className="text-sm font-semibold text-bgl-ink">{item.day}</p>
                <p className="text-[10px] text-bgl-muted">{item.month}. ay</p>
                {dayEvents.length > 0 ? (
                  <p className="mt-1 text-[9px] font-medium text-bgl-ink">
                    {hasAirbnb ? 'Airbnb' : ''}
                    {hasAirbnb && hasDirect ? ' · ' : ''}
                    {hasDirect ? 'Web' : ''}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge className="border-orange-200 bg-orange-100 text-orange-900">Airbnb</Badge>
          <Badge variant="danger">Web / manuel</Badge>
          <Badge variant="success">Musait</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
