import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'meta' });
  return {
    title: t('reservationTitle'),
    description: t('reservationDescription'),
  };
}

export default function ReservationLayout({ children }: { children: React.ReactNode }) {
  return children;
}
