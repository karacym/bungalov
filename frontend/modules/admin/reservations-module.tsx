'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { Bungalow, Reservation, ReservationSource, ReservationStatus } from './types';
import { type FormEvent, useMemo, useState } from 'react';

type ManualPayload = {
  bungalowId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  guestName: string;
  guestEmail: string;
  status: 'pending' | 'paid' | 'cancelled';
};

type Props = {
  items: Reservation[];
  bungalows: Bungalow[];
  onChange: (items: Reservation[]) => void;
  onPersistStatus?: (id: string, status: ReservationStatus) => Promise<void>;
  onCreateManual?: (payload: ManualPayload) => Promise<unknown>;
};

export function ReservationsModule({
  items,
  bungalows,
  onChange,
  onPersistStatus,
  onCreateManual,
}: Props) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | ReservationStatus>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [manualBungalowId, setManualBungalowId] = useState('');
  const [manualCheckIn, setManualCheckIn] = useState('');
  const [manualCheckOut, setManualCheckOut] = useState('');
  const [manualGuests, setManualGuests] = useState(2);
  const [manualGuestName, setManualGuestName] = useState('');
  const [manualGuestEmail, setManualGuestEmail] = useState('');
  const [manualStatus, setManualStatus] = useState<'pending' | 'paid' | 'cancelled'>('paid');
  const [manualSaving, setManualSaving] = useState(false);
  const [manualError, setManualError] = useState('');
  const [manualOk, setManualOk] = useState('');

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        item.customerName.toLowerCase().includes(search.toLowerCase()) ||
        item.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
        item.bungalowName.toLowerCase().includes(search.toLowerCase());
      const matchStatus = status === 'all' ? true : item.status === status;
      return matchSearch && matchStatus;
    });
  }, [items, search, status]);

  const selected = filtered.find((item) => item.id === selectedId) ?? null;

  async function updateStatus(id: string, next: ReservationStatus) {
    const current = items.find((item) => item.id === id);
    if (current?.source === 'AIRBNB') return;
    onChange(items.map((item) => (item.id === id ? { ...item, status: next } : item)));
    if (!onPersistStatus) return;

    setSaving(true);
    setSaveError('');
    try {
      await onPersistStatus(id, next);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Durum guncellenemedi');
    } finally {
      setSaving(false);
    }
  }

  async function submitManual(e: FormEvent) {
    e.preventDefault();
    setManualError('');
    setManualOk('');
    if (!onCreateManual) return;
    if (!manualBungalowId || !manualCheckIn || !manualCheckOut || !manualGuestEmail.trim()) {
      setManualError('Bungalov, tarihler ve e-posta zorunludur.');
      return;
    }
    setManualSaving(true);
    try {
      await onCreateManual({
        bungalowId: manualBungalowId,
        checkIn: manualCheckIn,
        checkOut: manualCheckOut,
        guests: Math.max(1, manualGuests),
        guestName: manualGuestName.trim() || 'Misafir',
        guestEmail: manualGuestEmail.trim(),
        status: manualStatus,
      });
      setManualOk('Rezervasyon kaydedildi.');
      setManualCheckIn('');
      setManualCheckOut('');
      setManualGuestName('');
      setManualGuestEmail('');
      setManualGuests(2);
    } catch (err) {
      setManualError(err instanceof Error ? err.message : 'Kayit olusturulamadi');
    } finally {
      setManualSaving(false);
    }
  }

  return (
    <div className="grid gap-4">
      {onCreateManual ? (
        <Card>
          <CardHeader>
            <CardTitle>Manuel rezervasyon</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(ev) => void submitManual(ev)} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <label className="block text-xs font-medium text-bgl-muted sm:col-span-2 lg:col-span-3">
                Bungalov
                <select
                  className="bgl-input mt-1.5 w-full"
                  value={manualBungalowId}
                  onChange={(e) => setManualBungalowId(e.target.value)}
                  required
                >
                  <option value="">Secin</option>
                  {bungalows.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-medium text-bgl-muted">
                Giris
                <Input
                  type="date"
                  className="mt-1.5"
                  value={manualCheckIn}
                  onChange={(e) => setManualCheckIn(e.target.value)}
                  required
                />
              </label>
              <label className="block text-xs font-medium text-bgl-muted">
                Cikis
                <Input
                  type="date"
                  className="mt-1.5"
                  value={manualCheckOut}
                  onChange={(e) => setManualCheckOut(e.target.value)}
                  required
                />
              </label>
              <label className="block text-xs font-medium text-bgl-muted">
                Misafir sayisi
                <Input
                  type="number"
                  min={1}
                  className="mt-1.5"
                  value={manualGuests}
                  onChange={(e) => setManualGuests(Number(e.target.value))}
                />
              </label>
              <label className="block text-xs font-medium text-bgl-muted">
                Misafir adi
                <Input
                  className="mt-1.5"
                  value={manualGuestName}
                  onChange={(e) => setManualGuestName(e.target.value)}
                  placeholder="Ad Soyad"
                />
              </label>
              <label className="block text-xs font-medium text-bgl-muted">
                E-posta
                <Input
                  type="email"
                  className="mt-1.5"
                  value={manualGuestEmail}
                  onChange={(e) => setManualGuestEmail(e.target.value)}
                  required
                />
              </label>
              <label className="block text-xs font-medium text-bgl-muted">
                Durum
                <select
                  className="bgl-input mt-1.5 w-full"
                  value={manualStatus}
                  onChange={(e) => setManualStatus(e.target.value as 'pending' | 'paid' | 'cancelled')}
                >
                  <option value="paid">Odendi (kayit)</option>
                  <option value="pending">Beklemede</option>
                  <option value="cancelled">Iptal</option>
                </select>
              </label>
              <div className="flex items-end sm:col-span-2 lg:col-span-3">
                <Button type="submit" disabled={manualSaving} className="w-full sm:w-auto">
                  {manualSaving ? 'Kaydediliyor...' : 'Rezervasyon olustur'}
                </Button>
              </div>
            </form>
            {manualOk ? <p className="mt-2 text-xs font-medium text-emerald-700">{manualOk}</p> : null}
            {manualError ? <p className="mt-2 text-xs text-rose-700">{manualError}</p> : null}
            <p className="mt-2 text-xs text-bgl-muted">
              Gecmis konaklamalar dahil tarih girebilirsiniz; odeme kaydi olusturulmaz. Normal sitede giris tarihi
              bugunden once olamaz.
            </p>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Rezervasyonlar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2 md:grid-cols-2">
              <Input
                placeholder="Misafir veya bungalov ara"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                className="bgl-input"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'all' | ReservationStatus)}
              >
                <option value="all">Tum durumlar</option>
                <option value="pending">Beklemede</option>
                <option value="approved">Onaylandi</option>
                <option value="cancelled">Iptal</option>
              </select>
            </div>

            <div className="space-y-2">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={`w-full rounded-xl border p-3 text-left transition ${
                    selectedId === item.id
                      ? 'border-bgl-moss bg-bgl-cream/60'
                      : 'border-bgl-mist bg-white hover:border-bgl-sand'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-bgl-ink">{item.customerName}</p>
                      <p className="text-xs text-bgl-muted">{item.bungalowName}</p>
                      <SourceTag source={item.source} />
                    </div>
                    <Badge
                      variant={
                        item.status === 'approved'
                          ? 'success'
                          : item.status === 'cancelled'
                            ? 'danger'
                            : 'warning'
                      }
                    >
                      {item.status === 'approved'
                        ? 'Onaylandi'
                        : item.status === 'cancelled'
                          ? 'Iptal'
                          : 'Beklemede'}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rezervasyon Detayi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selected ? (
              <>
                <DetailRow label="Misafir" value={selected.customerName} />
                <DetailRow label="E-posta" value={selected.customerEmail} />
                <DetailRow label="Bungalov" value={selected.bungalowName} />
                <DetailRow
                  label="Tarihler"
                  value={`${new Date(selected.checkIn).toLocaleDateString('tr-TR')} - ${new Date(
                    selected.checkOut,
                  ).toLocaleDateString('tr-TR')}`}
                />
                <DetailRow
                  label="Odeme"
                  value={`${selected.amount.toLocaleString('tr-TR')} TL (${selected.paymentStatus})`}
                />
                <DetailRow label="Kaynak" value={sourceLabel(selected.source)} />

                {selected.source === 'AIRBNB' ? (
                  <p className="text-xs text-bgl-muted">
                    Bu kayit Airbnb iCal senkronu ile geldi. Durum degisikligi yapmak icin once Airbnb
                    tarafini guncelleyin veya senkronu bekleyin.
                  </p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-3">
                    <Button
                      variant="secondary"
                      disabled={saving}
                      onClick={() => void updateStatus(selected.id, 'approved')}
                    >
                      Onayla
                    </Button>
                    <Button
                      variant="outline"
                      disabled={saving}
                      onClick={() => void updateStatus(selected.id, 'pending')}
                    >
                      Beklemede
                    </Button>
                    <Button
                      variant="destructive"
                      disabled={saving}
                      onClick={() => void updateStatus(selected.id, 'cancelled')}
                    >
                      Iptal et
                    </Button>
                  </div>
                )}
                {saving ? <p className="text-xs text-bgl-muted">Guncelleniyor...</p> : null}
                {saveError ? <p className="text-xs text-rose-700">{saveError}</p> : null}
              </>
            ) : (
              <p className="text-sm text-bgl-muted">Detay gormek icin bir rezervasyon sec.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function sourceLabel(s: ReservationSource): string {
  if (s === 'AIRBNB') return 'Airbnb';
  if (s === 'BOOKING') return 'Booking.com';
  return 'Web / manuel';
}

function SourceTag({ source }: { source: ReservationSource }) {
  const isAirbnb = source === 'AIRBNB';
  return (
    <span
      className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
        isAirbnb ? 'bg-orange-100 text-orange-900' : 'bg-bgl-mist text-bgl-muted'
      }`}
    >
      {sourceLabel(source)}
    </span>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-bgl-mist bg-white p-3">
      <p className="text-xs text-bgl-muted">{label}</p>
      <p className="text-sm font-semibold text-bgl-ink">{value}</p>
    </div>
  );
}
