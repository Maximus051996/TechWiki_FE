'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { API_URL } from '@/lib/api/client';

/**
 * Fires a lightweight, fire-and-forget beacon to the backend on every customer
 * page view, reporting the rendered route. The server enriches it with IP, geo,
 * device, browser and OS, then stores it in the visitor log.
 *
 * Fire-and-forget: no AbortController (so the request is never canceled), and a
 * per-path guard prevents duplicate beacons — including React Strict Mode's
 * double effect run in development.
 */
export function VisitorTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;

    fetch(`${API_URL}/api/public/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pathname }),
      keepalive: true,
    }).catch(() => {
      /* ignore — tracking is best-effort */
    });
  }, [pathname]);

  return null;
}
