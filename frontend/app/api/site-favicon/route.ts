import { getSiteBranding } from '@/lib/site-branding';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function makeFallbackSvg(label: string): string {
  const ch = (label.trim().charAt(0) || 'B').toUpperCase();
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
  <defs>
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#2f6b4f"/>
      <stop offset="100%" stop-color="#143b2f"/>
    </linearGradient>
  </defs>
  <rect x="8" y="8" width="112" height="112" rx="24" fill="url(#g)"/>
  <text x="64" y="78" text-anchor="middle" font-family="Arial, sans-serif" font-size="64" font-weight="700" fill="#f8f5ea">${ch}</text>
</svg>`;
}

async function fetchIcon(url: string): Promise<Response | null> {
  if (!url) return null;
  const target = url.trim();
  if (!/^https?:\/\//i.test(target)) return null;

  const res = await fetch(target, {
    cache: 'no-store',
    signal: AbortSignal.timeout(12_000),
    headers: { Accept: 'image/*' },
  });
  if (!res.ok) return null;
  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.startsWith('image/')) return null;
  const body = await res.arrayBuffer();
  return new Response(body, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}

export async function GET(): Promise<Response> {
  try {
    const branding = await getSiteBranding();
    const candidates = [branding.faviconUrl, branding.logoUrl];
    for (const c of candidates) {
      const proxied = await fetchIcon(c);
      if (proxied) return proxied;
    }

    return new Response(makeFallbackSvg(branding.siteName || 'Bungalov'), {
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch {
    return new Response(makeFallbackSvg('Bungalov'), {
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  }
}
