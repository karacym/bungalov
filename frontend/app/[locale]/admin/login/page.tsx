'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AdminLoginPage() {
  const params = useParams<{ locale: string }>();
  const [email, setEmail] = useState('admin@savaskara.com');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const router = useRouter();

  async function login() {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      setError('Giris basarisiz');
      return;
    }

    const data = await response.json();
    localStorage.setItem('token', data.accessToken);
    router.push(`/${params.locale}/admin/dashboard`);
  }

  return (
    <main className="bgl-container flex min-h-[70vh] max-w-md flex-col justify-center py-12">
      <div className="rounded-[1.75rem] border border-bgl-mist bg-white p-8 shadow-card">
        <p className="bgl-section-title">Yonetim</p>
        <h1 className="bgl-heading mt-2">Admin giris</h1>
        <p className="mt-2 text-xs text-bgl-muted">Seed sonrasi: admin@savaskara.com / 123456</p>
        <div className="mt-8 space-y-4">
          <label className="block text-xs font-medium text-bgl-muted">
            E-posta
            <input className="bgl-input mt-1.5" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </label>
          <label className="block text-xs font-medium text-bgl-muted">
            Sifre
            <input
              type="password"
              className="bgl-input mt-1.5"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>
          <button type="button" onClick={login} className="bgl-btn-primary w-full">
            Giris yap
          </button>
          {error ? <p className="text-center text-sm font-medium text-red-600">{error}</p> : null}
        </div>
      </div>
    </main>
  );
}
