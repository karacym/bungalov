import { redirect } from 'next/navigation';
import { defaultLocale } from '@/i18n/config';

/** Kök URL: locale prefix olmadan gelenleri varsayılan dile yönlendir */
export default function RootPage() {
  redirect(`/${defaultLocale}`);
}
