import { getApiBaseUrl, toAbsoluteMediaUrl } from '@/lib/api';

export type SiteBranding = {
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

const FALLBACK: SiteBranding = {
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
};

export async function getSiteBranding(): Promise<SiteBranding> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/site/branding`, {
      next: { revalidate: 30 },
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return FALLBACK;
    const parsed = await res.json();
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return FALLBACK;
    const raw = parsed as Partial<SiteBranding>;
    return {
      ...FALLBACK,
      ...raw,
      siteName: raw.siteName?.trim() || FALLBACK.siteName,
      logoUrl: toAbsoluteMediaUrl(String(raw.logoUrl ?? '')),
      faviconUrl: toAbsoluteMediaUrl(String(raw.faviconUrl ?? '')),
      metaTitle: String(raw.metaTitle ?? ''),
      metaDescription: String(raw.metaDescription ?? ''),
      whatsapp: String(raw.whatsapp ?? ''),
      instagram: String(raw.instagram ?? ''),
      facebook: String(raw.facebook ?? ''),
      footerTagline: String(raw.footerTagline ?? FALLBACK.footerTagline),
      contactPhone: String(raw.contactPhone ?? FALLBACK.contactPhone),
      contactEmail: String(raw.contactEmail ?? FALLBACK.contactEmail),
      footerLocations: String(raw.footerLocations ?? FALLBACK.footerLocations),
    };
  } catch {
    return FALLBACK;
  }
}
