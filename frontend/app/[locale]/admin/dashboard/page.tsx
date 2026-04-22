'use client';

import Link from 'next/link';
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

const TAB_ORDER: Tab[] = ['stats', 'bungalows', 'reservations', 'availability', 'translations'];
const TAB_LABELS: Record<Tab, string> = {
  stats: 'Ozet',
  bungalows: 'Bungalovlar',
  reservations: 'Rezervasyonlar',
  availability: 'Musaitlik',
  translations: 'Ceviriler',
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const locale = String(params.locale ?? 'tr');
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
      router.replace(`/${locale}/admin/login`);
    }
  }, [router, locale]);

  useEffect(() => {
    void refreshAll();
  }, [reservationPage, reservationLimit, reservationStatusFilter, reservationSearch]);

  function logout() {
    localStorage.removeItem('token');
    router.push(`/${locale}/admin/login`);
  }

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
    <main className="bgl-container max-w-6xl py-8 md:py-10">
      <div className="flex flex-col gap-4 border-b border-bgl-mist/80 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="bgl-section-title">Yonetim</p>
          <h1 className="bgl-heading mt-1">Admin panel</h1>
          <p className="mt-2 max-w-xl text-sm text-bgl-muted">Icerik, rezervasyon ve ceviri yonetimi.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/${locale}`} className="bgl-btn-ghost text-sm">
            Siteye don
          </Link>
          <button type="button" onClick={logout} className="rounded-full border border-rose-200 bg-rose-50 px-5 py-2.5 text-sm font-semibold text-rose-800 transition hover:bg-rose-100">
            Cikis
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {TAB_ORDER.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              tab === item
                ? 'bg-bgl-moss text-white shadow-sm ring-1 ring-bgl-moss/20'
                : 'border border-bgl-mist bg-white/90 text-bgl-muted hover:border-bgl-sand hover:text-bgl-ink'
            }`}
          >
            {TAB_LABELS[item]}
          </button>
        ))}
      </div>

      {loading ? <p className="mt-6 text-sm font-medium text-bgl-muted">Yukleniyor...</p> : null}

      {tab === 'stats' ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Kullanicilar" value={stats?.users ?? 0} />
          <StatCard title="Bungalovlar" value={stats?.bungalows ?? 0} />
          <StatCard title="Rezervasyonlar" value={stats?.reservations ?? 0} />
          <StatCard title="Odenen" value={stats?.paidReservations ?? 0} accent />
        </div>
      ) : null}

      {tab === 'bungalows' ? (
        <section className="mt-8 space-y-6">
          <div className="bgl-card grid gap-3 p-6 md:grid-cols-2">
            <input className="bgl-input md:col-span-2" placeholder="Baslik" value={newBungalow.title} onChange={(e) => setNewBungalow((p) => ({ ...p, title: e.target.value }))} />
            <input className="bgl-input md:col-span-2" placeholder="Aciklama" value={newBungalow.description} onChange={(e) => setNewBungalow((p) => ({ ...p, description: e.target.value }))} />
            <input className="bgl-input" placeholder="Konum" value={newBungalow.location} onChange={(e) => setNewBungalow((p) => ({ ...p, location: e.target.value }))} />
            <input className="bgl-input" placeholder="Fiyat / gece" value={newBungalow.pricePerNight} onChange={(e) => setNewBungalow((p) => ({ ...p, pricePerNight: e.target.value }))} />
            <input className="bgl-input md:col-span-2" placeholder="Resimler (virgulle URL)" value={newBungalow.images} onChange={(e) => setNewBungalow((p) => ({ ...p, images: e.target.value }))} />
            <textarea className="bgl-input min-h-[88px] md:col-span-2" placeholder="Features JSON" value={newBungalow.features} onChange={(e) => setNewBungalow((p) => ({ ...p, features: e.target.value }))} />
            <button type="button" onClick={createBungalow} className="bgl-btn-primary md:col-span-2">
              Bungalov ekle
            </button>
          </div>
          <div className="space-y-4">
            {bungalows.map((b) => (
              <article key={b.id} className="bgl-card flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-bgl-ink">{b.title}</p>
                  <p className="mt-1 text-sm text-bgl-muted">
                    {b.location} — {b.pricePerNight} TL / gece
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => startEditBungalow(b)} className="rounded-full border border-bgl-mist bg-white px-4 py-2 text-sm font-semibold text-bgl-ink hover:border-bgl-sand">
                    Duzenle
                  </button>
                  <button type="button" onClick={() => deleteBungalow(b.id)} className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-800 hover:bg-rose-100">
                    Sil
                  </button>
                </div>
              </article>
            ))}
          </div>
          {editingBungalowId ? (
            <div className="bgl-card grid gap-3 border-t-4 border-t-bgl-moss p-6 md:grid-cols-2">
              <h3 className="font-semibold text-bgl-ink md:col-span-2">Bungalov duzenle</h3>
              <input className="bgl-input md:col-span-2" placeholder="Baslik" value={editBungalow.title} onChange={(e) => setEditBungalow((p) => ({ ...p, title: e.target.value }))} />
              <input className="bgl-input md:col-span-2" placeholder="Aciklama" value={editBungalow.description} onChange={(e) => setEditBungalow((p) => ({ ...p, description: e.target.value }))} />
              <input className="bgl-input" placeholder="Konum" value={editBungalow.location} onChange={(e) => setEditBungalow((p) => ({ ...p, location: e.target.value }))} />
              <input className="bgl-input" placeholder="Fiyat / gece" value={editBungalow.pricePerNight} onChange={(e) => setEditBungalow((p) => ({ ...p, pricePerNight: e.target.value }))} />
              <input className="bgl-input md:col-span-2" placeholder="Resimler (opsiyonel)" value={editBungalow.images} onChange={(e) => setEditBungalow((p) => ({ ...p, images: e.target.value }))} />
              <textarea className="bgl-input min-h-[88px] md:col-span-2" placeholder="Features JSON (opsiyonel)" value={editBungalow.features} onChange={(e) => setEditBungalow((p) => ({ ...p, features: e.target.value }))} />
              <div className="flex flex-wrap gap-2 md:col-span-2">
                <button type="button" onClick={saveEditBungalow} className="bgl-btn-primary">
                  Kaydet
                </button>
                <button type="button" onClick={() => setEditingBungalowId(null)} className="bgl-btn-ghost">
                  Vazgec
                </button>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {tab === 'reservations' ? (
        <section className="mt-8 space-y-4">
          <div className="bgl-card grid gap-3 p-5 md:grid-cols-3">
            <input
              className="bgl-input"
              placeholder="E-posta veya bungalov ara"
              value={reservationSearch}
              onChange={(e) => {
                setReservationPage(1);
                setReservationSearch(e.target.value);
              }}
            />
            <select
              className="bgl-input"
              value={reservationStatusFilter}
              onChange={(e) => {
                setReservationPage(1);
                setReservationStatusFilter(e.target.value as 'all' | Reservation['status']);
              }}
            >
              <option value="all">Tum durumlar</option>
              <option value="pending">Beklemede</option>
              <option value="paid">Odendi</option>
              <option value="cancelled">Iptal</option>
            </select>
            <div className="flex items-center justify-between gap-2 rounded-xl border border-bgl-mist bg-bgl-cream/40 px-3 py-2">
              <button
                type="button"
                className="rounded-full border border-bgl-mist bg-white px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
                disabled={reservationPage <= 1}
                onClick={() => setReservationPage((p) => Math.max(p - 1, 1))}
              >
                Onceki
              </button>
              <span className="text-xs font-medium text-bgl-muted">
                {reservationPage} / {reservationTotalPages}
              </span>
              <button
                type="button"
                className="rounded-full border border-bgl-mist bg-white px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
                disabled={reservationPage >= reservationTotalPages}
                onClick={() => setReservationPage((p) => Math.min(p + 1, reservationTotalPages))}
              >
                Sonraki
              </button>
            </div>
          </div>
          {reservations.map((r) => (
            <article key={r.id} className="bgl-card p-5">
              <p className="font-semibold text-bgl-ink">{r.bungalow?.title ?? 'Bungalov'}</p>
              <p className="mt-1 text-sm text-bgl-muted">
                {r.user?.email ?? '-'} — {r.totalPrice} TL
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {(['pending', 'paid', 'cancelled'] as Reservation['status'][]).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => updateReservation(r.id, status)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      r.status === status
                        ? 'bg-bgl-moss text-white shadow-sm'
                        : 'border border-bgl-mist bg-white text-bgl-muted hover:border-bgl-sand'
                    }`}
                  >
                    {status === 'pending' ? 'Beklemede' : status === 'paid' ? 'Odendi' : 'Iptal'}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </section>
      ) : null}

      {tab === 'availability' ? (
        <section className="bgl-card mt-8 space-y-4 p-6">
          <select className="bgl-input" value={selectedBungalowId} onChange={(e) => setSelectedBungalowId(e.target.value)}>
            {bungalows.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title}
              </option>
            ))}
          </select>
          <input type="date" className="bgl-input" value={availabilityForm.date} onChange={(e) => setAvailabilityForm((p) => ({ ...p, date: e.target.value }))} />
          <label className="flex items-center gap-2 text-sm font-medium text-bgl-ink">
            <input type="checkbox" className="h-4 w-4 rounded border-bgl-mist text-bgl-moss" checked={availabilityForm.isAvailable} onChange={(e) => setAvailabilityForm((p) => ({ ...p, isAvailable: e.target.checked }))} />
            Musait
          </label>
          <button type="button" onClick={saveAvailability} className="bgl-btn-primary">
            Takvime kaydet
          </button>
          <ul className="max-h-64 space-y-2 overflow-y-auto rounded-xl border border-bgl-mist/80 bg-bgl-cream/30 p-3 text-sm">
            {availability.slice(0, 20).map((a) => (
              <li key={a.date} className="flex justify-between rounded-lg bg-white/80 px-3 py-2 ring-1 ring-black/5">
                <span className="text-bgl-ink">{new Date(a.date).toLocaleDateString('tr-TR')}</span>
                <span className={a.isAvailable ? 'font-medium text-emerald-700' : 'font-medium text-rose-700'}>{a.isAvailable ? 'Musait' : 'Dolu'}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {tab === 'translations' ? (
        <section className="bgl-card mt-8 space-y-4 p-6">
          <input className="bgl-input" placeholder="Key" value={newTranslation.key} onChange={(e) => setNewTranslation((p) => ({ ...p, key: e.target.value }))} />
          <input className="bgl-input" placeholder="TR" value={newTranslation.tr} onChange={(e) => setNewTranslation((p) => ({ ...p, tr: e.target.value }))} />
          <input className="bgl-input" placeholder="EN" value={newTranslation.en} onChange={(e) => setNewTranslation((p) => ({ ...p, en: e.target.value }))} />
          <input className="bgl-input" placeholder="AR" value={newTranslation.ar} onChange={(e) => setNewTranslation((p) => ({ ...p, ar: e.target.value }))} />
          <button type="button" onClick={upsertTranslation} className="bgl-btn-primary">
            Ceviri kaydet
          </button>
          <ul className="max-h-80 space-y-2 overflow-y-auto rounded-xl border border-bgl-mist/80 bg-bgl-cream/30 p-3 text-sm">
            {translations.slice(0, 40).map((t) => (
              <li key={t.key} className="rounded-lg bg-white/90 px-3 py-2 ring-1 ring-black/5">
                <span className="font-mono text-xs text-bgl-moss">{t.key}</span>
                <span className="mt-1 block text-bgl-muted">{t.tr}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}

function StatCard({ title, value, accent }: { title: string; value: number; accent?: boolean }) {
  return (
    <article className={`bgl-card p-6 ${accent ? 'border-t-4 border-t-bgl-moss' : ''}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-bgl-muted">{title}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-bgl-ink">{value}</p>
    </article>
  );
}
