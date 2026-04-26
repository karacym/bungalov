export type AdminMenuKey =
  | 'dashboard'
  | 'bungalows'
  | 'channels'
  | 'reservations'
  | 'calendar'
  | 'payments'
  | 'users'
  | 'media'
  | 'pages'
  | 'blog'
  | 'content'
  | 'translations'
  | 'reports'
  | 'contact'
  | 'emailSettings'
  | 'settings';

/** API: GET /admin/blog/posts */
export type BlogPostRecord = {
  id: string;
  slug: string;
  status: 'draft' | 'published';
  publishedAt: string | null;
  titleTr: string;
  titleEn: string;
  titleAr: string;
  excerptTr: string;
  excerptEn: string;
  excerptAr: string;
  bodyTr: string;
  bodyEn: string;
  bodyAr: string;
  metaTitleTr: string | null;
  metaTitleEn: string | null;
  metaTitleAr: string | null;
  metaDescTr: string | null;
  metaDescEn: string | null;
  metaDescAr: string | null;
  createdAt: string;
  updatedAt: string;
};

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

export type ReservationSource = 'DIRECT' | 'AIRBNB' | 'BOOKING';

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
  slug?: string | null;
  title: string;
  description: string;
  pricePerNight: number;
  capacity: number;
  location: string;
  images: string[];
  features: Partial<Record<BungalowFeatureKey, boolean | string>>;
  icalExportToken?: string | null;
  externalIcalUrl?: string | null;
  googlePlaceId?: string | null;
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
  source: ReservationSource;
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

export type EmailSettingsState = {
  enabled: boolean;
  host: string;
  port: number;
  secure: boolean;
  authUser: string;
  fromName: string;
  fromEmail: string;
  notifyAdminOnNewReservation: boolean;
  notifyAdminOnContact: boolean;
  adminNotifyEmail: string | null;
  hasPassword: boolean;
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
