import { BrandLogo } from './BrandLogo';

/**
 * TechWiki branded loader. Used for:
 *  - the initial app splash (fullscreen), and
 *  - route/data loading states (fullscreen or inline).
 *
 * The logo pulses inside an animated conic progress ring, with a shimmering
 * "TechWiki" wordmark and animated dots below.
 */
export function BrandLoader({
  fullscreen = true,
  label = 'TechWiki',
}: {
  fullscreen?: boolean;
  label?: string;
}) {
  return (
    <div className={fullscreen ? 'loader-screen' : 'loader-inline'}>
      <div className="loader-stack">
        <div className="loader-ring">
          <div className="loader-ring-spin" />
          <div className="loader-logo">
            <BrandLogo size={54} />
          </div>
        </div>

        <div className="loader-word" aria-label={label}>
          <span className="loader-tech">Tech</span><span className="loader-wiki">Wiki</span>
        </div>

        <div className="loader-sub">
          <span className="loader-dots"><i /><i /><i /></span>
        </div>
      </div>
    </div>
  );
}
