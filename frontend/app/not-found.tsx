import Link from 'next/link';

export default function RootNotFound() {
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
        textAlign: 'center',
        gap: '0.75rem',
      }}
    >
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>404</h1>
      <p style={{ color: '#555' }}>Sayfa bulunamadı.</p>
      <Link href="/" style={{ color: '#166534', fontWeight: 600, textDecoration: 'underline' }}>
        Ana sayfaya dön
      </Link>
    </div>
  );
}
