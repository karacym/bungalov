import createMiddleware from 'next-intl/middleware';
import { defaultLocale, locales } from './i18n/config';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

/**
 * next-intl resmi desen: `/_next`, `/_vercel`, `api`, dosya uzantili yollar middleware'e girmez.
 * Ayni projede iki `next dev` calistirmayin — ikisi de `.next`e yazar; chunk/CSS 500 donebilir.
 */
export const config = {
  matcher: ['/', '/((?!api|site-favicon|_next|_vercel|.*\\..*).*)'],
};
