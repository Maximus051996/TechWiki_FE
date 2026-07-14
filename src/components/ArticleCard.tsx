import Link from 'next/link';
import type { Article } from '@/lib/types';

export function ArticleCard({ article }: { article: Article }) {
  return (
    <Link href={`/articles/${article.slug}`} className="card fade-in" style={{ display: 'grid', gap: 10 }}>
      {article.thumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={article.thumbnail}
          alt={article.title}
          loading="lazy"
          style={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 10 }}
        />
      ) : (
        <div style={{ height: 150, borderRadius: 10, background: 'var(--bg-elev)' }} />
      )}
      <h3 style={{ margin: 0, fontSize: 18 }}>{article.title}</h3>
      <p className="muted" style={{ margin: 0, fontSize: 14 }}>{article.shortDescription}</p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
        <span className="tag">⏱ {article.readingTime} min</span>
        <span className="tag">👁 {article.views}</span>
        {article.featured && <span className="tag">⭐ Featured</span>}
      </div>
    </Link>
  );
}
