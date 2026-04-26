'use client';

import { useEffect } from 'react';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        fontFamily: 'system-ui, sans-serif',
        gap: '1rem',
        textAlign: 'center',
      }}
    >
      <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Bir sorun oluştu</h1>
      <p style={{ fontSize: '0.875rem', color: '#555', maxWidth: '28rem' }}>
        Sayfa yüklenirken hata oluştu. Geliştirme konsolunda ayrıntıya bakın veya yeniden deneyin.
      </p>
      {process.env.NODE_ENV === 'development' && error?.message ? (
        <pre
          style={{
            fontSize: '0.75rem',
            textAlign: 'left',
            maxWidth: '100%',
            overflow: 'auto',
            padding: '0.75rem',
            background: '#f5f5f5',
            borderRadius: '8px',
          }}
        >
          {error.message}
        </pre>
      ) : null}
      <button
        type="button"
        onClick={() => reset()}
        style={{
          padding: '0.5rem 1rem',
          borderRadius: '8px',
          border: '1px solid #333',
          background: '#fff',
          cursor: 'pointer',
          fontWeight: 600,
        }}
      >
        Yeniden dene
      </button>
    </div>
  );
}
