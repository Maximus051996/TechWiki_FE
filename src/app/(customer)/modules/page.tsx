import Link from 'next/link';
import { publicApi } from '@/lib/api/public';
import { safe, emptyPaginated } from '@/lib/safe';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Module } from '@/lib/types';

export const metadata = { title: 'Modules' };

export default async function ModulesPage() {
  const data = await safe(publicApi.modules({ limit: 48, sort: 'alphabetical' }), emptyPaginated<Module>());
  return (
    <div className="fade-in">
      <h1>Modules</h1>
      {data.items.length ? (
        <div className="grid grid-3">
          {data.items.map((m) => (
            <Link key={m.id} href={`/modules/${m.slug}`} className="card">
              <div style={{ fontSize: 28, marginBottom: 8 }}>{m.icon || '📦'}</div>
              <h3 style={{ margin: '0 0 6px' }}>{m.name}</h3>
              <p className="muted" style={{ margin: 0, fontSize: 14 }}>{m.description}</p>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState title="No modules found" icon="📦" />
      )}
    </div>
  );
}
