'use client';

import { DEFAULT_HOME_HERO_IMAGES, SITE_PAGES_STORAGE_KEY } from '@/lib/site-pages-config';
import { useEffect, useMemo, useState } from 'react';
import type { SitePage } from '@/modules/admin/types';

type Props = {
  fallbackImages?: string[];
};

function getHomePageData() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SITE_PAGES_STORAGE_KEY);
    if (!raw) return null;
    const pages = JSON.parse(raw) as SitePage[];
    return pages.find((page) => page.id === 'home') ?? null;
  } catch {
    return null;
  }
}

export function HeroBackgroundSlider({ fallbackImages = DEFAULT_HOME_HERO_IMAGES }: Props) {
  const [images, setImages] = useState<string[]>(fallbackImages);
  const [intervalSec, setIntervalSec] = useState(4);
  const [active, setActive] = useState(0);

  const safeImages = useMemo(() => images.filter(Boolean), [images]);

  useEffect(() => {
    const syncFromStorage = () => {
      const home = getHomePageData();
      if (!home) return;
      setImages(home.heroImages?.length ? home.heroImages : fallbackImages);
      setIntervalSec(home.slideIntervalSec && home.slideIntervalSec > 1 ? home.slideIntervalSec : 4);
      setActive(0);
    };
    syncFromStorage();
    window.addEventListener('site-pages-updated', syncFromStorage);
    window.addEventListener('storage', syncFromStorage);
    return () => {
      window.removeEventListener('site-pages-updated', syncFromStorage);
      window.removeEventListener('storage', syncFromStorage);
    };
  }, [fallbackImages]);

  useEffect(() => {
    if (safeImages.length <= 1) return;
    const ms = Math.max(intervalSec, 2) * 1000;
    const timer = window.setInterval(() => {
      setActive((prev) => (prev + 1) % safeImages.length);
    }, ms);
    return () => window.clearInterval(timer);
  }, [safeImages.length, intervalSec]);

  return (
    <div className="absolute inset-0">
      {safeImages.map((src, index) => (
        <img
          key={`${src}-${index}`}
          src={src}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            index === active ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-br from-bgl-ink/85 via-bgl-mossDark/55 to-bgl-moss/35" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.12),_transparent_55%)]" />
    </div>
  );
}
