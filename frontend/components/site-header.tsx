import Link from 'next/link';
import { MobileMenu } from '@/components/mobile-menu';

const LOCALES = ['tr', 'en', 'ar'] as const;

type NavLabels = { home: string; bungalows: string; contact: string };

export function SiteHeader({ locale, labels }: { locale: string; labels: NavLabels }) {
  return (
    <header className="sticky top-0 z-40 border-b border-bgl-mist/70 bg-bgl-cream/85 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:py-4">
        <Link
          href={`/${locale}`}
          className="group flex items-center gap-2 font-semibold tracking-tight text-bgl-moss"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-bgl-moss text-sm text-white shadow-sm ring-1 ring-bgl-moss/20">
            B
          </span>
          <span className="text-lg transition-colors group-hover:text-bgl-mossDark md:text-xl">Bungalov</span>
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
          <MobileMenu locale={locale} labels={labels} />
        </div>
      </nav>
    </header>
  );
}
