'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Stats = { users: number; bungalows: number; reservations: number; paidReservations: number };
type Tab = 'stats' | 'bungalows' | 'reservations' | 'availability' | 'translations';
type Bungalow = {
  id: string;
  title: string;
  description: string;
  location: string;
  pricePerNight: number;
};
type Reservation = {
  id: string;
  status: 'pending' | 'paid' | 'cancelled';
  totalPrice: string;
  user?: { email: string };
  bungalow?: { title: string };
};
type ReservationResponse = {
  items: Reservation[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
};
type Translation = { key: string; tr: string; en: string; ar: string };

export default function AdminDashboardPage() {
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const [stats, setStats] = useState<Stats | null>(null);
  const [tab, setTab] = useState<Tab>('stats');
  const [bungalows, setBungalows] = useState<Bungalow[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [availability, setAvailability] = useState<{ date: string; isAvailable: boolean }[]>([]);
  const [selectedBungalowId, setSelectedBungalowId] = useState('');
  const [loading, setLoading] = useState(false);

  const [editingBungalowId, setEditingBungalowId] = useState<string | null>(null);
  const [editBungalow, setEditBungalow] = useState({
    title: '',
    description: '',
    location: '',
    pricePerNight: '',
    images: '',
    features: '{}',
  });

  const [newBungalow, setNewBungalow] = useState({
    title: '',
    description: '',
    location: '',
    pricePerNight: '',
    images: '',
    features: '{}',
  });
  const [newTranslation, setNewTranslation] = useState({ key: '', tr: '', en: '', ar: '' });
  const [availabilityForm, setAvailabilityForm] = useState({ date: '', isAvailable: true });

  const [reservationPage, setReservationPage] = useState(1);
  const [reservationLimit] = useState(10);
  const [reservationTotalPages, setReservationTotalPages] = useState(1);
  const [reservationStatusFilter, setReservationStatusFilter] = useState<'all' | Reservation['status']>('all');
  const [reservationSearch, setReservationSearch] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
      router.replace(`/${params.locale}/admin/login`);
    }
  }, [router, params.locale]);

  useEffect(() => {
    void refreshAll();
  }, [reservationPage, reservationLimit, reservationStatusFilter, reservationSearch]);

  async function authFetch(path: string, init?: RequestInit) {
    const token = localStorage.getItem('token');
    return fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(init?.headers ?? {}),
      },
    });
  }

  async function refreshAll() {
    setLoading(true);
    try {
      const reservationParams = new URLSearchParams({
        page: String(reservationPage),
        limit: String(reservationLimit),
      });
      if (reservationStatusFilter !== 'all') {
        reservationParams.set('status', reservationStatusFilter);
      }
      if (reservationSearch.trim()) {
        reservationParams.set('search', reservationSearch.trim());
      }

      const [statsRes, bungalowsRes, reservationsRes, translationsRes] = await Promise.all([
        authFetch('/admin/stats'),
        authFetch('/admin/bungalows'),
        authFetch(`/admin/reservations?${reservationParams.toString()}`),
        authFetch('/admin/translations'),
      ]);
      setStats(await statsRes.json());
      const bungalowData: Bungalow[] = await bungalowsRes.json();
      setBungalows(bungalowData);
      const reservationData: ReservationResponse = await reservationsRes.json();
      setReservations(reservationData.items);
      setReservationTotalPages(reservationData.pagination.totalPages);
      setTranslations(await translationsRes.json());
      if (!selectedBungalowId && bungalowData.length > 0) {
        setSelectedBungalowId(bungalowData[0].id);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!selectedBungalowId) return;
    authFetch(`/admin/availability/${selectedBungalowId}`)
      .then((res) => res.json())
      .then(setAvailability)
      .catch(() => setAvailability([]));
  }, [selectedBungalowId]);

  async function createBungalow() {
    await authFetch('/admin/bungalows', {
      method: 'POST',
      body: JSON.stringify({
        title: newBungalow.title,
        description: newBungalow.description,
        location: newBungalow.location,
        pricePerNight: Number(newBungalow.pricePerNight),
        images: newBungalow.images.split(',').map((i) => i.trim()).filter(Boolean),
        features: JSON.parse(newBungalow.features || '{}'),
      }),
    });
    setNewBungalow({ title: '', description: '', location: '', pricePerNight: '', images: '', features: '{}' });
    await refreshAll();
  }

  function startEditBungalow(bungalow: Bungalow) {
    setEditingBungalowId(bungalow.id);
    setEditBungalow({
      title: bungalow.title,
      description: bungalow.description,
      location: bungalow.location,
      pricePerNight: String(bungalow.pricePerNight),
      images: '',
      features: '{}',
    });
  }

  async function saveEditBungalow() {
    if (!editingBungalowId) return;
    await authFetch(`/admin/bungalows/${editingBungalowId}`, {
      method: 'PUT',
      body: JSON.stringify({
        title: editBungalow.title,
        description: editBungalow.description,
        location: editBungalow.location,
        pricePerNight: Number(editBungalow.pricePerNight),
        images: editBungalow.images
          ? editBungalow.images.split(',').map((i) => i.trim()).filter(Boolean)
          : undefined,
        features: editBungalow.features ? JSON.parse(editBungalow.features) : undefined,
      }),
    });
    setEditingBungalowId(null);
    await refreshAll();
  }

  async function deleteBungalow(id: string) {
    await authFetch(`/admin/bungalows/${id}`, { method: 'DELETE' });
    await refreshAll();
  }

  async function updateReservation(id: string, status: Reservation['status']) {
    await authFetch(`/admin/reservations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    await refreshAll();
  }

  async function saveAvailability() {
    if (!selectedBungalowId) return;
    await authFetch(`/admin/availability/${selectedBungalowId}`, {
      method: 'PATCH',
      body: JSON.stringify(availabilityForm),
    });
    const next = await authFetch(`/admin/availability/${selectedBungalowId}`);
    setAvailability(await next.json());
  }

  async function upsertTranslation() {
    await authFetch('/admin/translations', {
      method: 'PATCH',
      body: JSON.stringify(newTranslation),
    });
    setNewTranslation({ key: '', tr: '', en: '', ar: '' });
    await refreshAll();
  }

  return (
    <main className="mx-auto max-w-4xl p-4">
      <h1 className="mb-4 text-2xl font-bold">Admin Panel</h1>
      <div className="mb-4 flex flex-wrap gap-2">
        {(['stats', 'bungalows', 'reservations', 'availability', 'translations'] as Tab[]).map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            className={`rounded border px-3 py-1 text-sm ${tab === item ? 'bg-forest text-white' : 'bg-white'}`}
          >
            {item}
          </button>
        ))}
      </div>

      {loading ? <p className="text-sm text-slate-500">Yukleniyor...</p> : null}

      {tab === 'stats' ? (
        <div className="grid gap-4 md:grid-cols-4">
          <Card title="Users" value={stats?.users ?? 0} />
          <Card title="Bungalows" value={stats?.bungalows ?? 0} />
          <Card title="Reservations" value={stats?.reservations ?? 0} />
          <Card title="Paid" value={stats?.paidReservations ?? 0} />
        </div>
      ) : null}

      {tab === 'bungalows' ? (
        <section className="space-y-4">
          <div className="grid gap-2 rounded-xl border bg-white p-3">
            <input className="rounded border p-2" placeholder="Baslik" value={newBungalow.title} onChange={(e) => setNewBungalow((p) => ({ ...p, title: e.target.value }))} />
            <input className="rounded border p-2" placeholder="Aciklama" value={newBungalow.description} onChange={(e) => setNewBungalow((p) => ({ ...p, description: e.target.value }))} />
            <input className="rounded border p-2" placeholder="Konum" value={newBungalow.location} onChange={(e) => setNewBungalow((p) => ({ ...p, location: e.target.value }))} />
            <input className="rounded border p-2" placeholder="Fiyat / gece" value={newBungalow.pricePerNight} onChange={(e) => setNewBungalow((p) => ({ ...p, pricePerNight: e.target.value }))} />
            <input className="rounded border p-2" placeholder="Resimler (virgulle)" value={newBungalow.images} onChange={(e) => setNewBungalow((p) => ({ ...p, images: e.target.value }))} />
            <textarea className="rounded border p-2" placeholder="Features JSON" value={newBungalow.features} onChange={(e) => setNewBungalow((p) => ({ ...p, features: e.target.value }))} />
            <button onClick={createBungalow} className="rounded bg-forest p-2 text-white">Bungalov Ekle</button>
          </div>
          <div className="space-y-2">
            {bungalows.map((b) => (
              <article key={b.id} className="rounded border bg-white p-3">
                <div>
                  <p className="font-semibold">{b.title}</p>
                  <p className="text-sm text-slate-600">{b.location} - {b.pricePerNight} TL</p>
                </div>
                <div className="mt-2 flex gap-2">
                  <button onClick={() => startEditBungalow(b)} className="rounded border px-3 py-1">Duzenle</button>
                  <button onClick={() => deleteBungalow(b.id)} className="rounded border px-3 py-1 text-red-600">Sil</button>
                </div>
              </article>
            ))}
          </div>
          {editingBungalowId ? (
            <div className="grid gap-2 rounded-xl border bg-white p-3">
              <h3 className="font-semibold">Bungalov Duzenle</h3>
              <input className="rounded border p-2" placeholder="Baslik" value={editBungalow.title} onChange={(e) => setEditBungalow((p) => ({ ...p, title: e.target.value }))} />
              <input className="rounded border p-2" placeholder="Aciklama" value={editBungalow.description} onChange={(e) => setEditBungalow((p) => ({ ...p, description: e.target.value }))} />
              <input className="rounded border p-2" placeholder="Konum" value={editBungalow.location} onChange={(e) => setEditBungalow((p) => ({ ...p, location: e.target.value }))} />
              <input className="rounded border p-2" placeholder="Fiyat / gece" value={editBungalow.pricePerNight} onChange={(e) => setEditBungalow((p) => ({ ...p, pricePerNight: e.target.value }))} />
              <input className="rounded border p-2" placeholder="Resimler (opsiyonel, virgulle)" value={editBungalow.images} onChange={(e) => setEditBungalow((p) => ({ ...p, images: e.target.value }))} />
              <textarea className="rounded border p-2" placeholder="Features JSON (opsiyonel)" value={editBungalow.features} onChange={(e) => setEditBungalow((p) => ({ ...p, features: e.target.value }))} />
              <div className="flex gap-2">
                <button onClick={saveEditBungalow} className="rounded bg-forest p-2 text-white">Kaydet</button>
                <button onClick={() => setEditingBungalowId(null)} className="rounded border p-2">Vazgec</button>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {tab === 'reservations' ? (
        <section className="space-y-2">
          <div className="mb-3 grid gap-2 rounded border bg-white p-3 md:grid-cols-3">
            <input
              className="rounded border p-2"
              placeholder="Email veya bungalow ara"
              value={reservationSearch}
              onChange={(e) => {
                setReservationPage(1);
                setReservationSearch(e.target.value);
              }}
            />
            <select
              className="rounded border p-2"
              value={reservationStatusFilter}
              onChange={(e) => {
                setReservationPage(1);
                setReservationStatusFilter(e.target.value as 'all' | Reservation['status']);
              }}
            >
              <option value="all">Tum durumlar</option>
              <option value="pending">pending</option>
              <option value="paid">paid</option>
              <option value="cancelled">cancelled</option>
            </select>
            <div className="flex items-center justify-between rounded border p-2">
              <button
                className="rounded border px-2 py-1 text-sm disabled:opacity-50"
                disabled={reservationPage <= 1}
                onClick={() => setReservationPage((p) => Math.max(p - 1, 1))}
              >
                Onceki
              </button>
              <span className="text-sm">{reservationPage} / {reservationTotalPages}</span>
              <button
                className="rounded border px-2 py-1 text-sm disabled:opacity-50"
                disabled={reservationPage >= reservationTotalPages}
                onClick={() => setReservationPage((p) => Math.min(p + 1, reservationTotalPages))}
              >
                Sonraki
              </button>
            </div>
          </div>
          {reservations.map((r) => (
            <article key={r.id} className="rounded border bg-white p-3">
              <p className="font-medium">{r.bungalow?.title ?? 'Bungalov'}</p>
              <p className="text-sm text-slate-600">{r.user?.email ?? '-'} - {r.totalPrice} TL</p>
              <div className="mt-2 flex gap-2">
                {(['pending', 'paid', 'cancelled'] as Reservation['status'][]).map((status) => (
                  <button key={status} onClick={() => updateReservation(r.id, status)} className={`rounded border px-2 py-1 text-xs ${r.status === status ? 'bg-forest text-white' : ''}`}>
                    {status}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </section>
      ) : null}

      {tab === 'availability' ? (
        <section className="space-y-3 rounded border bg-white p-3">
          <select className="w-full rounded border p-2" value={selectedBungalowId} onChange={(e) => setSelectedBungalowId(e.target.value)}>
            {bungalows.map((b) => (
              <option key={b.id} value={b.id}>{b.title}</option>
            ))}
          </select>
          <input type="date" className="w-full rounded border p-2" value={availabilityForm.date} onChange={(e) => setAvailabilityForm((p) => ({ ...p, date: e.target.value }))} />
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={availabilityForm.isAvailable} onChange={(e) => setAvailabilityForm((p) => ({ ...p, isAvailable: e.target.checked }))} />
            Musait
          </label>
          <button onClick={saveAvailability} className="rounded bg-forest p-2 text-white">Takvime Kaydet</button>
          <div className="space-y-1">
            {availability.slice(0, 20).map((a) => (
              <p key={a.date} className="text-sm">{new Date(a.date).toLocaleDateString()} - {a.isAvailable ? 'Musait' : 'Dolu'}</p>
            ))}
          </div>
        </section>
      ) : null}

      {tab === 'translations' ? (
        <section className="space-y-3 rounded border bg-white p-3">
          <input className="w-full rounded border p-2" placeholder="Key" value={newTranslation.key} onChange={(e) => setNewTranslation((p) => ({ ...p, key: e.target.value }))} />
          <input className="w-full rounded border p-2" placeholder="TR" value={newTranslation.tr} onChange={(e) => setNewTranslation((p) => ({ ...p, tr: e.target.value }))} />
          <input className="w-full rounded border p-2" placeholder="EN" value={newTranslation.en} onChange={(e) => setNewTranslation((p) => ({ ...p, en: e.target.value }))} />
          <input className="w-full rounded border p-2" placeholder="AR" value={newTranslation.ar} onChange={(e) => setNewTranslation((p) => ({ ...p, ar: e.target.value }))} />
          <button onClick={upsertTranslation} className="rounded bg-forest p-2 text-white">Ceviri Kaydet</button>
          <div className="space-y-1">
            {translations.slice(0, 30).map((t) => (
              <p key={t.key} className="text-sm">{t.key}: {t.tr}</p>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}

function Card({ title, value }: { title: string; value: number }) {
  return (
    <article className="rounded-xl border bg-white p-4">
      <p className="text-sm text-slate-600">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </article>
  );
}
