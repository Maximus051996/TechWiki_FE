import { BrandLockup } from './BrandLogo';

export function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', marginTop: 60 }}>
      <div
        className="container"
        style={{ padding: '28px 20px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}
      >
        <BrandLockup size={28} fontSize={17} />
        <span className="muted">© {new Date().getFullYear()} TechWiki. Knowledge for builders.</span>
      </div>
    </footer>
  );
}
