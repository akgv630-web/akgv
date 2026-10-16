'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: '#0B1734', color: '#F6F1E7', fontFamily: 'sans-serif', margin: 0, padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ maxWidth: '480px', textAlign: 'center', background: '#050A17', border: '1px solid #C7A35A', borderRadius: '1.5rem', padding: '2.5rem' }}>
          <h1 style={{ color: '#DFC382', fontSize: '1.75rem', marginBottom: '1rem' }}>AKGV Infra City</h1>
          <p style={{ color: '#9CA3AF', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            A critical error occurred. Please refresh the page or contact technical support.
          </p>
          <button
            onClick={() => reset()}
            style={{ backgroundColor: '#C7A35A', color: '#0B1734', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.875rem' }}
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
