export type AdminMenuKey =
  | 'dashboard'
  | 'bungalows'
  | 'reservations'
  | 'calendar'
  | 'payments'
  | 'users'
  | 'media'
  | 'pages'
  | 'content'
  | 'translations'
  | 'reports'
  | 'contact'
  | 'settings';

export type ContactMessageRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  isRead: boolean;
  isReplied: boolean;
  createdAt: string;
};

export type ContactListStatus = 'all' | 'unread' | 'read' | 'replied';

export type ReservationStatus = 'pending' | 'approved' | 'cancelled';

export type AdminStats = {
  totalReservations: number;
  monthlyRevenue: number;
  occupancyRate: number;
  todayCheckIns: number;
  todayCheckOuts: number;
};

export type BungalowFeatureKey =
  | 'jacuzzi'
  | 'fireplace'
  | 'pool'
  | 'wifi'
  | 'air_conditioning'
  | 'view_type';

export type Bungalow = {
  id: string;
  title: string;
  description: string;
  pricePerNight: number;
  capacity: number;
  location: string;
  images: string[];
  features: Partial<Record<BungalowFeatureKey, boolean | string>>;
};

export type Reservation = {
  id: string;
  customerName: string;
  customerEmail: string;
  bungalowName: string;
  checkIn: string;
  checkOut: string;
  amount: number;
  status: ReservationStatus;
  paymentStatus: 'pending' | 'paid' | 'failed';
};

export type Payment = {
  id: string;
  amount: number;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  provider: 'iyzico' | 'stripe' | 'paytr' | 'manual';
  createdAt: string;
};

export type PaymentProviderSetting = {
  id: string;
  provider: 'iyzico' | 'stripe' | 'paytr' | 'manual';
  enabled: boolean;
  mode: 'test' | 'live' | string;
  publicKey: string | null;
  secretKey: string | null;
  webhookSecret: string | null;
};

export type TranslationRow = {
  key: string;
  tr: string;
  en: string;
  ar: string;
};

export type SiteSettings = {
  siteName: string;
  logoUrl: string;
  faviconUrl: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  metaTitle: string;
  metaDescription: string;
  footerTagline: string;
  contactPhone: string;
  contactEmail: string;
  footerLocations: string;
};

export type RevenuePoint = {
  month: string;
  revenue: number;
};

export type SitePage = {
  id: string;
  name: string;
  slug: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImages: string[];
  slideIntervalSec: number;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  mapEmbedUrl?: string;
  mapTitle?: string;
  mapAddress?: string;
  mapNote?: string;
  mapButtonLabel?: string;
  mapButtonUrl?: string;
};

export type MediaAsset = {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  createdAt: string;
};
