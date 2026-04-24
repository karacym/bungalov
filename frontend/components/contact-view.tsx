'use client';

import { postContactMessage } from '@/lib/api';
import { getHomeMapConfigWithDefaults, type HomeMapPublicConfig } from '@/lib/home-map-from-storage';
import { DEFAULT_HOME_MAP } from '@/lib/site-pages-config';
import { useTranslations } from 'next-intl';
import { type FormEvent, useEffect, useState } from 'react';

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

type ContactViewProps = {
  contactPhone?: string;
  contactEmail?: string;
};

export function ContactView({ contactPhone, contactEmail }: ContactViewProps = {}) {
  const t = useTranslations('contact');
  /** Sunucu ile istemci ilk render ayni olmali (localStorage sadece useEffect sonrasi). */
  const [mapConfig, setMapConfig] = useState<HomeMapPublicConfig>(DEFAULT_HOME_MAP);

  useEffect(() => {
    const sync = () => setMapConfig(getHomeMapConfigWithDefaults());
    sync();
    window.addEventListener('site-pages-updated', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('site-pages-updated', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  function validate() {
    const next: typeof errors = {};
    if (!name.trim()) next.name = t('validationName');
    if (!email.trim() || !isValidEmail(email)) next.email = t('validationEmail');
    if (!message.trim()) next.message = t('validationMessage');
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError('');
    setSuccess(false);
    if (!validate()) return;
    setLoading(true);
    try {
      const result = await postContactMessage({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        message: message.trim(),
      });
      if (!result.ok) {
        setSubmitError(result.message || t('errorGeneric'));
        return;
      }
      setSuccess(true);
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
      setErrors({});
    } catch {
      setSubmitError(t('errorGeneric'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="pb-20">
      <div className="border-b border-bgl-mist/80 bg-white/70">
        <div className="bgl-container py-10 md:py-14">
          <p className="bgl-section-title">{t('pageEyebrow')}</p>
          <h1 className="bgl-heading mt-2">{t('pageTitle')}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-bgl-muted md:text-base">{t('intro')}</p>
        </div>
      </div>

      <div className="bgl-container mt-8 grid gap-8 md:mt-12 md:grid-cols-2">
        <div className="bgl-card p-6 md:p-8">
          <h2 className="text-lg font-semibold text-bgl-ink">{t('infoTitle')}</h2>
          <dl className="mt-6 space-y-4 text-sm">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-bgl-muted">{t('phoneLabel')}</dt>
              <dd className="mt-1 font-medium text-bgl-ink">{contactPhone?.trim() || '+90 500 000 00 00'}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-bgl-muted">{t('emailLabel')}</dt>
              <dd className="mt-1 font-medium text-bgl-ink">{contactEmail?.trim() || 'info@savaskara.com'}</dd>
            </div>
          </dl>
        </div>

        <div className="bgl-card overflow-hidden shadow-soft">
          <iframe
            title={mapConfig.mapTitle || t('mapTitle')}
            className="h-full min-h-[240px] w-full md:min-h-[280px]"
            src={mapConfig.mapEmbedUrl}
            loading="lazy"
          />
        </div>
      </div>

      <div className="bgl-container mt-8 md:mt-10">
        <div className="bgl-card mx-auto max-w-2xl p-6 md:p-10">
          <h2 className="text-lg font-semibold text-bgl-ink">{t('formTitle')}</h2>
          <form onSubmit={(ev) => void handleSubmit(ev)} className="mt-6 space-y-4">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-bgl-muted">{t('name')}</span>
              <input
                type="text"
                name="name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bgl-input mt-1.5 min-h-[48px] w-full text-base md:text-sm"
                disabled={loading}
              />
              {errors.name ? <p className="mt-1 text-xs text-rose-600">{errors.name}</p> : null}
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-bgl-muted">{t('email')}</span>
              <input
                type="email"
                name="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bgl-input mt-1.5 min-h-[48px] w-full text-base md:text-sm"
                disabled={loading}
              />
              {errors.email ? <p className="mt-1 text-xs text-rose-600">{errors.email}</p> : null}
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-bgl-muted">{t('phone')}</span>
              <input
                type="tel"
                name="phone"
                autoComplete="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bgl-input mt-1.5 min-h-[48px] w-full text-base md:text-sm"
                disabled={loading}
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-bgl-muted">{t('message')}</span>
              <textarea
                name="message"
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="bgl-input mt-1.5 min-h-[160px] w-full resize-y text-base md:text-sm"
                disabled={loading}
              />
              {errors.message ? <p className="mt-1 text-xs text-rose-600">{errors.message}</p> : null}
            </label>

            {success ? (
              <p className="rounded-xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm font-medium text-emerald-900">
                {t('success')}
              </p>
            ) : null}
            {submitError ? (
              <p className="rounded-xl border border-rose-200 bg-rose-50/90 px-4 py-3 text-sm font-medium text-rose-900">
                {submitError}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="bgl-btn-primary mt-2 flex min-h-[52px] w-full items-center justify-center px-6 text-base font-semibold disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? t('sending') : t('send')}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
