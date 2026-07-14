import { notFound } from 'next/navigation';
import { publicApi } from '@/lib/api/public';
import { ApiError } from '@/lib/api/client';
import { safe, emptyPaginated } from '@/lib/safe';
import { ArticleCard } from '@/components/ArticleCard';
import { VideoCard } from '@/components/VideoCard';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Article, Video } from '@/lib/types';

export default async function CategoryDetailPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { sort?: string };
}) {
  let category;
  try {
    category = await publicApi.category(params.slug);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  const sort = (searchParams.sort as 'latest' | 'popular' | 'alphabetical') ?? 'latest';
  const [articles, videos] = await Promise.all([
    safe(publicApi.articles({ categoryId: category.id, limit: 24, sort }), emptyPaginated<Article>()),
    safe(publicApi.videos({ categoryId: category.id, limit: 24, sort }), emptyPaginated<Video>()),
  ]);

  return (
    <div className="fade-in" style={{ display: 'grid', gap: 28 }}>
      <header>
        <h1 style={{ margin: '0 0 6px' }}>{category.name}</h1>
        <p className="muted">{category.description}</p>
      </header>

      <section>
        <h2>Articles</h2>
        {articles.items.length ? (
          <div className="grid grid-3">{articles.items.map((a) => <ArticleCard key={a.id} article={a} />)}</div>
        ) : (
          <EmptyState title="No articles in this category" icon="📄" />
        )}
      </section>

      <section>
        <h2>Videos</h2>
        {videos.items.length ? (
          <div className="grid grid-3">{videos.items.map((v) => <VideoCard key={v.id} video={v} />)}</div>
        ) : (
          <EmptyState title="No videos in this category" icon="🎬" />
        )}
      </section>
    </div>
  );
}
