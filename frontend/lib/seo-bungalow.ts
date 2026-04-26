import type { Bungalow } from '@/lib/api';

/** Google önerisi: ~150–160 karakter, tek satır. */
export function truncateMetaDescription(text: string, max = 158): string {
  const oneLine = text.replace(/\s+/g, ' ').trim();
  if (oneLine.length <= max) return oneLine;
  return `${oneLine.slice(0, max - 1).trimEnd()}…`;
}

export function buildBungalowMetaDescription(b: Bungalow, reservePhrase: string): string {
  const city = b.location.split(',')[0]?.trim() || b.location;
  const core = truncateMetaDescription(`${b.title}. ${b.description}`, 120);
  const withCta = truncateMetaDescription(`${core} ${reservePhrase} ${city}.`, 158);
  return withCta;
}

/** `generateMetadata` içinde `title.template` ile birleşecek kısa başlık parçası. */
export function buildBungalowTitleSegment(b: Bungalow): string {
  const price = typeof b.pricePerNight === 'string' ? Number(b.pricePerNight) : b.pricePerNight;
  const p = Number.isFinite(price) ? Math.round(price) : 0;
  const city = b.location.split(',')[0]?.trim() || b.location;
  return `${b.title} — ${p} TL / gece · ${city}`;
}

export function bungalowJsonLd(b: Bungalow, canonicalUrl: string) {
  const price = typeof b.pricePerNight === 'string' ? Number(b.pricePerNight) : b.pricePerNight;
  const p = Number.isFinite(price) ? String(Math.round(price * 100) / 100) : '0';
  const images = (b.images ?? []).filter(Boolean).slice(0, 8);
  const locality = b.location.split(',')[0]?.trim() || b.location;
  return {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: b.title,
    description: truncateMetaDescription(b.description, 300),
    url: canonicalUrl,
    image: images,
    address: {
      '@type': 'PostalAddress',
      addressLocality: locality,
      streetAddress: b.location,
    },
    priceRange: `${p} TRY`,
    makesOffer: {
      '@type': 'Offer',
      price: p,
      priceCurrency: 'TRY',
      priceValidUntil: new Date(Date.now() + 180 * 86400000).toISOString().slice(0, 10),
      availability: 'https://schema.org/InStock',
      url: canonicalUrl,
    },
  };
}
