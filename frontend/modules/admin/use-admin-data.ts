'use client';

import { getApiBaseUrl, toAbsoluteMediaUrl, toRelativeMediaUrl } from '@/lib/api';
import {
  DEFAULT_HOME_HERO_IMAGES,
  DEFAULT_HOME_MAP,
  SITE_PAGES_STORAGE_KEY,
} from '@/lib/site-pages-config';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  AdminStats,
  BlogPostRecord,
  Bungalow,
  ContactListStatus,
  ContactMessageRow,
  EmailSettingsState,
  MediaAsset,
  Payment,
  PaymentProviderSetting,
  Reservation,
  ReservationStatus,
  RevenuePoint,
  SitePage,
  SiteSettings,
  TranslationRow,
} from './types';

type RawReservation = {
  id: string;
  checkIn?: string;
  checkOut?: string;
  totalPrice?: string | number;
  status: 'pending' | 'paid' | 'cancelled';
  user?: { name?: string; email?: string };
  bungalow?: { title?: string };
  payment?: { status?: 'pending' | 'paid' | 'failed' | 'refunded' | string };
  createdAt?: string;
};

function mapReservationStatus(input: RawReservation['status']): ReservationStatus {
  if (input === 'paid') return 'approved';
  if (input === 'cancelled') return 'cancelled';
  return 'pending';
}

async function parseBlogError(response: Response): Promise<string> {
  const raw = await response.text();
  let msg = raw || `API ${response.status}`;
  try {
    const j = JSON.parse(raw) as { message?: string | string[] };
    if (j?.message) {
      msg = Array.isArray(j.message) ? j.message.join(', ') : String(j.message);
    }
  } catch {
    /* metin JSON degilse raw kullan */
  }
  return msg;
}

function mapRawToReservation(item: RawReservation): Reservation {
  return {
    id: item.id,
    customerName: item.user?.name ?? 'Misafir',
    customerEmail: item.user?.email ?? '-',
    bungalowName: item.bungalow?.title ?? 'Bungalov',
    checkIn: item.checkIn ?? new Date().toISOString(),
    checkOut: item.checkOut ?? new Date().toISOString(),
    amount: Number(item.totalPrice ?? 0),
    status: mapReservationStatus(item.status),
    paymentStatus:
      item.payment?.status === 'paid'
        ? 'paid'
        : item.status === 'paid'
          ? 'paid'
          : item.payment?.status === 'failed' || item.status === 'cancelled'
            ? 'failed'
            : 'pending',
  };
}

const DEFAULT_EMAIL_SETTINGS: EmailSettingsState = {
  enabled: false,
  host: '',
  port: 587,
  secure: false,
  authUser: '',
  fromName: '',
  fromEmail: '',
  notifyAdminOnNewReservation: true,
  notifyAdminOnContact: true,
  adminNotifyEmail: null,
  hasPassword: false,
};

function mapOperationsToSiteSettings(op: Record<string, unknown>): SiteSettings {
  return {
    siteName: typeof op.siteName === 'string' && op.siteName.trim() ? op.siteName.trim() : 'Bungalov',
    logoUrl: toAbsoluteMediaUrl(String(op.logoUrl ?? '')),
    faviconUrl: toAbsoluteMediaUrl(String(op.faviconUrl ?? '')),
    whatsapp: String(op.whatsapp ?? ''),
    instagram: String(op.instagram ?? ''),
    facebook: String(op.facebook ?? ''),
    metaTitle: String(op.metaTitle ?? ''),
    metaDescription: String(op.metaDescription ?? ''),
    footerTagline: String(
      op.footerTagline ??
        'Doganin icinde, sade cizgilerle tasarlanmis bungalov deneyimi. Sessizlik, konfor ve guvenli rezervasyon.',
    ),
    contactPhone: String(op.contactPhone ?? '+90 500 000 00 00'),
    contactEmail: String(op.contactEmail ?? 'info@savaskara.com'),
    footerLocations: String(op.footerLocations ?? 'Sapanca · Bolu · Bursa'),
  };
}

