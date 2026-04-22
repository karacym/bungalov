import Link from 'next/link';

export function SiteFooter({ locale }: { locale: string }) {
  return (
    <footer className="mt-16 border-t bg-white py-10 text-slate-700">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 md:flex-row md:justify-between">
        <div>
          <p className="font-semibold text-forest">Bungalov</p>
          <p className="mt-2 text-sm">Doganin icinde guvenli ve konforlu konaklama.</p>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <Link href={`/${locale}`} className="hover:text-forest">
            Ana Sayfa
          </Link>
          <Link href={`/${locale}/bungalows`} className="hover:text-forest">
            Bungalovlar
          </Link>
          <Link href={`/${locale}/contact`} className="hover:text-forest">
            Iletisim
          </Link>
          <Link href={`/${locale}/admin/login`} className="hover:text-forest">
            Yonetim girisi
          </Link>
        </div>
        <div className="text-sm">
          <p>+90 500 000 00 00</p>
          <p className="mt-1">info@savaskara.com</p>
        </div>
      </div>
      <p className="mt-8 text-center text-xs text-slate-500">© {new Date().getFullYear()} Bungalov</p>
    </footer>
  );
}
