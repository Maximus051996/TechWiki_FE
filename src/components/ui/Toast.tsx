'use client';

import { createContext, useCallback, useContext, useState } from 'react';

type ToastKind = 'success' | 'error' | 'info';
interface Toast { id: number; message: string; kind: ToastKind; }

const ToastContext = createContext<{ notify: (message: string, kind?: ToastKind) => void } | null>(null);

/** Lightweight toast provider. Auto-dismisses; no external dependency. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback((message: string, kind: ToastKind = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div style={{ position: 'fixed', bottom: 20, right: 20, display: 'grid', gap: 10, zIndex: 100 }}>
        {toasts.map((t) => (
          <div
            key={t.id}
            className="fade-in card"
            style={{
              padding: '12px 16px', minWidth: 240,
              borderColor:
                t.kind === 'success' ? 'var(--success)' : t.kind === 'error' ? 'var(--danger)' : 'var(--border)',
            }}
          >
            {t.kind === 'success' ? '✅ ' : t.kind === 'error' ? '⛔ ' : 'ℹ️ '}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
