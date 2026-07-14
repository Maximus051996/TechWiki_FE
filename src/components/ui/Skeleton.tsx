/** Reusable skeleton loaders (cards, lines, thumbnails). */
export function SkeletonLine({ width = '100%', height = 14 }: { width?: string; height?: number }) {
  return <div className="skeleton" style={{ width, height, borderRadius: 6 }} />;
}

export function SkeletonCard() {
  return (
    <div className="card" style={{ display: 'grid', gap: 12 }}>
      <div className="skeleton" style={{ height: 140, borderRadius: 10 }} />
      <SkeletonLine width="70%" height={18} />
      <SkeletonLine width="100%" />
      <SkeletonLine width="40%" />
    </div>
  );
}

export function SkeletonGrid({ count = 6, cols = 3 }: { count?: number; cols?: number }) {
  return (
    <div className={`grid grid-${cols}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
