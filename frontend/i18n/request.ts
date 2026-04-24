import { getRequestConfig } from 'next-intl/server';
import { defaultLocale, locales, type Locale } from './config';
import ar from '../messages/ar.json';
import en from '../messages/en.json';
import tr from '../messages/tr.json';

const messagesByLocale: Record<Locale, typeof tr> = {
  tr,
  en,
  ar,
};

export default getRequestConfig(async ({ locale }) => {
  const activeLocale: Locale = locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;

  return {
    locale: activeLocale,
    messages: messagesByLocale[activeLocale],
  };
});
