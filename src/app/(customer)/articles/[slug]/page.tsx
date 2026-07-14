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

  const published = article.publishedDate
    ? new Date(article.publishedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  return (
    <div className="fade-in article-page">
      {/* Hero header band */}
      <header className="article-hero">
        {article.bannerImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="article-hero-bg" src={article.bannerImage} alt="" />
        )}
        <div className="article-hero-inner">
          <Link href="/articles" className="article-back">← Back to articles</Link>

          <div className="article-eyebrow">
            <span className="article-kicker">📄 Article</span>
            {article.featured && <span className="article-kicker featured">⭐ Featured</span>}
          </div>

          <h1 className="article-title">{article.title}</h1>

          {article.shortDescription && (
            <p className="article-lede">{article.shortDescription}</p>
          )}

          <div className="article-meta">
            <span className="article-meta-item">⏱ {article.readingTime} min read</span>
            <span className="article-meta-dot" />
            <span className="article-meta-item">👁 {article.views.toLocaleString()} views</span>
            {published && <><span className="article-meta-dot" /><span className="article-meta-item">📅 {published}</span></>}
          </div>

          {article.tags.length > 0 && (
            <div className="article-tags">
              {article.tags.map((t) => <span key={t} className="article-tag">#{t}</span>)}
            </div>
          )}
        </div>
      </header>

      {/* Reading column */}
      <div className="article-body">
        <ArticleContent content={article.content ?? ''} />
      </div>

      {/* Related content */}
      {(relatedArticles.items.filter((a) => a.id !== article!.id).length > 0 || relatedVideos.items.length > 0) && (
        <div className="article-related">
          {relatedArticles.items.filter((a) => a.id !== article!.id).length > 0 && (
            <section>
              <h2 className="section-title">Related Articles</h2>
              <div className="grid grid-3">
                {relatedArticles.items.filter((a) => a.id !== article!.id).slice(0, 3).map((a) => (
                  <ArticleCard key={a.id} article={a} />
                ))}
              </div>
            </section>
          )}

          {relatedVideos.items.length > 0 && (
            <section style={{ marginTop: 40 }}>
              <h2 className="section-title">Related Videos</h2>
              <div className="grid grid-3">
                {relatedVideos.items.map((v) => <VideoCard key={v.id} video={v} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
