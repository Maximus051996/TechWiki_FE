'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Centered modal for create/edit forms. Rendered through a portal to
 * document.body so `position: fixed` always anchors to the viewport (not to a
 * transformed ancestor like a `.fade-in` wrapper). Sticky header + footer,
 * scrollable body. Closes on Escape and overlay click.
 */
export function Drawer({
  open,
  title,
  onClose,
  onSubmit,
  submitting,
  submitLabel = 'Save',
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting?: boolean;
  submitLabel?: string;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={onSubmit} className="modal-form">
          <div className="modal-head">
            <h2 className="modal-title">{title}</h2>
            <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          <div className="modal-body">{children}</div>
          <div className="modal-foot">
            <button type="button" className="btn" onClick={onClose} disabled={submitting}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? <><span className="spinner" /> Saving…</> : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
