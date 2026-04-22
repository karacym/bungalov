import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { isRTL, locales } from '@/i18n/config';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

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

  setRequestLocale(params.locale);

  const messages = await getMessages();
  const t = await getTranslations('nav');
  const dir = isRTL(params.locale as 'tr' | 'en' | 'ar') ? 'rtl' : 'ltr';

  return (
    <NextIntlClientProvider messages={messages}>
      <div dir={dir} className="flex min-h-screen flex-col">
        <SiteHeader
          locale={params.locale}
          labels={{ home: t('home'), bungalows: t('bungalows'), contact: t('contact') }}
        />
        <div className="flex-1">{children}</div>
        <SiteFooter locale={params.locale} />
      </div>
    </NextIntlClientProvider>
  );
}
