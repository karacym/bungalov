export const locales = ['tr', 'en', 'ar'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'tr';

export function isRTL(locale: Locale) {
  return locale === 'ar';
}
