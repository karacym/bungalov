import type { PublicGoogleReview } from '@/lib/api';

type Props = {
  reviews: PublicGoogleReview[];
  eyebrow: string;
  title: string;
  empty: string;
  locale: string;
};

function GoogleGMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="28" height="28" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function dateLocaleTag(locale: string): string {
  if (locale === 'ar') return 'ar';
  if (locale === 'en') return 'en-US';
  return 'tr-TR';
}

export function GoogleReviewsSection({ reviews, eyebrow, title, empty, locale }: Props) {
  const dateLocale = dateLocaleTag(locale);
  return (
    <section className="bgl-container mt-16 md:mt-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="bgl-section-title">{eyebrow}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <GoogleGMark className="shrink-0" />
            <h2 className="bgl-heading !mt-0">{title}</h2>
          </div>
        </div>
      </div>

      {reviews.length === 0 ? (
        <p className="mt-8 text-sm text-bgl-muted">{empty}</p>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {reviews.map((r) => (
            <blockquote key={r.id} className="bgl-card p-6">
              <div className="mb-2 flex items-center gap-1 text-amber-500" aria-label={`${r.rating}/5`}>
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i}>{i < r.rating ? '★' : '☆'}</span>
                ))}
              </div>
              <p className="text-sm leading-relaxed text-bgl-muted md:text-base">&ldquo;{r.text}&rdquo;</p>
              <footer className="mt-5 space-y-1">
                <p className="text-sm font-semibold text-bgl-ink">{r.authorName}</p>
                <p className="text-xs text-bgl-muted">
                  {r.bungalowTitle} ·{' '}
                  {new Date(r.reviewedAt).toLocaleDateString(dateLocale, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </footer>
            </blockquote>
          ))}
        </div>
      )}
    </section>
  );
}
