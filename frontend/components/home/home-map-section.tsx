'use client';

import { getHomeMapConfigWithDefaults, type HomeMapPublicConfig } from '@/lib/home-map-from-storage';
import { DEFAULT_HOME_MAP } from '@/lib/site-pages-config';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';

export function HomeMapSection() {
  const t = useTranslations('homeMap');
  const [config, setConfig] = useState<HomeMapPublicConfig>(DEFAULT_HOME_MAP);

  useEffect(() => {
    const syncFromStorage = () => {
      setConfig(getHomeMapConfigWithDefaults());
    };
    syncFromStorage();
    window.addEventListener('site-pages-updated', syncFromStorage);
    window.addEventListener('storage', syncFromStorage);
    return () => {
      window.removeEventListener('site-pages-updated', syncFromStorage);
      window.removeEventListener('storage', syncFromStorage);
    };
  }, []);

  const safeUrl = useMemo(() => {
    if (!config.mapButtonUrl) return '#';
    return config.mapButtonUrl;
  }, [config.mapButtonUrl]);

  return (
    <div className="mt-10 grid gap-4 md:grid-cols-[1.35fr_1fr]">
      <div className="overflow-hidden rounded-[2rem] border border-bgl-mist bg-white shadow-soft ring-1 ring-black/5">
        <iframe title={t('iframeTitle')} className="h-80 w-full md:h-96" src={config.mapEmbedUrl} loading="lazy" />
      </div>
      <div className="rounded-[2rem] border border-bgl-mist bg-white p-6 shadow-soft ring-1 ring-black/5 md:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bgl-muted">{t('locationEyebrow')}</p>
        <h3 className="mt-3 text-xl font-semibold text-bgl-ink">{config.mapTitle}</h3>
        <p className="mt-2 text-sm font-medium text-bgl-mossDark">{config.mapAddress}</p>
        <p className="mt-3 text-sm leading-relaxed text-bgl-muted">{config.mapNote}</p>
        <a
          href={safeUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex rounded-full bg-bgl-moss px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-bgl-mossDark"
        >
          {config.mapButtonLabel}
        </a>
      </div>
    </div>
  );
}
