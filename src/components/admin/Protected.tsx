'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

/**
 * Client-side guard for admin pages. Redirects unauthenticated users to login.
 * (The backend is the real authority — this is UX, not security.)
 */
export function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/admin/login');
  }, [loading, user, router]);

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
        <div className="skeleton" style={{ width: 200, height: 20 }} />
      </div>
    );
  }
  if (!user) return null;
  return <>{children}</>;
}
