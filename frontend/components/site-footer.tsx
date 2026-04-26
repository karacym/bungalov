import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import type { SiteBranding } from '@/lib/site-branding';

function waHref(raw: string | undefined | null) {
  const t = (raw ?? '').trim();
  if (!t) return 'https://wa.me/905000000000';
  if (t.startsWith('http')) return t;
  const digits = t.replace(/\D/g, '');
  if (!digits) return 'https://wa.me/905000000000';
  return `https://wa.me/${digits}`;
}

function socialHref(kind: 'ig' | 'fb', raw: string | undefined | null) {
  const v = (raw ?? '').trim();
  if (!v) return '';
  if (v.startsWith('http')) return v;
  if (kind === 'ig') return `https://www.instagram.com/${v.replace(/^@/, '').replace(/\/$/, '')}/`;
  return `https://www.facebook.com/${v.replace(/^\//, '')}`;
}

export async function SiteFooter({ locale, branding }: { locale: string; branding: SiteBranding }) {
  const tNav = await getTranslations({ locale, namespace: 'nav' });
  const tCta = await getTranslations({ locale, namespace: 'cta' });
  const tFoot = await getTranslations({ locale, namespace: 'footer' });

  const siteTitle = branding.siteName?.trim() || 'Bungalov';
  const tagline = branding.footerTagline?.trim() || tFoot('defaultTagline');
  const phone = branding.contactPhone?.trim() || '+90 500 000 00 00';
  const email = branding.contactEmail?.trim() || 'info@savaskara.com';
  const locations = branding.footerLocations?.trim() || 'Sapanca · Bolu · Bursa';
  const ig = socialHref('ig', branding.instagram);
  const fb = socialHref('fb', branding.facebook);

  return (
    <footer className="mt-auto border-t border-bgl-mist/80 bg-bgl-mossDark text-bgl-cream">
      <div className="bgl-container grid gap-10 py-14 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="text-lg font-semibold tracking-tight">{siteTitle}</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/75">{tagline}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={waHref(branding.whatsapp)}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white ring-1 ring-white/20 transition hover:bg-white/20"
            >
              {tCta('whatsapp')}
            </a>
            <Link
              href={`/${locale}/bungalows`}
              className="rounded-full bg-bgl-moss px-4 py-2 text-xs font-semibold text-white ring-1 ring-white/10 transition hover:bg-white/10"
            >
              {tCta('reserve')}
            </Link>
            {ig ? (
              <a
                href={ig}
                target="_blank"
                rel="noreferrer"
                aria-label={tFoot('instagram')}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 transition hover:bg-white/20"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
                  <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm11.5 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
                </svg>
              </a>
            ) : null}
            {fb ? (
              <a
                href={fb}
                target="_blank"
                rel="noreferrer"
                aria-label={tFoot('facebook')}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 transition hover:bg-white/20"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
                  <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.6 1.6-1.6h1.7V4.8c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.2V11H8v3h2.4v8h3.1z" />
                </svg>
              </a>
            ) : null}
          </div>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 md:col-span-4 md:col-start-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/50">{tFoot('browse')}</p>
            <ul className="mt-4 space-y-2 text-sm text-white/85">
              <li>
                <Link href={`/${locale}`} className="hover:text-white">
                  {tNav('home')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/bungalows`} className="hover:text-white">
                  {tNav('bungalows')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/contact`} className="hover:text-white">
                  {tNav('contact')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/admin/login`} className="hover:text-white">
                  {tNav('admin')}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/50">{tNav('contact')}</p>
            <ul className="mt-4 space-y-2 text-sm text-white/85">
              <li>
                <a href={`tel:${phone.replace(/\D/g, '')}`} className="hover:text-white">
                  {phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${email}`} className="hover:text-white">
                  {email}
                </a>
              </li>
              <li className="pt-2 text-xs text-white/50">{locations}</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-6">
        <p className="bgl-container text-center text-xs text-white/45">
          © {new Date().getFullYear()} {siteTitle} · {tFoot('rightsReserved')}
        </p>
      </div>
    </footer>
  );
}
