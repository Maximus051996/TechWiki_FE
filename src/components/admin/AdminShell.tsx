'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { BrandLogo } from '@/components/BrandLogo';
import {
  IconDashboard, IconModules, IconCategories, IconArticles, IconVideos, IconVisitors,
  IconExternal, IconLogout,
} from './icons';

const NAV = [
  { href: '/admin', label: 'Dashboard', Icon: IconDashboard },
  { href: '/admin/modules', label: 'Modules', Icon: IconModules },
  { href: '/admin/categories', label: 'Categories', Icon: IconCategories },
  { href: '/admin/articles', label: 'Articles', Icon: IconArticles },
  { href: '/admin/videos', label: 'Videos', Icon: IconVideos },
  { href: '/admin/visitors', label: 'Visitors', Icon: IconVisitors },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const initials = (user?.name ?? user?.email ?? 'A')
    .split(/[\s@.]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('');

  const currentPage = NAV.find((n) =>
    n.href === '/admin' ? pathname === '/admin' : pathname.startsWith(n.href)
  )?.label ?? 'Dashboard';

  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <Link href="/admin" className="admin-brand">
          <span className="admin-brand-badge">
            <BrandLogo size={26} />
          </span>
          <span style={{ lineHeight: 1.15 }}>
            <span style={{ fontWeight: 800, fontSize: 19, letterSpacing: '-0.01em', color: '#fff' }}>
              <span className="grad-tw">Tech</span>Wiki
            </span>
            <span className="admin-brand-sub">ADMIN PORTAL</span>
          </span>
        </Link>

        <nav className="admin-nav">
          {NAV.map(({ href, label, Icon }) => {
            const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
            return (
              <Link key={href} href={href} title={label} className={`nav-item${active ? ' active' : ''}`}>
                <span className="nav-ico"><Icon size={20} /></span>
                <span className="nav-label">{label}</span>
              </Link>
            );
          })}
        </nav>

        <Link href="/" className="nav-item nav-foot">
          <span className="nav-ico"><IconExternal size={18} /></span>
          <span className="nav-label">View site</span>
        </Link>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="topbar-lead">
            <span className="topbar-page">{currentPage}</span>
          </div>

          <div className="topbar-actions">
            <div className="user-chip">
              <div className="admin-avatar">{initials}</div>
              <div className="user-chip-meta">
                <div className="user-chip-name">{user?.name ?? 'Admin'}</div>
                <div className="user-chip-mail">{user?.email}</div>
              </div>
            </div>

            <button onClick={logout} className="topbar-logout" title="Logout">
              <IconLogout size={16} /> <span>Logout</span>
            </button>
          </div>
        </header>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
