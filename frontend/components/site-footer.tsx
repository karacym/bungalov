import Link from 'next/link';

export function SiteFooter({ locale }: { locale: string }) {
  return (
    <footer className="mt-auto border-t border-bgl-mist/80 bg-bgl-mossDark text-bgl-cream">
      <div className="bgl-container grid gap-10 py-14 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="text-lg font-semibold tracking-tight">Bungalov</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/75">
            Doganin icinde, sade cizgilerle tasarlanmis bungalov deneyimi. Sessizlik, konfor ve guvenli rezervasyon.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="https://wa.me/905000000000"
              className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white ring-1 ring-white/20 transition hover:bg-white/20"
            >
              WhatsApp
            </a>
            <Link
              href={`/${locale}/bungalows`}
              className="rounded-full bg-bgl-moss px-4 py-2 text-xs font-semibold text-white ring-1 ring-white/10 transition hover:bg-white/10"
            >
              Rezervasyon
            </Link>
          </div>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 md:col-span-4 md:col-start-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/50">Gezin</p>
            <ul className="mt-4 space-y-2 text-sm text-white/85">
              <li>
                <Link href={`/${locale}`} className="hover:text-white">
                  Ana Sayfa
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/bungalows`} className="hover:text-white">
                  Bungalovlar
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/contact`} className="hover:text-white">
                  Iletisim
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/admin/login`} className="hover:text-white">
                  Yonetim
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/50">Iletisim</p>
            <ul className="mt-4 space-y-2 text-sm text-white/85">
              <li>+90 500 000 00 00</li>
              <li>info@savaskara.com</li>
              <li className="pt-2 text-xs text-white/50">Sapanca · Bolu · Bursa</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-6">
        <p className="bgl-container text-center text-xs text-white/45">© {new Date().getFullYear()} Bungalov · Tum haklari saklidir.</p>
      </div>
    </footer>
  );
}