export function useAdminData() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [stats, setStats] = useState<AdminStats>({
    totalReservations: 0,
    monthlyRevenue: 0,
    occupancyRate: 0,
    todayCheckIns: 0,
    todayCheckOuts: 0,
  });
  const [bungalows, setBungalows] = useState<Bungalow[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentProviderSettings, setPaymentProviderSettings] = useState<PaymentProviderSetting[]>(
    [],
  );
  const [translations, setTranslations] = useState<TranslationRow[]>([]);

  const [users, setUsers] = useState([
    {
      id: '1',
      name: 'Yonetici',
      email: 'admin@savaskara.com',
      role: 'admin' as 'admin' | 'editor',
    },
  ]);
  const [mediaItems, setMediaItems] = useState<MediaAsset[]>([]);
  const [sitePages, setSitePages] = useState<SitePage[]>([
    {
      id: 'home',
      name: 'Ana Sayfa',
      slug: '',
      title: 'Dogada Huzurlu Bungalov Tatili',
      seoTitle: 'Ana Sayfa | Bungalov',
      seoDescription: 'Rize ve Sapanca cizgisinde doga ile ic ice konaklama deneyimi.',
      heroTitle: 'Hayalindeki Bungalovu Hemen Kesfet',
      heroSubtitle: 'Jakuzili, manzarali ve romantik bungalov secenekleri bir arada.',
      heroImages: DEFAULT_HOME_HERO_IMAGES,
      slideIntervalSec: 4,
      body: 'Kampanyalar, one cikan bungalovlar ve anlik musaitlik bilgileri bu alanda yonetilir.',
      ctaLabel: 'Bungalovlari Incele',
      ctaUrl: '/bungalows',
      ...DEFAULT_HOME_MAP,
    },
    {
      id: 'about',
      name: 'Hakkimizda',
      slug: 'hakkimizda',
      title: 'Biz Kimiz',
      seoTitle: 'Hakkimizda | Bungalov',
      seoDescription: 'Marka hikayemiz, misyonumuz ve hizmet kalitemiz.',
      heroTitle: 'Misafir memnuniyeti odakli ekip',
      heroSubtitle: 'Yuzlerce mutlu konaklama deneyimi ile yaninizdayiz.',
      heroImages: [],
      slideIntervalSec: 4,
      body: 'Ekibiniz, operasyon sureciniz, temizlik standartlariniz ve guven politikalarinizi anlatin.',
      ctaLabel: 'Iletisime Gec',
      ctaUrl: '/iletisim',
    },
    {
      id: 'contact',
      name: 'Iletisim',
      slug: 'iletisim',
      title: 'Iletisim',
      seoTitle: 'Iletisim | Bungalov',
      seoDescription: 'Telefon, WhatsApp, e-posta ve adres bilgileri.',
      heroTitle: 'Bize Ulasin',
      heroSubtitle: '7/24 destek ekibimiz sorularinizi yanitlasin.',
      heroImages: [],
      slideIntervalSec: 4,
      body: 'Iletisim formu aciklamasi, ofis bilgileri, check-in saatleri ve destek kanal detaylari.',
      ctaLabel: 'WhatsApp Destek',
      ctaUrl: 'https://wa.me/',
    },
  ]);
  const [contentSections, setContentSections] = useState([
    { id: 'home.hero', title: 'Anasayfa Hero', description: 'Baslik ve alt baslik' },
    { id: 'about.main', title: 'Hakkimizda', description: 'Firma tanitimi' },
    { id: 'contact.main', title: 'Iletisim', description: 'Iletisim bilgileri' },
  ]);
  const [emailSettings, setEmailSettings] = useState<EmailSettingsState>(DEFAULT_EMAIL_SETTINGS);

  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'Bungalov',
    logoUrl: '',
    faviconUrl: '',
    whatsapp: '',
    instagram: '',
    facebook: '',
    metaTitle: '',
    metaDescription: '',
    footerTagline:
      'Doganin icinde, sade cizgilerle tasarlanmis bungalov deneyimi. Sessizlik, konfor ve guvenli rezervasyon.',
    contactPhone: '+90 500 000 00 00',
    contactEmail: 'info@savaskara.com',
    footerLocations: 'Sapanca · Bolu · Bursa',
  });

  const [contactMessages, setContactMessages] = useState<ContactMessageRow[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPostRecord[]>([]);
  const [contactPagination, setContactPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [contactLoading, setContactLoading] = useState(false);
  const [contactError, setContactError] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(SITE_PAGES_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as SitePage[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        setSitePages(
          parsed.map((page) =>
            page.id === 'home'
              ? {
                  ...page,
                  mapEmbedUrl: page.mapEmbedUrl || DEFAULT_HOME_MAP.mapEmbedUrl,
                  mapTitle: page.mapTitle || DEFAULT_HOME_MAP.mapTitle,
                  mapAddress: page.mapAddress || DEFAULT_HOME_MAP.mapAddress,
                  mapNote: page.mapNote || DEFAULT_HOME_MAP.mapNote,
                  mapButtonLabel: page.mapButtonLabel || DEFAULT_HOME_MAP.mapButtonLabel,
                  mapButtonUrl: page.mapButtonUrl || DEFAULT_HOME_MAP.mapButtonUrl,
                }
              : page,
          ),
        );
      }
    } catch {
      // ignore invalid local storage payload
    }
  }, []);

  const revenueChartData = useMemo<RevenuePoint[]>(() => {
    const currentYear = new Date().getFullYear();
    const months = Array.from({ length: 12 }, (_, idx) => ({
      month: `${idx + 1}`.padStart(2, '0'),
      revenue: 0,
    }));
    reservations.forEach((item) => {
      const date = item.checkIn ? new Date(item.checkIn) : null;
      if (!date || date.getFullYear() !== currentYear) return;
      const monthIndex = date.getMonth();
      months[monthIndex].revenue += item.amount;
    });
    return months.map((entry) => ({
      month: entry.month,
      revenue: entry.revenue,
    }));
  }, [reservations]);

  const authFetch = useCallback(async (path: string, init?: RequestInit) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${getApiBaseUrl()}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(init?.headers ?? {}),
      },
    });
    if (!response.ok) throw new Error(`API ${response.status}`);
    return response;
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, bungalowsRes, reservationsRes, translationsRes, providersRes, mediaRes, settingsRes, emailRes, blogRes] =
        await Promise.all([
          authFetch('/admin/stats'),
          authFetch('/admin/bungalows'),
          authFetch('/admin/reservations?page=1&limit=50'),
          authFetch('/admin/translations'),
          authFetch('/admin/payment-providers'),
          authFetch('/admin/media'),
          authFetch('/admin/settings'),
          authFetch('/admin/email-settings'),
          authFetch('/admin/blog/posts'),
        ]);

      const statsPayload = (await statsRes.json()) as {
        reservations: number;
        paidReservations: number;
      };
      const bungalowsPayload = (await bungalowsRes.json()) as Array<
        Bungalow & { features?: Record<string, unknown> }
      >;
      const reservationsPayload = (await reservationsRes.json()) as {
        items: RawReservation[];
      };
      const translationsPayload = (await translationsRes.json()) as TranslationRow[];
      const providersPayload = (await providersRes.json()) as Array<{
        id: string;
        amount?: number;
        status?: Payment['status'];
        provider: Payment['provider'];
        enabled?: boolean;
        mode?: string;
        publicKey?: string | null;
        secretKey?: string | null;
        webhookSecret?: string | null;
        createdAt?: string;
      }>;
      const mediaPayload = (await mediaRes.json()) as MediaAsset[];
      const settingsPayload = (await settingsRes.json()) as { operations?: Record<string, unknown> };
      setSettings(mapOperationsToSiteSettings(settingsPayload.operations ?? {}));

      const blogPayload = (await blogRes.json()) as BlogPostRecord[];
      setBlogPosts(Array.isArray(blogPayload) ? blogPayload : []);

      const emailPayload = (await emailRes.json()) as EmailSettingsState;
      setEmailSettings({
        ...DEFAULT_EMAIL_SETTINGS,
        ...emailPayload,
        port: Number(emailPayload.port) || 587,
      });

      const mappedReservations: Reservation[] = reservationsPayload.items.map((item) =>
        mapRawToReservation(item),
      );

      const monthlyRevenue = mappedReservations
        .filter((item) => item.status === 'approved')
        .reduce((sum, item) => sum + item.amount, 0);
      const today = new Date().toDateString();
      const todayCheckIns = mappedReservations.filter(
        (item) => new Date(item.checkIn).toDateString() === today,
      ).length;
      const todayCheckOuts = mappedReservations.filter(
        (item) => new Date(item.checkOut).toDateString() === today,
      ).length;
      const occupancyRate = bungalowsPayload.length
        ? Math.min(Math.round((statsPayload.reservations / (bungalowsPayload.length * 30)) * 100), 100)
        : 0;

      setStats({
        totalReservations: statsPayload.reservations,
        monthlyRevenue,
        occupancyRate,
        todayCheckIns,
        todayCheckOuts,
      });
      setBungalows(
        bungalowsPayload.map((item) => ({
          ...item,
          capacity: Number((item.features as Record<string, unknown>)?.maxGuests ?? 2),
          images: (item.images ?? []).map((image) => toAbsoluteMediaUrl(String(image))),
          features: (item.features ?? {}) as Bungalow['features'],
        })),
      );
      setReservations(mappedReservations);
      setTranslations(translationsPayload);
      setPayments(
        providersPayload.map((item, idx) => ({
          id: item.id ?? `${item.provider}-${idx}`,
          amount: item.amount ?? 0,
          status: item.status ?? 'pending',
          provider: item.provider,
          createdAt: item.createdAt ?? new Date().toISOString(),
        })),
      );
      setPaymentProviderSettings(
        providersPayload.map((item) => ({
          id: item.id,
          provider: item.provider,
          enabled: Boolean(item.enabled),
          mode: item.mode ?? 'test',
          publicKey: item.publicKey ?? null,
          secretKey: item.secretKey ?? null,
          webhookSecret: item.webhookSecret ?? null,
        })),
      );
      setMediaItems(
        mediaPayload.map((asset) => ({
          ...asset,
          url: toAbsoluteMediaUrl(asset.url),
        })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Veri alinamadi');
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  const updateReservationStatus = useCallback(
    async (id: string, status: ReservationStatus) => {
      const backendStatus = status === 'approved' ? 'paid' : status;
      await authFetch(`/admin/reservations/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: backendStatus }),
      });

      setReservations((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status } : item)),
      );
    },
    [authFetch],
  );

  const createManualReservation = useCallback(
    async (payload: {
      bungalowId: string;
      checkIn: string;
      checkOut: string;
      guests: number;
      guestName: string;
      guestEmail: string;
      status: 'pending' | 'paid' | 'cancelled';
    }) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch(`${getApiBaseUrl()}/admin/reservations/manual`, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!response.ok) {
        const raw = await response.text();
        let msg = raw || `API ${response.status}`;
        try {
          const j = JSON.parse(raw) as { message?: string | string[] };
          if (j?.message) {
            msg = Array.isArray(j.message) ? j.message.join(', ') : String(j.message);
          }
        } catch {
          /* metin JSON degilse raw kullan */
        }
        throw new Error(msg);
      }
      const created = (await response.json()) as RawReservation;
      const mapped = mapRawToReservation(created);
      setReservations((prev) => [mapped, ...prev]);
      return mapped;
    },
    [],
  );

  const createBungalow = useCallback(
    async (payload: Omit<Bungalow, 'id'>) => {
      const features = {
        ...(payload.features ?? {}),
        maxGuests: payload.capacity,
      };
      const response = await authFetch('/admin/bungalows', {
        method: 'POST',
        body: JSON.stringify({
          title: payload.title,
          description: payload.description,
          pricePerNight: payload.pricePerNight,
          location: payload.location,
          images: payload.images.map((image) => toRelativeMediaUrl(String(image))),
          features,
        }),
      });
      const created = (await response.json()) as Bungalow & { features?: Record<string, unknown> };
      const mapped: Bungalow = {
        ...created,
        capacity: Number((created.features as Record<string, unknown>)?.maxGuests ?? payload.capacity ?? 2),
        images: (created.images ?? []).map((image) => toAbsoluteMediaUrl(String(image))),
        features: (created.features ?? {}) as Bungalow['features'],
      };
      setBungalows((prev) => [mapped, ...prev]);
      return mapped;
    },
    [authFetch],
  );

  const updateBungalow = useCallback(
    async (id: string, payload: Omit<Bungalow, 'id'>) => {
      const features = {
        ...(payload.features ?? {}),
        maxGuests: payload.capacity,
      };
      const response = await authFetch(`/admin/bungalows/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: payload.title,
          description: payload.description,
          pricePerNight: payload.pricePerNight,
          location: payload.location,
          images: payload.images.map((image) => toRelativeMediaUrl(String(image))),
          features,
        }),
      });
      const updated = (await response.json()) as Bungalow & { features?: Record<string, unknown> };
      const mapped: Bungalow = {
        ...updated,
        capacity: Number((updated.features as Record<string, unknown>)?.maxGuests ?? payload.capacity ?? 2),
        images: (updated.images ?? []).map((image) => toAbsoluteMediaUrl(String(image))),
        features: (updated.features ?? {}) as Bungalow['features'],
      };
      setBungalows((prev) => prev.map((item) => (item.id === id ? mapped : item)));
      return mapped;
    },
    [authFetch],
  );

  const deleteBungalow = useCallback(
    async (id: string) => {
      await authFetch(`/admin/bungalows/${id}`, { method: 'DELETE' });
      setBungalows((prev) => prev.filter((item) => item.id !== id));
    },
    [authFetch],
  );

  const uploadMedia = useCallback(
    async (file: File) => {
      const token = localStorage.getItem('token');
      const form = new FormData();
      form.append('file', file);

      const response = await fetch(`${getApiBaseUrl()}/admin/media/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });
      if (!response.ok) {
        throw new Error(`API ${response.status}`);
      }
      const asset = (await response.json()) as MediaAsset;
      const mapped = { ...asset, url: toAbsoluteMediaUrl(asset.url) };
      setMediaItems((prev) => [mapped, ...prev]);
      return mapped;
    },
    [],
  );

  const deleteMedia = useCallback(
    async (id: string) => {
      const deletedAsset = mediaItems.find((item) => item.id === id);
      await authFetch(`/admin/media/${id}`, { method: 'DELETE' });
      setMediaItems((prev) => prev.filter((item) => item.id !== id));
      if (deletedAsset) {
        const deletedRelative = toRelativeMediaUrl(deletedAsset.url);
        setBungalows((prev) =>
          prev.map((bungalow) => ({
            ...bungalow,
            images: bungalow.images.filter((url) => {
              const relative = toRelativeMediaUrl(String(url));
              return relative !== deletedRelative && String(url) !== deletedAsset.url;
            }),
          })),
        );
      }
    },
    [authFetch, mediaItems],
  );

  const fetchContactMessages = useCallback(
    async (p: { page: number; limit: number; search: string; status: ContactListStatus }) => {
      setContactLoading(true);
      setContactError('');
      try {
        const q = new URLSearchParams({
          page: String(p.page),
          limit: String(p.limit),
          status: p.status,
        });
        if (p.search.trim()) q.set('search', p.search.trim());
        const res = await authFetch(`/admin/contact?${q}`);
        const data = (await res.json()) as {
          items: Array<{
            id: string;
            name: string;
            email: string;
            phone: string | null;
            message: string;
            isRead: boolean;
            isReplied: boolean;
            createdAt: string | Date;
          }>;
          pagination: { total: number; page: number; limit: number; totalPages: number };
        };
        setContactMessages(
          data.items.map((row) => ({
            ...row,
            createdAt: typeof row.createdAt === 'string' ? row.createdAt : new Date(row.createdAt).toISOString(),
          })),
        );
        setContactPagination(data.pagination);
      } catch (err) {
        setContactError(err instanceof Error ? err.message : 'Mesajlar alinamadi');
        setContactMessages([]);
      } finally {
        setContactLoading(false);
      }
    },
    [authFetch],
  );

  const markContactRead = useCallback(
    async (id: string) => {
      await authFetch(`/admin/contact/${id}/read`, { method: 'PATCH' });
    },
    [authFetch],
  );

  const markContactReplied = useCallback(
    async (id: string) => {
      await authFetch(`/admin/contact/${id}/reply`, { method: 'PATCH' });
    },
    [authFetch],
  );

  const deleteContactMessage = useCallback(
    async (id: string) => {
      await authFetch(`/admin/contact/${id}`, { method: 'DELETE' });
    },
    [authFetch],
  );

  const saveSettings = useCallback(async (payload: SiteSettings) => {
    const s = (v: string | undefined) => (typeof v === 'string' ? v : '').trim();
    const body = {
      siteName: s(payload.siteName) || 'Bungalov',
      logoUrl: toRelativeMediaUrl(payload.logoUrl),
      faviconUrl: toRelativeMediaUrl(payload.faviconUrl),
      whatsapp: s(payload.whatsapp),
      instagram: s(payload.instagram),
      facebook: s(payload.facebook),
      metaTitle: s(payload.metaTitle),
      metaDescription: s(payload.metaDescription),
      footerTagline: s(payload.footerTagline),
      contactPhone: s(payload.contactPhone),
      contactEmail: s(payload.contactEmail),
      footerLocations: s(payload.footerLocations),
    };
    const response = await authFetch('/admin/settings', {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    const next = (await response.json()) as { operations?: Record<string, unknown> };
    setSettings(mapOperationsToSiteSettings(next.operations ?? {}));
  }, [authFetch]);

  const updatePaymentProvider = useCallback(
    async (
      provider: PaymentProviderSetting['provider'],
      payload: {
        enabled: boolean;
        mode: string;
        publicKey: string | null;
        secretKey: string | null;
        webhookSecret: string | null;
      },
    ) => {
      const response = await authFetch(`/admin/payment-providers/${provider}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      const saved = (await response.json()) as PaymentProviderSetting;
      setPaymentProviderSettings((prev) => {
        const exists = prev.some((item) => item.provider === provider);
        if (exists) {
          return prev.map((item) =>
            item.provider === provider
              ? {
                  ...item,
                  ...saved,
                  enabled: Boolean(saved.enabled),
                }
              : item,
          );
        }
        return [{ ...saved, enabled: Boolean(saved.enabled) }, ...prev];
      });
      return saved;
    },
    [authFetch],
  );

  const saveEmailSettings = useCallback(
    async (payload: EmailSettingsState & { password?: string }) => {
      const { password, ...rest } = payload;
      const body: Record<string, unknown> = { ...rest };
      if (password) body.password = password;
      const response = await authFetch('/admin/email-settings', {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      const saved = (await response.json()) as EmailSettingsState;
      setEmailSettings({
        ...DEFAULT_EMAIL_SETTINGS,
        ...saved,
        port: Number(saved.port) || 587,
      });
    },
    [authFetch],
  );

  const sendTestEmail = useCallback(
    async (to: string) => {
      const response = await authFetch('/admin/email-settings/test', {
        method: 'POST',
        body: JSON.stringify({ to }),
      });
      if (!response.ok) {
        const raw = await response.text();
        throw new Error(raw || `API ${response.status}`);
      }
    },
    [authFetch],
  );

  const createBlogPost = useCallback(
    async (payload: Record<string, unknown>) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch(`${getApiBaseUrl()}/admin/blog/posts`, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!response.ok) {
        throw new Error(await parseBlogError(response));
      }
      const created = (await response.json()) as BlogPostRecord;
      setBlogPosts((prev) => [created, ...prev]);
      return created;
    },
    [],
  );

  const updateBlogPost = useCallback(
    async (id: string, payload: Record<string, unknown>) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch(`${getApiBaseUrl()}/admin/blog/posts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!response.ok) {
        throw new Error(await parseBlogError(response));
      }
      const updated = (await response.json()) as BlogPostRecord;
      setBlogPosts((prev) => prev.map((p) => (p.id === id ? updated : p)));
      return updated;
    },
    [],
  );

  const deleteBlogPost = useCallback(
    async (id: string) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch(`${getApiBaseUrl()}/admin/blog/posts/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!response.ok) {
        throw new Error(await parseBlogError(response));
      }
      setBlogPosts((prev) => prev.filter((p) => p.id !== id));
    },
    [],
  );

  return {
    loading,
    error,
    stats,
    bungalows,
    setBungalows,
    reservations,
    setReservations,
    payments,
    setPayments,
    paymentProviderSettings,
    setPaymentProviderSettings,
    translations,
    setTranslations,
    users,
    setUsers,
    mediaItems,
    setMediaItems,
    uploadMedia,
    deleteMedia,
    updatePaymentProvider,
    sitePages,
    setSitePages,
    contentSections,
    setContentSections,
    settings,
    setSettings,
    saveSettings,
    emailSettings,
    setEmailSettings,
    saveEmailSettings,
    sendTestEmail,
    contactMessages,
    contactPagination,
    contactLoading,
    contactError,
    fetchContactMessages,
    markContactRead,
    markContactReplied,
    deleteContactMessage,
    revenueChartData,
    updateReservationStatus,
    createManualReservation,
    createBungalow,
    updateBungalow,
    deleteBungalow,
    blogPosts,
    createBlogPost,
    updateBlogPost,
    deleteBlogPost,
    refresh,
  };
}
