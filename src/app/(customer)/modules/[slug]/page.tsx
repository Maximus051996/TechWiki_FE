import { notFound } from 'next/navigation';
import Link from 'next/link';
import { publicApi } from '@/lib/api/public';
import { ApiError } from '@/lib/api/client';
import { safe, emptyPaginated } from '@/lib/safe';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Article, Category, Video } from '@/lib/types';

export default async function ModuleDetailPage({ params }: { params: { slug: string } }) {
  let module;
  try {
    module = await publicApi.module(params.slug);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  const [categories, articles, videos] = await Promise.all([
    safe(publicApi.categories({ moduleId: module.id, limit: 48 }), emptyPaginated<Category>()),
    safe(publicApi.articles({ moduleId: module.id, limit: 1 }), emptyPaginated<Article>()),
    safe(publicApi.videos({ moduleId: module.id, limit: 1 }), emptyPaginated<Video>()),
  ]);

  return (
    <div className="fade-in" style={{ display: 'grid', gap: 24 }}>
      <header>
        <div style={{ fontSize: 40 }}>{module.icon || '📦'}</div>
        <h1 style={{ margin: '6px 0' }}>{module.name}</h1>
        <p className="muted">{module.description}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <span className="tag">📁 {categories.pagination.total} categories</span>
          <span className="tag">📄 {articles.pagination.total} articles</span>
          <span className="tag">🎬 {videos.pagination.total} videos</span>
        </div>
      </header>

      <section>
        <h2>Categories</h2>
        {categories.items.length ? (
          <div className="grid grid-3">
            {categories.items.map((c) => (
              <Link key={c.id} href={`/categories/${c.slug}`} className="card">
                <h3 style={{ margin: '0 0 6px' }}>{c.name}</h3>
                <p className="muted" style={{ margin: 0, fontSize: 14 }}>{c.description}</p>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState title="No categories yet" icon="📁" />
        )}
      </section>
    </div>
  );
}
