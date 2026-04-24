import './globals.css';
import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { getSiteBranding } from '@/lib/site-branding';

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
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

  return {
    metadataBase: new URL(siteOrigin),
    title,
    description,
    openGraph: {
      title: ogTitle,
      description,
      type: 'website',
    },
    ...(branding.faviconUrl
      ? {
          icons: {
            icon: [{ url: branding.faviconUrl }],
          },
        }
      : {}),
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
