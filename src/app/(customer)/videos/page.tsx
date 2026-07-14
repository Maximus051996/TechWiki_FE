import { publicApi } from '@/lib/api/public';
import { safe, emptyPaginated } from '@/lib/safe';
import { VideoCard } from '@/components/VideoCard';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Video } from '@/lib/types';

export const metadata = { title: 'Videos' };

export default async function VideosPage() {
  const data = await safe(publicApi.videos({ limit: 24, sort: 'latest' }), emptyPaginated<Video>());
  return (
    <div className="fade-in">
      <h1>Videos</h1>
      {data.items.length ? (
        <div className="grid grid-3">{data.items.map((v) => <VideoCard key={v.id} video={v} />)}</div>
      ) : (
        <EmptyState title="No videos found" icon="🎬" />
      )}
    </div>
  );
}
