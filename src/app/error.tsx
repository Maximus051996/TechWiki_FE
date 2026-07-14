'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div style={{ minHeight: '80vh', display: 'grid', placeItems: 'center', textAlign: 'center', padding: 20 }}>
      <div className="fade-in">
        <div style={{ fontSize: 64 }}>⚠️</div>
        <h1 style={{ margin: '8px 0' }}>Something went wrong</h1>
        <p className="muted">An unexpected error occurred. Please try again.</p>
        <button onClick={reset} className="btn btn-primary" style={{ marginTop: 12 }}>Retry</button>
      </div>
    </div>
  );
}
