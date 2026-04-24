import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';

type Props = { children: ReactNode; params: { locale: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'contact' });
  return {
    title: t('pageTitle'),
    description: t('intro'),
  };
}

export default function ContactLayout({ children }: Props) {
  return children;
}
