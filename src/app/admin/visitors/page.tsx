'use client';

import { useCallback, useEffect, useState } from 'react';
import { Protected } from '@/components/admin/Protected';
import { AdminShell } from '@/components/admin/AdminShell';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/lib/auth';
import { adminApi } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/client';
import type { Visitor, VisitorStats } from '@/lib/types';

export default function AdminVisitorsPage() {
  return (
    <Protected>
      <AdminShell>
        <VisitorsLog />
      </AdminShell>
    </Protected>
  );
}

function VisitorsLog() {
  const { token } = useAuth();
  const { notify } = useToast();
  const [items, setItems] = useState<Visitor[]>([]);
  const [stats, setStats] = useState<VisitorStats | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const limit = 50;

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [log, s] = await Promise.all([
        adminApi.visitors.list(token, { page, limit }),
        adminApi.visitors.stats(token),
      ]);
      setItems(log.items);
      setTotal(log.pagination.total);
      setStats(s);
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Failed to load visitors', 'error');
    } finally {
      setLoading(false);
    }
  }, [token, page, notify]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const fmt = (d: string) => new Date(d).toLocaleString();
  const loc = (v: Visitor) => [v.city, v.region, v.country].filter(Boolean).join(', ') || 'Unknown';

  return (
    <div className="fade-in" style={{ display: 'grid', gap: 24 }}>
      <h1 style={{ margin: 0 }}>Visitor Log</h1>

      <div className="grid grid-4">
        <StatCard label="Total Visits" value={stats?.total} icon="👣" />
        <StatCard label="Last 24h" value={stats?.last24h} icon="🕐" />
        <StatCard label="Top Country" value={stats?.topCountries?.[0]?.label ?? '—'} icon="🌍" isText />
        <StatCard label="Top Browser" value={stats?.topBrowsers?.[0]?.label ?? '—'} icon="🧭" isText />
      </div>

      <div className="grid grid-3" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
        <BreakdownCard title="Top Countries" rows={stats?.topCountries ?? []} />
        <BreakdownCard title="By Device" rows={stats?.byDevice ?? []} />
        <BreakdownCard title="Top Browsers" rows={stats?.topBrowsers ?? []} />
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                <th style={th}>Date & Time</th><th style={th}>Page</th><th style={th}>Location</th>
                <th style={th}>IP</th><th style={th}>Device</th><th style={th}>Browser</th><th style={th}>OS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td style={td} colSpan={7}><span className="skeleton" style={{ display: 'block', height: 18 }} /></td></tr>
              ) : items.length === 0 ? (
                <tr><td style={td} colSpan={7}><span className="muted">No visitors recorded yet.</span></td></tr>
              ) : (
                items.map((v) => (
                  <tr key={v.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={td}>{fmt(v.visitedAt)}</td>
                    <td style={td}><code>{v.path}</code></td>
                    <td style={td}>{loc(v)}</td>
                    <td style={td} className="muted">{v.ip}</td>
                    <td style={td}><span className="tag">{v.deviceType || '—'}</span></td>
                    <td style={td}>{v.browser}</td>
                    <td style={td}>{v.os}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center' }}>
        <button className="btn" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
        <span className="muted">Page {page} of {totalPages}</span>
        <button className="btn" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next →</button>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, isText }: { label: string; value?: number | string; icon: string; isText?: boolean }) {
  return (
    <div className="card">
      <div style={{ fontSize: 26 }}>{icon}</div>
      <div className="muted" style={{ fontSize: 14 }}>{label}</div>
      <div style={{ fontSize: isText ? 20 : 32, fontWeight: 800 }}>
        {value === undefined ? <span className="skeleton" style={{ display: 'inline-block', width: 40, height: 24 }} /> : value}
      </div>
    </div>
  );
}

function BreakdownCard({ title, rows }: { title: string; rows: { label: string; count: number }[] }) {
  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      {rows.length === 0 ? (
        <p className="muted">No data yet.</p>
      ) : (
        <div style={{ display: 'grid', gap: 6 }}>
          {rows.map((r) => (
            <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{r.label}</span>
              <span className="muted">{r.count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const th: React.CSSProperties = { padding: '12px 16px', fontSize: 13, color: 'var(--text-muted)' };
const td: React.CSSProperties = { padding: '12px 16px', fontSize: 14 };
