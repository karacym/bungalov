import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { isRTL, locales } from '@/i18n/config';
import Link from 'next/link';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(params.locale as (typeof locales)[number])) {
    notFound();
  }

  const messages = await getMessages();
  const dir = isRTL(params.locale as 'tr' | 'en' | 'ar') ? 'rtl' : 'ltr';

  return (
    <NextIntlClientProvider messages={messages}>
      <div dir={dir} className="min-h-screen">
        <header className="border-b bg-white">
          <nav className="mx-auto flex max-w-6xl items-center justify-between p-4">
            <Link href={`/${params.locale}`} className="font-semibold text-forest">
              Bungalov
            </Link>
            <div className="flex gap-3">
              {locales.map((locale) => (
                <Link key={locale} href={`/${locale}`} className="rounded border px-2 py-1 text-sm">
                  {locale.toUpperCase()}
                </Link>
              ))}
            </div>
          </nav>
        </header>
        {children}
      </div>
    </NextIntlClientProvider>
  );
}
