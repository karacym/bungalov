'use client';

/**
 * Kök layout veya yukleme zinciri cok erken patlarsa kullanilir;
 * kendi <html> ve <body> etiketlerini tanimlamak zorunludur (Next.js dokumani).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="tr">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
        <h1 style={{ fontSize: '1.25rem' }}>Kritik hata</h1>
        <p style={{ color: '#555', marginTop: '0.5rem' }}>Uygulama yüklenemedi.</p>
        {process.env.NODE_ENV === 'development' && error?.message ? (
          <pre style={{ marginTop: '1rem', fontSize: '0.75rem', whiteSpace: 'pre-wrap' }}>{error.message}</pre>
        ) : null}
        <button
          type="button"
          onClick={() => reset()}
          style={{
            marginTop: '1.5rem',
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            borderRadius: '8px',
            border: '1px solid #333',
            background: '#fff',
          }}
        >
          Yenile
        </button>
      </body>
    </html>
  );
}
