'use client';

import { useEffect, useState } from 'react';
import { Protected } from '@/components/admin/Protected';
import { AdminShell } from '@/components/admin/AdminShell';
import { useAuth } from '@/lib/auth';
import { adminApi } from '@/lib/api/admin';
import type { DashboardSummary } from '@/lib/types';

export default function AdminDashboardPage() {
  return (
    <Protected>
      <AdminShell>
        <DashboardContent />
      </AdminShell>
    </Protected>
  );
}

function DashboardContent() {
  const { token } = useAuth();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    let active = true;
    adminApi
      .dashboard(token, { signal: controller.signal })
      .then((d) => active && setData(d))
      .catch(() => {
        // The dashboard can unmount during navigation; aborted requests need no UI update.
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
      controller.abort();
    };
  }, [token]);

  const cards = [
    { label: 'Modules', value: data?.totals.modules, icon: '📦' },
    { label: 'Categories', value: data?.totals.categories, icon: '📁' },
    { label: 'Articles', value: data?.totals.articles, icon: '📄' },
    { label: 'Videos', value: data?.totals.videos, icon: '🎬' },
  ];

  return (
    <div className="fade-in" style={{ display: 'grid', gap: 24 }}>
      <h1 style={{ margin: 0 }}>Dashboard</h1>

      <div className="grid grid-4">
        {cards.map((c) => (
          <div key={c.label} className="card">
            <div style={{ fontSize: 26 }}>{c.icon}</div>
            <div className="muted" style={{ fontSize: 14 }}>{c.label}</div>
            <div style={{ fontSize: 32, fontWeight: 800 }}>
              {loading ? <span className="skeleton" style={{ display: 'inline-block', width: 40, height: 28 }} /> : c.value ?? 0}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-3" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="card">
          <h3>Latest Articles</h3>
          {data?.latestArticles.length ? (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {data.latestArticles.map((a) => <li key={a.id}>{a.title}</li>)}
            </ul>
          ) : (
            <p className="muted">No articles yet.</p>
          )}
        </div>
        <div className="card">
          <h3>Latest Videos</h3>
          {data?.latestVideos.length ? (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {data.latestVideos.map((v) => <li key={v.id}>{v.title}</li>)}
            </ul>
          ) : (
            <p className="muted">No videos yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
