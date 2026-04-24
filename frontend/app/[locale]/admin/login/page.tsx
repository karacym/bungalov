'use client';

import { getApiBaseUrl } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export default function AdminLoginPage() {
  const t = useTranslations('adminLogin');
  const params = useParams<{ locale: string }>();
  const [email, setEmail] = useState('admin@savaskara.com');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const router = useRouter();

  async function login() {
    setError('');
    const base = getApiBaseUrl();
    let response: Response;
    try {
      response = await fetch(`${base}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
    } catch {
      setError(t('errorNetwork'));
      return;
    }

    if (!response.ok) {
      setError(t('errorAuth'));
      return;
    }

    const data = await response.json();
    localStorage.setItem('token', data.accessToken);
    router.push(`/${params.locale}/admin/dashboard`);
  }

  return (
    <main className="bgl-container flex min-h-[70vh] max-w-md flex-col justify-center py-12">
      <div className="rounded-[1.75rem] border border-bgl-mist bg-white p-8 shadow-card">
        <p className="bgl-section-title">{t('eyebrow')}</p>
        <h1 className="bgl-heading mt-2">{t('title')}</h1>
        <p className="mt-2 text-xs text-bgl-muted">{t('hint')}</p>
        <div className="mt-8 space-y-4">
          <label className="block text-xs font-medium text-bgl-muted">
            {t('email')}
            <input className="bgl-input mt-1.5" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </label>
          <label className="block text-xs font-medium text-bgl-muted">
            {t('password')}
            <input
              type="password"
              className="bgl-input mt-1.5"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>
          <button type="button" onClick={login} className="bgl-btn-primary w-full">
            {t('submit')}
          </button>
          {error ? <p className="text-center text-sm font-medium text-red-600">{error}</p> : null}
        </div>
      </div>
    </main>
  );
}
