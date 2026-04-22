'use client';

import Link from 'next/link';
import { useState } from 'react';

type Labels = { home: string; bungalows: string; contact: string };

export function MobileMenu({ locale, labels }: { locale: string; labels: Labels }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-label="Menu"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-bgl-mist bg-white/80 text-bgl-ink shadow-sm"
      >
        <span className="sr-only">Menu</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          ) : (
            <>
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </>
          )}
        </svg>
      </button>
      {open ? (
        <>
          <button type="button" className="fixed inset-0 z-40 bg-bgl-ink/40" aria-label="Kapat" onClick={() => setOpen(false)} />
          <div className="fixed right-4 top-16 z-50 w-64 rounded-2xl border border-bgl-mist bg-white p-4 shadow-xl">
            <nav className="flex flex-col gap-1 text-sm font-medium text-bgl-ink">
              <Link href={`/${locale}`} className="rounded-lg px-3 py-2 hover:bg-bgl-cream" onClick={() => setOpen(false)}>
                {labels.home}
              </Link>
              <Link href={`/${locale}/bungalows`} className="rounded-lg px-3 py-2 hover:bg-bgl-cream" onClick={() => setOpen(false)}>
                {labels.bungalows}
              </Link>
              <Link href={`/${locale}/contact`} className="rounded-lg px-3 py-2 hover:bg-bgl-cream" onClick={() => setOpen(false)}>
                {labels.contact}
              </Link>
            </nav>
          </div>
        </>
      ) : null}
    </div>
  );
}
