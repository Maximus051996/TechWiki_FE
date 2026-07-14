/**
 * TechWiki brand mark — a merged "TW" monogram where the T's stem flows into the
 * centre peak of the W. Single magenta→pink gradient, fully transparent
 * background. All pieces share the same fill so they blend seamlessly.
 */
export function BrandLogo({ size = 40, title = 'TechWiki' }: { size?: number; title?: string }) {
  const h = Math.round(size * 0.9);
  return (
    <svg
      width={size}
      height={h}
      viewBox="0 0 200 180"
      role="img"
      aria-label={title}
      style={{ display: 'block', overflow: 'visible' }}
    >
      <defs>
        <linearGradient id="tw-grad" x1="0" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#c026d3" />
          <stop offset="50%" stopColor="#e21f9e" />
          <stop offset="100%" stopColor="#ff2f6b" />
        </linearGradient>
      </defs>

      <g fill="url(#tw-grad)" stroke="url(#tw-grad)" strokeLinejoin="round" strokeLinecap="round">
        {/* Bold W — wide splayed strokes */}
        <path d="M18 40 L54 150 L100 74 L146 150 L182 40" fill="none" strokeWidth="34" />
        {/* T bar across the top-centre, sitting over the W */}
        <rect x="64" y="34" width="72" height="30" rx="6" />
        {/* T stem dropping into the centre valley of the W */}
        <rect x="86" y="34" width="28" height="66" rx="4" />
      </g>
    </svg>
  );
}

/** Logo + wordmark lockup used in nav/sidebar/login. */
export function BrandLockup({
  size = 30,
  fontSize = 20,
  subtitle,
  light = false,
}: {
  size?: number;
  fontSize?: number;
  subtitle?: string;
  light?: boolean;
}) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 11 }}>
      <BrandLogo size={size} />
      <span style={{ lineHeight: 1 }}>
        <span style={{ fontWeight: 800, fontSize, letterSpacing: '-0.01em' }}>
          <span
            style={{
              display: 'inline-block',
              backgroundImage: 'linear-gradient(120deg,#e21f9e,#ff2f6b)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent',
            }}
          >
            Tech
          </span>
          <span style={{ color: '#ffffff' }}>Wiki</span>
        </span>
        {subtitle && (
          <span style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', color: 'var(--text-muted)', marginTop: 4 }}>
            {subtitle}
          </span>
        )}
      </span>
    </span>
  );
}
