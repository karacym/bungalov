import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ContactView } from '@/components/contact-view';
import { getSiteBranding } from '@/lib/site-branding';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'meta' });
  return {
    title: t('contactTitle'),
    description: t('contactDescription'),
  };
}

export default async function ContactPage() {
  const branding = await getSiteBranding();
  return <ContactView contactPhone={branding.contactPhone} contactEmail={branding.contactEmail} />;
}