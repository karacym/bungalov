import type { SitePage } from '@/modules/admin/types';
import { DEFAULT_HOME_MAP, SITE_PAGES_STORAGE_KEY } from '@/lib/site-pages-config';

export type HomeMapPublicConfig = typeof DEFAULT_HOME_MAP;

/** Admin > Site sayfalari > Ana sayfa harita embed URL ve metinleri (localStorage). */
export function readHomeMapConfigFromStorage(): HomeMapPublicConfig | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SITE_PAGES_STORAGE_KEY);
    if (!raw) return null;
    const pages = JSON.parse(raw) as SitePage[];
    const home = pages.find((page) => page.id === 'home');
    if (!home) return null;
    return {
      mapEmbedUrl: home.mapEmbedUrl || DEFAULT_HOME_MAP.mapEmbedUrl,
      mapTitle: home.mapTitle || DEFAULT_HOME_MAP.mapTitle,
      mapAddress: home.mapAddress || DEFAULT_HOME_MAP.mapAddress,
      mapNote: home.mapNote || DEFAULT_HOME_MAP.mapNote,
      mapButtonLabel: home.mapButtonLabel || DEFAULT_HOME_MAP.mapButtonLabel,
      mapButtonUrl: home.mapButtonUrl || DEFAULT_HOME_MAP.mapButtonUrl,
    } satisfies HomeMapPublicConfig;
  } catch {
    return null;
  }
}

export function getHomeMapConfigWithDefaults(): HomeMapPublicConfig {
  return readHomeMapConfigFromStorage() ?? DEFAULT_HOME_MAP;
}
