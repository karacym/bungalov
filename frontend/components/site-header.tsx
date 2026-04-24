import Link from 'next/link';
import Image from 'next/image';
import { MobileMenu } from '@/components/mobile-menu';

const LOCALES = ['tr', 'en', 'ar'] as const;

type NavLabels = { home: string; bungalows: string; contact: string };

type MobileA11y = { menu: string; closeMenu: string };

type SiteHeaderBranding = {
  siteName: string;
  logoUrl: string;
};

export function SiteHeader({
  locale,
  labels,
  branding,
  mobileA11y,
}: {
  locale: string;
  labels: NavLabels;
  branding?: SiteHeaderBranding;
  mobileA11y: MobileA11y;
}) {
  const siteName = branding?.siteName?.trim() || 'Bungalov';
  const logoUrl = branding?.logoUrl?.trim() ?? '';
  const initial = siteName.charAt(0).toUpperCase() || 'B';

  return (
    <header className="sticky top-0 z-40 border-b border-bgl-mist/70 bg-bgl-cream/85 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:py-4">
        <Link
          href={`/${locale}`}
          className="group flex items-center gap-2 font-semibold tracking-tight text-bgl-moss"
        >
          {logoUrl ? (
            <span className="relative flex h-9 w-9 shrink-0 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-bgl-moss/15">
              <Image
                src={logoUrl}
                alt=""
                fill
                className="object-contain p-0.5"
                sizes="36px"
                unoptimized={logoUrl.endsWith('.svg')}
              />
            </span>
          ) : (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-bgl-moss text-sm text-white shadow-sm ring-1 ring-bgl-moss/20">
              {initial}
            </span>
          )}
          <span className="text-lg transition-colors group-hover:text-bgl-mossDark md:text-xl">{siteName}</span>
        </Link>

        <div className="hidden items-center gap-1 rounded-full border border-bgl-mist bg-white/70 p-1 md:flex">
          <Link
            href={`/${locale}`}
            className="rounded-full px-4 py-2 text-sm font-medium text-bgl-muted transition hover:bg-bgl-cream hover:text-bgl-ink"
          >
            {labels.home}
          </Link>
          <Link
            href={`/${locale}/bungalows`}
            className="rounded-full px-4 py-2 text-sm font-medium text-bgl-muted transition hover:bg-bgl-cream hover:text-bgl-ink"
          >
            {labels.bungalows}
          </Link>
          <Link
            href={`/${locale}/contact`}
            className="rounded-full px-4 py-2 text-sm font-medium text-bgl-muted transition hover:bg-bgl-cream hover:text-bgl-ink"
          >
            {labels.contact}
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-full border border-bgl-mist bg-white/80 p-0.5 shadow-sm">
            {LOCALES.map((code) => (
              <Link
                key={code}
                href={`/${code}`}
                className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide transition ${
                  code === locale ? 'bg-bgl-moss text-white shadow' : 'text-bgl-muted hover:text-bgl-ink'
                }`}
              >
                {code}
              </Link>
            ))}
          </div>
          <MobileMenu locale={locale} labels={labels} a11y={mobileA11y} />
        </div>
      </nav>
    </header>
  );
}
