import Link from 'next/link';
import { publicApi } from '@/lib/api/public';
import { safe, emptyPaginated } from '@/lib/safe';
import { ArticleCard } from '@/components/ArticleCard';
import { VideoCard } from '@/components/VideoCard';
import type { Article, Category, Module, Video } from '@/lib/types';
import { EmptyState } from '@/components/ui/EmptyState';

/** Landing page. Server-rendered with ISR; all sections fetched concurrently. */
export default async function HomePage() {
  const [modules, featuredArticles, latestArticles, featuredVideos, categories] = await Promise.all([
    safe(publicApi.modules({ limit: 6, sort: 'alphabetical' }), emptyPaginated<Module>()),
    safe(publicApi.articles({ limit: 3, featured: true }), emptyPaginated<Article>()),
    safe(publicApi.articles({ limit: 6, sort: 'latest' }), emptyPaginated<Article>()),
    safe(publicApi.videos({ limit: 3, featured: true }), emptyPaginated<Video>()),
    safe(publicApi.categories({ limit: 8 }), emptyPaginated<Category>()),
  ]);

  return (
    <div className="fade-in" style={{ display: 'grid', gap: 48 }}>
      {/* Hero */}
      <section className="home-hero">
        <h1 className="home-hero-title">
          The technology knowledge base for builders
        </h1>
        <p className="muted home-hero-copy">
          Browse curated technical articles and videos, organized by modules and categories.
        </p>
        <Link href="/modules" className="btn btn-primary">Explore Modules →</Link>
      </section>

      <Section title="Popular Modules" href="/modules">
        {modules.items.length ? (
          <div className="grid grid-3">
            {modules.items.map((m) => (
              <Link key={m.id} href={`/modules/${m.slug}`} className="card fade-in">
                <div style={{ fontSize: 28, marginBottom: 8 }}>{m.icon || '📦'}</div>
                <h3 style={{ margin: '0 0 6px' }}>{m.name}</h3>
                <p className="muted" style={{ margin: 0, fontSize: 14 }}>{m.description}</p>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState title="No modules yet" message="Run the backend seed to populate content." icon="📦" />
        )}
      </Section>

      <Section title="Featured Articles" href="/articles">
        {featuredArticles.items.length ? (
          <div className="grid grid-3">{featuredArticles.items.map((a) => <ArticleCard key={a.id} article={a} />)}</div>
        ) : (
          <EmptyState title="No featured articles" icon="📄" />
        )}
      </Section>

      <Section title="Featured Videos" href="/videos">
        {featuredVideos.items.length ? (
          <div className="grid grid-3">{featuredVideos.items.map((v) => <VideoCard key={v.id} video={v} />)}</div>
        ) : (
          <EmptyState title="No featured videos" icon="🎬" />
        )}
      </Section>

      <Section title="Latest Articles" href="/articles">
        {latestArticles.items.length ? (
          <div className="grid grid-3">{latestArticles.items.map((a) => <ArticleCard key={a.id} article={a} />)}</div>
        ) : (
          <EmptyState title="No articles yet" icon="📄" />
        )}
      </Section>

      {categories.items.length > 0 && (
        <Section title="Browse Categories">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {categories.items.map((c) => (
              <Link key={c.id} href={`/categories/${c.slug}`} className="tag" style={{ padding: '8px 14px', fontSize: 14 }}>
                {c.name}
              </Link>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({ title, href, children }: { title: string; href?: string; children: React.ReactNode }) {
  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>{title}</h2>
        {href && <Link href={href} className="muted">View all →</Link>}
      </div>
      {children}
    </section>
  );
}
