import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ minHeight: '80vh', display: 'grid', placeItems: 'center', textAlign: 'center', padding: 20 }}>
      <div className="fade-in">
        <div style={{ fontSize: 64 }}>🔍</div>
        <h1 style={{ margin: '8px 0' }}>404 — Page Not Found</h1>
        <p className="muted">The page you are looking for does not exist or has been moved.</p>
        <Link href="/" className="btn btn-primary" style={{ marginTop: 12 }}>Back to Home</Link>
      </div>
    </div>
  );
}
