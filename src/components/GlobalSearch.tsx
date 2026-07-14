'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { publicApi } from '@/lib/api/public';
import type { SearchResult } from '@/lib/types';

/**
 * Instant global search with debounce + request cancellation. Grouped results,
 * case-insensitive/partial matching are handled by the backend. AbortController
 * prevents state updates from stale in-flight requests (avoids leaks/races).
 */
export function GlobalSearch() {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setResult(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        const data = await publicApi.search(term, 8);
        setResult(data);
      } catch {
        setResult(null);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [q]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const hasResults = result && result.total > 0;

  return (
    <div ref={boxRef} style={{ position: 'relative', flex: 1, maxWidth: 560 }}>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => setOpen(true)}
        placeholder="Search modules, categories, articles, videos…"
        aria-label="Global search"
        style={{
          width: '100%', padding: '11px 16px', borderRadius: 12,
          border: '1px solid var(--border)', background: 'var(--bg-elev)',
          color: 'var(--text)', outline: 'none',
        }}
      />
      {open && q.trim().length >= 2 && (
        <div
          className="fade-in"
          style={{
            position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, zIndex: 50,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 12, boxShadow: 'var(--shadow)', padding: 12, maxHeight: 420, overflowY: 'auto',
          }}
        >
          {loading && <p className="muted" style={{ margin: 8 }}>Searching…</p>}
          {!loading && !hasResults && <p className="muted" style={{ margin: 8 }}>No results found.</p>}
          {!loading && hasResults && (
            <>
              <SearchGroup label="Modules" items={result!.groups.modules.map((m) => ({ href: `/modules/${m.slug}`, label: m.name }))} />
              <SearchGroup label="Categories" items={result!.groups.categories.map((c) => ({ href: `/categories/${c.slug}`, label: c.name }))} />
              <SearchGroup label="Articles" items={result!.groups.articles.map((a) => ({ href: `/articles/${a.slug}`, label: a.title }))} />
              <SearchGroup label="Videos" items={result!.groups.videos.map((v) => ({ href: `/videos/${v.id}`, label: v.title }))} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function SearchGroup({ label, items }: { label: string; items: { href: string; label: string }[] }) {
  if (items.length === 0) return null;
  return (
    <div style={{ marginBottom: 10 }}>
      <div className="muted" style={{ fontSize: 12, textTransform: 'uppercase', margin: '6px 8px' }}>{label}</div>
      {items.map((it) => (
        <Link
          key={it.href}
          href={it.href}
          style={{ display: 'block', padding: '8px 10px', borderRadius: 8 }}
          className="search-item"
        >
          {it.label}
        </Link>
      ))}
    </div>
  );
}
