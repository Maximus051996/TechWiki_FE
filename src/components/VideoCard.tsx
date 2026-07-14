import Link from 'next/link';
import type { Video } from '@/lib/types';

export function VideoCard({ video }: { video: Video }) {
  return (
    <Link href={`/videos/${video.id}`} className="card fade-in" style={{ display: 'grid', gap: 10 }}>
      <div style={{ position: 'relative' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={video.thumbnail}
          alt={video.title}
          loading="lazy"
          style={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 10 }}
        />
        <span
          style={{
            position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
            fontSize: 40, color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,.6)',
          }}
        >
          ▶
        </span>
        {video.duration && (
          <span className="tag" style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,.7)' }}>
            {video.duration}
          </span>
        )}
      </div>
      <h3 style={{ margin: 0, fontSize: 18 }}>{video.title}</h3>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <span className="tag">👁 {video.views}</span>
        {video.featured && <span className="tag">⭐ Featured</span>}
      </div>
    </Link>
  );
}
