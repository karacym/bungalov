'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Bungalow } from './types';
import { useMemo, useState } from 'react';

type CalendarStatus = 'available' | 'blocked' | 'reserved';

type Props = {
  bungalows: Bungalow[];
};

export function CalendarModule({ bungalows }: Props) {
  const [selectedBungalowId, setSelectedBungalowId] = useState<string>(bungalows[0]?.id ?? '');
  const [dateStatuses, setDateStatuses] = useState<Record<string, CalendarStatus>>({});
  const [selectedStatus, setSelectedStatus] = useState<CalendarStatus>('blocked');

  const days = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 42 }, (_, idx) => {
      const date = new Date(now);
      date.setDate(now.getDate() + idx);
      const key = date.toISOString().slice(0, 10);
      return { key, day: date.getDate(), month: date.getMonth() + 1 };
    });
  }, []);

  function markDate(dateKey: string) {
    const mapKey = `${selectedBungalowId}:${dateKey}`;
    const current = dateStatuses[mapKey];
    if (current === 'reserved' && selectedStatus !== 'reserved') return;
    setDateStatuses((prev) => ({ ...prev, [mapKey]: selectedStatus }));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Musaitlik Takvimi</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 md:grid-cols-3">
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
          <div className="flex gap-2 md:col-span-2">
            {(['available', 'blocked', 'reserved'] as const).map((status) => (
              <Button
                key={status}
                variant={selectedStatus === status ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setSelectedStatus(status)}
              >
                {status === 'available' ? 'Musait' : status === 'blocked' ? 'Bloke' : 'Rezerve'}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((item) => {
            const key = `${selectedBungalowId}:${item.key}`;
            const status = dateStatuses[key] ?? 'available';
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => markDate(item.key)}
                className={`rounded-xl border p-2 text-left ${
                  status === 'available'
                    ? 'border-emerald-200 bg-emerald-50'
                    : status === 'blocked'
                      ? 'border-amber-200 bg-amber-50'
                      : 'border-rose-200 bg-rose-50'
                }`}
              >
                <p className="text-sm font-semibold text-bgl-ink">{item.day}</p>
                <p className="text-[10px] text-bgl-muted">{item.month}. ay</p>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="success">musait</Badge>
          <Badge variant="warning">bloke</Badge>
          <Badge variant="danger">rezerve</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
