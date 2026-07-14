import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { publicApi } from '@/lib/api/public';
import { ApiError } from '@/lib/api/client';
import { safe, emptyPaginated } from '@/lib/safe';
import { ArticleCard } from '@/components/ArticleCard';
import { VideoCard } from '@/components/VideoCard';
import { ArticleContent } from '@/components/ArticleContent';
import type { Article, Video } from '@/lib/types';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const article = await publicApi.article(params.slug);
    return {
      title: article.seoTitle || article.title,
      description: article.seoDescription || article.shortDescription,
    };
  } catch {
    return { title: 'Article' };
  }
}

export default async function ArticleDetailPage({ params }: { params: { slug: string } }) {
  let article;
  try {
    article = await publicApi.article(params.slug);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  // Related content from the same category (fetched concurrently, non-blocking).
  const [relatedArticles, relatedVideos] = await Promise.all([
    safe(publicApi.articles({ categoryId: article.categoryId, limit: 4 }), emptyPaginated<Article>()),
    safe(publicApi.videos({ categoryId: article.categoryId, limit: 3 }), emptyPaginated<Video>()),
  ]);

  return (
    <article className="fade-in" style={{ display: 'grid', gap: 24, maxWidth: 820, margin: '0 auto' }}>
      <Link href="/articles" className="muted">← Back to articles</Link>

      {article.bannerImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={article.bannerImage} alt="" style={{ width: '100%', borderRadius: 14, maxHeight: 340, objectFit: 'cover' }} />
      )}

      <header>
        <h1 style={{ margin: '0 0 10px' }}>{article.title}</h1>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <span className="tag">⏱ {article.readingTime} min read</span>
          <span className="tag">👁 {article.views} views</span>
          {article.publishedDate && (
            <span className="tag">📅 {new Date(article.publishedDate).toLocaleDateString()}</span>
          )}
        </div>
        {article.tags.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
            {article.tags.map((t) => <span key={t} className="tag">#{t}</span>)}
          </div>
        )}
      </header>

      {/* Content is authored as Markdown (e.g. pasted from ChatGPT). */}
      <ArticleContent content={article.content ?? ''} />

      {relatedArticles.items.length > 1 && (
        <section>
          <h2>Related Articles</h2>
          <div className="grid grid-3">
            {relatedArticles.items.filter((a) => a.id !== article!.id).slice(0, 3).map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}

      {relatedVideos.items.length > 0 && (
        <section>
          <h2>Related Videos</h2>
          <div className="grid grid-3">
            {relatedVideos.items.map((v) => <VideoCard key={v.id} video={v} />)}
          </div>
        </section>
      )}
    </article>
  );
}
