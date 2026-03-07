// Root-level error boundary. Catches errors in the layout itself.
// Must include its own <html> and <body> tags (Next.js requirement).
'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt">
      <body>
        <div
          style={{
            display: 'flex',
            minHeight: '100vh',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: '28rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>
              Algo correu mal
            </h2>
            <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
              Ocorreu um erro inesperado. Por favor, tente novamente.
            </p>
            <button
              onClick={reset}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1.5rem',
                fontSize: '1rem',
                borderRadius: '0.375rem',
                border: '1px solid #d1d5db',
                background: '#000',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
