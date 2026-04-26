import type { AdminMenuKey } from '@/modules/admin/types';

/** `admin.menu.*` eksikse (eski ceviriler) yedek etiket. */
export function adminMenuLabel(
  t: { has: (key: string) => boolean; (key: string): string },
  tNav: (key: 'blog') => string,
  key: AdminMenuKey,
): string {
  const path = `menu.${key}`;
  if (t.has(path)) return t(path);
  if (key === 'blog') return tNav('blog');
  return key;
}
