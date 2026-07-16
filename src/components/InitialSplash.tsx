'use client';

import { useEffect, useState } from 'react';
import { BrandLoader } from './BrandLoader';

/**
 * Initial-access splash. Shows the branded loader the first time the app is
 * opened in a session, then fades out once the window has loaded (or after a
 * short minimum so the animation reads). Uses sessionStorage so it only appears
 * on genuine first access, not on every client navigation.
 */
export function InitialSplash() {
  const [show, setShow] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (sessionStorage.getItem('tw_splash_shown')) {
      setShow(false);
      return;
    }

    const start = Date.now();
    const MIN_MS = 1100;
    let leavingTimer: number | undefined;
    let hideTimer: number | undefined;
    let disposed = false;

    const finish = () => {
      if (disposed) return;
      const elapsed = Date.now() - start;
      const wait = Math.max(0, MIN_MS - elapsed);
      leavingTimer = window.setTimeout(() => {
        if (disposed) return;
        setLeaving(true);
        hideTimer = window.setTimeout(() => {
          if (disposed) return;
          setShow(false);
          sessionStorage.setItem('tw_splash_shown', '1');
        }, 450);
      }, wait);
    };

    if (document.readyState === 'complete') finish();
    else window.addEventListener('load', finish, { once: true });

    return () => {
      disposed = true;
      window.removeEventListener('load', finish);
      if (leavingTimer) window.clearTimeout(leavingTimer);
      if (hideTimer) window.clearTimeout(hideTimer);
    };
  }, []);

  if (!show) return null;

  return (
    <div className={`splash-root${leaving ? ' leaving' : ''}`}>
      <BrandLoader fullscreen />
    </div>
  );
}
