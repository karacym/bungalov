'use client';

import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react';

type BungalowGalleryLightboxProps = {
  images: string[];
  alts: string[];
  title: string;
  children: ReactNode;
};

export function BungalowGalleryLightbox({ images, alts, title, children }: BungalowGalleryLightboxProps) {
  const t = useTranslations('bungalowDetail');
  const tb = useTranslations('bungalow');
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const dialogLabelId = useId();

  const count = images.length;
  const open = useCallback((i: number) => setOpenIndex(i), []);
  const close = useCallback(() => setOpenIndex(null), []);

  const goPrev = useCallback(() => {
    setOpenIndex((cur) => (cur == null || count < 1 ? cur : (cur - 1 + count) % count));
  }, [count]);

  const goNext = useCallback(() => {
    setOpenIndex((cur) => (cur == null || count < 1 ? cur : (cur + 1) % count));
  }, [count]);

  useEffect(() => {
    if (openIndex == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    queueMicrotask(() => closeBtnRef.current?.focus());
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [openIndex, close, goPrev, goNext]);

  if (!count) {
    return (
      <section className="bgl-card overflow-hidden" aria-labelledby="bungalow-details-heading">
        {children}
      </section>
    );
  }

  const first = images[0];
  const firstAlt = alts[0] ?? title;
  const rest = images.slice(1);
  const restAlts = alts.slice(1);

  return (
    <>
      <section className="bgl-card overflow-hidden" aria-labelledby="bungalow-details-heading">
        <button
          type="button"
          className="group relative block aspect-[21/10] w-full min-h-[220px] cursor-zoom-in border-0 bg-bgl-mist p-0 text-left"
          onClick={() => open(0)}
          aria-label={t('lightboxOpen')}
        >
          <Image
            src={first}
            alt={firstAlt}
            fill
            className="object-cover transition duration-300 group-hover:opacity-95"
            priority
            sizes="100vw"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bgl-ink/40 to-transparent" />
          <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-bgl-ink/75 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-md transition group-hover:opacity-100">
            {t('lightboxHint')}
          </span>
        </button>
        {children}
      </section>

      {rest.length > 0 ? (
        <section className="bgl-card p-6 md:p-8" aria-labelledby="bungalow-gallery-heading">
          <h2 id="bungalow-gallery-heading" className="bgl-heading">
            {tb('galleryTitle')}
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
            {rest.map((src, idx) => {
              const globalIndex = idx + 1;
              return (
                <button
                  key={`${globalIndex}-${src}`}
                  type="button"
                  onClick={() => open(globalIndex)}
                  className="group relative aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-xl bg-bgl-mist ring-1 ring-black/5 transition ring-offset-2 ring-offset-white hover:ring-bgl-moss/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bgl-moss"
                  aria-label={t('lightboxOpenNumber', { n: globalIndex + 1 })}
                >
                  <Image
                    src={src}
                    alt={restAlts[idx] ?? `${title} ${globalIndex + 1}`}
                    fill
                    className="object-cover transition duration-300 group-hover:scale-[1.02]"
                    sizes="(max-width:768px) 50vw, 33vw"
                  />
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      {openIndex != null ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-bgl-ink/90 p-3 backdrop-blur-sm md:p-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby={dialogLabelId}
          onClick={close}
        >
          <div
            className="flex max-h-[100dvh] w-full max-w-6xl flex-col gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between gap-3 text-white">
              <p id={dialogLabelId} className="min-w-0 truncate text-sm font-semibold tracking-tight">
                {title}
              </p>
              <p className="shrink-0 tabular-nums text-xs text-white/75">
                {t('lightboxCounter', { current: openIndex + 1, total: count })}
              </p>
              <button
                ref={closeBtnRef}
                type="button"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                onClick={close}
                aria-label={t('lightboxClose')}
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            <div className="relative flex min-h-0 flex-1 items-center justify-center">
              {count > 1 ? (
                <button
                  type="button"
                  className="absolute left-0 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 md:left-1 md:h-12 md:w-12"
                  onClick={goPrev}
                  aria-label={t('lightboxPrev')}
                >
                  <ChevronLeft className="h-6 w-6 md:h-7 md:w-7" aria-hidden />
                </button>
              ) : null}
              <div className="relative mx-auto aspect-[4/3] w-full max-h-[min(78vh,820px)] max-w-5xl md:aspect-video">
                <Image
                  src={images[openIndex] ?? first}
                  alt={alts[openIndex] ?? firstAlt}
                  fill
                  className="object-contain"
                  sizes="(max-width:768px) 100vw, 896px"
                  priority
                />
              </div>
              {count > 1 ? (
                <button
                  type="button"
                  className="absolute right-0 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 md:right-1 md:h-12 md:w-12"
                  onClick={goNext}
                  aria-label={t('lightboxNext')}
                >
                  <ChevronRight className="h-6 w-6 md:h-7 md:w-7" aria-hidden />
                </button>
              ) : null}
            </div>

            {count > 1 ? (
              <div
                className="flex shrink-0 gap-2 overflow-x-auto pb-1 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                role="tablist"
                aria-label={t('lightboxThumbnails')}
              >
                {images.map((src, i) => (
                  <button
                    key={`thumb-${i}-${src}`}
                    type="button"
                    onClick={() => setOpenIndex(i)}
                    className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg ring-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 ${
                      i === openIndex ? 'ring-white opacity-100' : 'ring-transparent opacity-55 hover:opacity-90'
                    }`}
                    aria-label={t('lightboxGoTo', { n: i + 1 })}
                    aria-current={i === openIndex ? 'true' : undefined}
                  >
                    <Image src={src} alt="" fill className="object-cover" sizes="80px" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
