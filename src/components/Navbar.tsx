import Link from 'next/link';
import { GlobalSearch } from './GlobalSearch';
import { BrandLockup } from './BrandLogo';

/** Sticky customer-portal navigation with the global search bar. */
export function Navbar() {
  return (
    <header className="site-header">
      <div className="container site-nav">
        <Link href="/" className="site-brand" aria-label="TechWiki home">
          <BrandLockup size={32} fontSize={19} />
        </Link>
        <div className="site-nav-search">
          <GlobalSearch />
        </div>
        <nav className="site-nav-links" aria-label="Primary navigation">
          <Link href="/modules">Modules</Link>
          <Link href="/articles">Articles</Link>
          <Link href="/videos">Videos</Link>
        </nav>
      </div>
    </header>
  );
}
