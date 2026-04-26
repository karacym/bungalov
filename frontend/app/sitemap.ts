import { MetadataRoute } from 'next';
import { locales } from '@/i18n/config';
import type { Bungalow } from '@/lib/api';

async function fetchBungalowList(): Promise<Bungalow[]> {
  const api = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api').replace(/\/$/, '');
  try {
    const res = await fetch(`${api}/bungalows`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    return (await res.json()) as Bungalow[];
  } catch {
    return [];
  }
}

async function fetchBlogSlugs(): Promise<string[]> {
  const api = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api').replace(/\/$/, '');
  try {
    const res = await fetch(`${api}/blog/posts?locale=tr`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = (await res.json()) as Array<{ slug?: string }>;
    if (!Array.isArray(data)) return [];
    return data.map((row) => String(row.slug ?? '')).filter(Boolean);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').trim().replace(/\/$/, '');
  const staticPaths = ['', '/bungalows', '/contact', '/search', '/blog'];

  const bungalows = await fetchBungalowList();
  const blogSlugs = await fetchBlogSlugs();
  const bungalowEntries: MetadataRoute.Sitemap = [];
  const blogEntries: MetadataRoute.Sitemap = [];
  for (const locale of locales) {
    for (const b of bungalows) {
      const seg = (b.slug && String(b.slug).trim()) || b.id;
      bungalowEntries.push({
        url: `${base}/${locale}/bungalows/${seg}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.85,
      });
    }
    for (const slug of blogSlugs) {
      blogEntries.push({
        url: `${base}/${locale}/blog/${encodeURIComponent(slug)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.65,
      });
    }
  }

  const staticEntries = locales.flatMap((locale) =>
    staticPaths.map((path) => ({
      url: `${base}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: path === '' ? ('daily' as const) : ('weekly' as const),
      priority: path === '' ? 1 : 0.7,
    })),
  );

  return [...staticEntries, ...bungalowEntries, ...blogEntries];
}
