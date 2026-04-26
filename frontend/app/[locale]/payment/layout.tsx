import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'meta' });
  return {
    title: t('paymentTitle'),
    description: t('paymentDescription'),
    robots: { index: false, follow: false },
  };
}

export default function PaymentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
