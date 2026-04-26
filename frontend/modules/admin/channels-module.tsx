'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getApiBaseUrl } from '@/lib/api';
import type { Bungalow } from './types';
import { useCallback, useMemo, useState } from 'react';

type Props = {
  bungalows: Bungalow[];
  onUpdateChannels: (bungalowId: string, externalIcalUrl: string) => Promise<unknown>;
  onEnsureIcalToken: (bungalowId: string) => Promise<string>;
  onRotateIcalToken: (bungalowId: string) => Promise<string>;
  onSyncCalendars: () => Promise<
    Array<{ ok: boolean; bungalowId: string; imported: number; skipped: number; error?: string }>
  >;
};

function exportUrl(token: string): string {
  const base = getApiBaseUrl().replace(/\/$/, '');
  return `${base}/calendar/export/${token}`;
}

export function ChannelsModule({
  bungalows,
  onUpdateChannels,
  onEnsureIcalToken,
  onRotateIcalToken,
  onSyncCalendars,
}: Props) {
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [syncBusy, setSyncBusy] = useState(false);

  const initialDrafts = useMemo(() => {
    const m: Record<string, string> = {};
    for (const b of bungalows) {
      m[b.id] = b.externalIcalUrl ?? '';
    }
    return m;
  }, [bungalows]);

  const urlFor = useCallback(
    (b: Bungalow) => drafts[b.id] ?? initialDrafts[b.id] ?? b.externalIcalUrl ?? '',
    [drafts, initialDrafts, bungalows],
  );

  async function saveRow(b: Bungalow) {
    setSavingId(b.id);
    setErr('');
    setMsg('');
    try {
      await onUpdateChannels(b.id, urlFor(b));
      setMsg('Kaydedildi.');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Kayit basarisiz');
    } finally {
      setSavingId(null);
    }
  }

  async function copyExport(b: Bungalow) {
    setErr('');
    try {
      let token = b.icalExportToken ?? '';
      if (!token) token = await onEnsureIcalToken(b.id);
      await navigator.clipboard.writeText(exportUrl(token));
      setMsg('Disa aktarma baglantisi panoya kopyalandi.');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Kopyalanamadi');
    }
  }

  async function rotate(b: Bungalow) {
    if (!window.confirm('Eski Airbnb baglantisi gecersiz olur. Devam?')) return;
    setErr('');
    try {
      await onRotateIcalToken(b.id);
      setMsg('Yeni ICS token uretildi. Airbnb tarafinda yeni URL\'yi guncelleyin.');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Islem basarisiz');
    }
  }

  async function runSync() {
    setSyncBusy(true);
    setErr('');
    setMsg('');
    try {
      const rows = await onSyncCalendars();
      const ok = rows.filter((r) => r.ok).length;
      const fail = rows.length - ok;
      setMsg(`Senkron tamamlandi: ${ok} basarili${fail ? `, ${fail} hata` : ''}.`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Senkron basarisiz');
    } finally {
      setSyncBusy(false);
    }
  }

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
          <CardTitle>Kanal yonetimi</CardTitle>
          <Button type="button" variant="secondary" disabled={syncBusy} onClick={() => void runSync()}>
            {syncBusy ? 'Senkron...' : 'Simdi senkronize et'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-bgl-muted">
          <p>
            Airbnb'deki takvim baglantisini (iCal) asagiya yapistirin. Airbnb'ye vereceginiz cikis URL'sini kopyalayin;
            bu URL yalnizca gizli token ile calisir.
          </p>
          {msg ? <p className="text-xs font-medium text-emerald-700">{msg}</p> : null}
          {err ? <p className="text-xs text-rose-700">{err}</p> : null}
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {bungalows.map((b) => (
          <Card key={b.id}>
            <CardHeader>
              <CardTitle className="text-base">{b.title}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <label className="block text-xs font-medium text-bgl-muted md:col-span-2">
                Airbnb iCal URL (iceri aktar)
                <Input
                  className="mt-1.5 font-mono text-xs"
                  value={urlFor(b)}
                  onChange={(e) => setDrafts((prev) => ({ ...prev, [b.id]: e.target.value }))}
                  placeholder="https://www.airbnb.com/calendar/ical/..."
                />
              </label>
              <div className="flex flex-wrap gap-2 md:col-span-2">
                <Button type="button" size="sm" disabled={savingId === b.id} onClick={() => void saveRow(b)}>
                  {savingId === b.id ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => void copyExport(b)}>
                  Disa ICS URL kopyala
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => void rotate(b)}>
                  Token yenile
                </Button>
              </div>
              <div className="rounded-xl border border-bgl-mist bg-bgl-cream/40 p-3 text-xs md:col-span-2">
                <p className="font-medium text-bgl-ink">Airbnb'ye yapistirilacak URL</p>
                <p className="mt-1 break-all font-mono text-bgl-muted">
                  {b.icalExportToken ? exportUrl(b.icalExportToken) : '(Token yok — kopyala ile uretilir)'}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
