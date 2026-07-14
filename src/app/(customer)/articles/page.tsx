import { publicApi } from '@/lib/api/public';
import { safe, emptyPaginated } from '@/lib/safe';
import { ArticleCard } from '@/components/ArticleCard';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Article } from '@/lib/types';

export const metadata = { title: 'Articles' };

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: { sort?: string };
}) {
  const sort = (searchParams.sort as 'latest' | 'popular' | 'alphabetical') ?? 'latest';
  const data = await safe(publicApi.articles({ limit: 24, sort }), emptyPaginated<Article>());

  return (
    <div className="fade-in">
      <h1>Articles</h1>
      {data.items.length ? (
        <div className="grid grid-3">{data.items.map((a) => <ArticleCard key={a.id} article={a} />)}</div>
      ) : (
        <EmptyState title="No articles found" icon="📄" />
      )}
    </div>
  );
}
