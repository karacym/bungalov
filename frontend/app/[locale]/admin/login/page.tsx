'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AdminLoginPage({ params }: { params: { locale: string } }) {
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
    <main className="mx-auto max-w-md space-y-3 p-4">
      <h1 className="text-2xl font-bold">Admin Giris</h1>
      <p className="text-xs text-slate-600">
        Seed sonrasi: admin@savaskara.com / 123456
      </p>
      <input className="w-full rounded border p-2" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" className="w-full rounded border p-2" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={login} className="w-full rounded bg-forest p-2 text-white">Giris Yap</button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </main>
  );
}
