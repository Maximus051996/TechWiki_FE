import { BrandLockup } from './BrandLogo';

export function Footer() {
  return (
    <footer className="site-footer">
      <div
        className="container site-footer-inner"
      >
        <BrandLockup size={28} fontSize={17} />
        <span className="muted">© {new Date().getFullYear()} TechWiki. Knowledge for builders.</span>
      </div>
    </footer>
  );
}
