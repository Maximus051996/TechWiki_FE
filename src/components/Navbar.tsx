import Link from 'next/link';
import { GlobalSearch } from './GlobalSearch';
import { BrandLockup } from './BrandLogo';

/** Sticky customer-portal navigation with the global search bar. */
export function Navbar() {
  return (
    <header
      style={{
        position: 'sticky', top: 0, zIndex: 40, backdropFilter: 'blur(10px)',
        background: 'rgba(11,15,23,0.75)', borderBottom: '1px solid var(--border)',
      }}
    >
      <div
        className="container"
        style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '12px 20px' }}
      >
        <Link href="/" style={{ whiteSpace: 'nowrap' }}>
          <BrandLockup size={34} fontSize={20} />
        </Link>
        <GlobalSearch />
        <nav style={{ display: 'flex', gap: 16, marginLeft: 'auto' }}>
          <Link href="/modules" className="muted">Modules</Link>
          <Link href="/articles" className="muted">Articles</Link>
          <Link href="/videos" className="muted">Videos</Link>
        </nav>
      </div>
    </header>
  );
}
