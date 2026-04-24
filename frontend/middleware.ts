import createMiddleware from 'next-intl/middleware';
import { defaultLocale, locales } from './i18n/config';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

/** CSS/JS ve RSC icin _next yollarini acikca disla (locale middleware yanlis yonlendirmesin) */
export const config = {
  matcher: [
    '/',
    '/((?!api|_next/static|_next/image|_next/webpack|_next/data|_vercel|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)',
  ],
};
