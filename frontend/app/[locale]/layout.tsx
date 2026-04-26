import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { isRTL, locales } from '@/i18n/config';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { getSiteBranding } from '@/lib/site-branding';

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
  const tCommon = await getTranslations({ locale: params.locale, namespace: 'common' });
  const dir = isRTL(params.locale as 'tr' | 'en' | 'ar') ? 'rtl' : 'ltr';
  const branding = await getSiteBranding();

  return (
    <NextIntlClientProvider messages={messages}>
      {/* Inline: Tailwind CSS hic yuklenmezse bile sayfa iskeleti dengede kalir */}
      <div
        dir={dir}
        className="flex min-h-screen flex-col"
        style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}
      >
        <SiteHeader
          locale={params.locale}
          labels={{ home: t('home'), bungalows: t('bungalows'), blog: t('blog'), contact: t('contact') }}
          branding={{ siteName: branding.siteName, logoUrl: branding.logoUrl }}
          mobileA11y={{ menu: tCommon('a11yMenu'), closeMenu: tCommon('a11yCloseMenu') }}
        />
        <div className="flex-1" style={{ flex: '1 1 0%', minHeight: 0 }}>
          {children}
        </div>
        <SiteFooter locale={params.locale} branding={branding} />
      </div>
    </NextIntlClientProvider>
  );
}
