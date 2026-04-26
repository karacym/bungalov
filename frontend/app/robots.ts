import { MetadataRoute } from 'next';
import { locales } from '@/i18n/config';

export default function robots(): MetadataRoute.Robots {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').trim().replace(/\/$/, '');
  const disallowAdmin = locales.map((locale) => `/${locale}/admin`);

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api', ...disallowAdmin],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
