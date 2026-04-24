'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { ContactListStatus, ContactMessageRow } from './types';
import { useEffect, useMemo, useRef, useState } from 'react';

type Pagination = { page: number; limit: number; total: number; totalPages: number };

type Props = {
  items: ContactMessageRow[];
  pagination: Pagination;
  loading: boolean;
  error: string;
  onFetch: (p: { page: number; limit: number; search: string; status: ContactListStatus }) => Promise<void>;
  onMarkRead: (id: string) => Promise<void>;
  onMarkReplied: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

function statusBadge(row: ContactMessageRow) {
  if (row.isReplied) return { label: 'Yanitlandi', variant: 'success' as const };
  if (row.isRead) return { label: 'Okundu', variant: 'warning' as const };
  return { label: 'Yeni', variant: 'danger' as const };
}

export function ContactMessagesModule({
  items,
  pagination,
  loading,
  error,
  onFetch,
  onMarkRead,
  onMarkReplied,
  onDelete,
}: Props) {
  const [searchDraft, setSearchDraft] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [status, setStatus] = useState<ContactListStatus>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const appliedSearchRef = useRef(appliedSearch);
  appliedSearchRef.current = appliedSearch;

  useEffect(() => {
    void onFetch({
      page: 1,
      limit: pagination.limit,
      search: appliedSearchRef.current,
      status,
    });
  }, [status, onFetch, pagination.limit]);

  const selected = useMemo(() => items.find((r) => r.id === selectedId) ?? null, [items, selectedId]);

  async function applySearch() {
    const s = searchDraft.trim();
    setAppliedSearch(s);
    await onFetch({ page: 1, limit: pagination.limit, search: s, status });
  }

  async function goPage(page: number) {
    await onFetch({ page, limit: pagination.limit, search: appliedSearch, status });
  }

  async function runAction(id: string, kind: 'read' | 'reply' | 'delete') {
    setActionLoading(true);
    try {
      if (kind === 'read') await onMarkRead(id);
      else if (kind === 'reply') await onMarkReplied(id);
      else await onDelete(id);
      if (kind === 'delete') setSelectedId(null);
      await onFetch({
        page: pagination.page,
        limit: pagination.limit,
        search: appliedSearch,
        status,
      });
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Iletisim mesajlari</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <Input
                placeholder="Isim veya e-posta ara"
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
                className="min-h-[44px]"
              />
            </div>
            <Button type="button" variant="outline" className="min-h-[44px] shrink-0" onClick={() => void applySearch()}>
              Ara
            </Button>
            <select
              className="bgl-input min-h-[44px] shrink-0 sm:max-w-[180px]"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as ContactListStatus);
                setSelectedId(null);
              }}
            >
              <option value="all">Tumu</option>
              <option value="unread">Okunmamis</option>
              <option value="read">Okundu</option>
              <option value="replied">Yanitlandi</option>
            </select>
          </div>

          {error ? <p className="text-sm text-rose-700">{error}</p> : null}

          <div className="overflow-x-auto rounded-xl border border-bgl-mist">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="border-b border-bgl-mist bg-bgl-cream/50 text-xs font-semibold uppercase tracking-wide text-bgl-muted">
                <tr>
                  <th className="px-3 py-2">Durum</th>
                  <th className="px-3 py-2">Isim</th>
                  <th className="px-3 py-2">E-posta</th>
                  <th className="px-3 py-2">Tarih</th>
                </tr>
              </thead>
              <tbody>
                {loading && items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-8 text-center text-bgl-muted">
                      Yukleniyor...
                    </td>
                  </tr>
                ) : null}
                {!loading && items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-8 text-center text-bgl-muted">
                      Kayit yok.
                    </td>
                  </tr>
                ) : null}
                {items.map((row) => {
                  const b = statusBadge(row);
                  const unread = !row.isRead;
                  return (
                    <tr
                      key={row.id}
                      className={`cursor-pointer border-b border-bgl-mist/80 transition hover:bg-bgl-cream/40 ${
                        selectedId === row.id ? 'bg-bgl-cream/70' : ''
                      } ${unread ? 'bg-rose-50/40' : ''}`}
                    >
                      <td className="px-3 py-2.5">
                        <button type="button" className="text-left" onClick={() => setSelectedId(row.id)}>
                          <Badge variant={b.variant}>{b.label}</Badge>
                        </button>
                      </td>
                      <td className="px-3 py-2.5 font-medium text-bgl-ink">
                        <button type="button" className="text-left" onClick={() => setSelectedId(row.id)}>
                          {row.name}
                        </button>
                      </td>
                      <td className="max-w-[200px] truncate px-3 py-2.5 text-bgl-muted">
                        <button type="button" className="max-w-full truncate text-left" onClick={() => setSelectedId(row.id)}>
                          {row.email}
                        </button>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-xs text-bgl-muted">
                        <button type="button" className="text-left" onClick={() => setSelectedId(row.id)}>
                          {new Date(row.createdAt).toLocaleString('tr-TR')}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-bgl-muted">
              Toplam {pagination.total} — Sayfa {pagination.page} / {pagination.totalPages}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={loading || pagination.page <= 1}
                onClick={() => void goPage(pagination.page - 1)}
              >
                Onceki
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={loading || pagination.page >= pagination.totalPages}
                onClick={() => void goPage(pagination.page + 1)}
              >
                Sonraki
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mesaj detayi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {selected ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={statusBadge(selected).variant}>{statusBadge(selected).label}</Badge>
              </div>
              <Detail label="Isim" value={selected.name} />
              <Detail label="E-posta" value={selected.email} />
              <Detail label="Telefon" value={selected.phone || '-'} />
              <Detail label="Tarih" value={new Date(selected.createdAt).toLocaleString('tr-TR')} />
              <div className="rounded-xl border border-bgl-mist bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-bgl-muted">Mesaj</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-bgl-ink">{selected.message}</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={selected.isRead || actionLoading}
                  onClick={() => void runAction(selected.id, 'read')}
                >
                  Okundu isaretle
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={selected.isReplied || actionLoading}
                  onClick={() => void runAction(selected.id, 'reply')}
                >
                  Yanitlandi isaretle
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={actionLoading}
                  onClick={() => void runAction(selected.id, 'delete')}
                >
                  Sil
                </Button>
              </div>
            </>
          ) : (
            <p className="text-sm text-bgl-muted">Detay icin listeden bir mesaj secin.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-bgl-mist bg-white p-3">
      <p className="text-xs text-bgl-muted">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-bgl-ink">{value}</p>
    </div>
  );
}
