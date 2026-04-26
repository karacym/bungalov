import './globals.css';
import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { getSiteBranding } from '@/lib/site-branding';

const sans = Plus_Jakarta_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sans',
  display: 'swap',
});

/** .env satir sonu (\r) kirik URL olusturmasin diye trim */
const siteOrigin = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').trim();

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getSiteBranding();
  const title = branding.metaTitle?.trim() || branding.siteName || 'Bungalov';
  const description =
    branding.metaDescription?.trim() || 'Nature-themed bungalow rental platform';
  const ogTitle = branding.siteName || title;

  const brand = branding.siteName?.trim() || 'Bungalov';
  const faviconVersion = encodeURIComponent(
    (branding.faviconUrl?.trim() || branding.logoUrl?.trim() || brand).slice(0, 120),
  );
  return {
    metadataBase: new URL(siteOrigin),
    title: {
      default: title,
      template: `%s | ${brand}`,
    },
    description,
    openGraph: {
      title: ogTitle,
      description,
      type: 'website',
    },
    icons: {
      icon: [{ url: `/api/site-favicon?v=${faviconVersion}` }],
      shortcut: [{ url: `/api/site-favicon?v=${faviconVersion}` }],
      apple: [{ url: `/api/site-favicon?v=${faviconVersion}` }],
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={sans.variable}>
      <body className={sans.className} style={{ margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
