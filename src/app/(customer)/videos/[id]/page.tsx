import { notFound } from 'next/navigation';
import Link from 'next/link';
import { publicApi } from '@/lib/api/public';
import { ApiError } from '@/lib/api/client';
import { safe, emptyPaginated } from '@/lib/safe';
import { VideoCard } from '@/components/VideoCard';
import type { Video } from '@/lib/types';

export default async function VideoDetailPage({ params }: { params: { id: string } }) {
  let video;
  try {
    video = await publicApi.video(params.id);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  const related = await safe(publicApi.videos({ categoryId: video.categoryId, limit: 4 }), emptyPaginated<Video>());

  return (
    <div className="fade-in" style={{ display: 'grid', gap: 24, maxWidth: 960, margin: '0 auto' }}>
      <Link href="/videos" className="muted">← Back to videos</Link>

      <div style={{ position: 'relative', paddingTop: '56.25%', borderRadius: 14, overflow: 'hidden', background: '#000' }}>
        <iframe
          src={`https://www.youtube.com/embed/${video.youtubeId}`}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
        />
      </div>

      <header>
        <h1 style={{ margin: '0 0 8px' }}>{video.title}</h1>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <span className="tag">👁 {video.views} views</span>
          {video.duration && <span className="tag">⏱ {video.duration}</span>}
          {video.publishedDate && <span className="tag">📅 {new Date(video.publishedDate).toLocaleDateString()}</span>}
        </div>
      </header>

      {video.description && <p className="muted">{video.description}</p>}

      {related.items.length > 1 && (
        <section>
          <h2>Related Videos</h2>
          <div className="grid grid-3">
            {related.items.filter((v) => v.id !== video!.id).slice(0, 3).map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
