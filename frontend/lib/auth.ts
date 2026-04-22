import { NextRequest, NextResponse } from 'next/server';
import { locales } from './i18n/config';

export function isLocale(value: string): value is (typeof locales)[number] {
  return locales.includes(value as (typeof locales)[number]);
}

export function localeFromPath(pathname: string) {
  const segment = pathname.split('/')[1];
  return isLocale(segment) ? segment : null;
}

export function authMiddleware(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value;
  const locale = localeFromPath(req.nextUrl.pathname) ?? 'tr';

  if (!token && req.nextUrl.pathname.includes('/admin/dashboard')) {
    return NextResponse.redirect(new URL(`/${locale}/admin/login`, req.url));
  }

  return NextResponse.next();
}
