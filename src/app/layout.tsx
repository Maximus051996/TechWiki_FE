import type { Metadata, Viewport } from 'next';
import './globals.css';
import { InitialSplash } from '@/components/InitialSplash';

export const metadata: Metadata = {
  title: { default: 'TechWiki', template: '%s · TechWiki' },
  description: 'A premium, technology-focused knowledge-sharing platform.',
};

export const viewport: Viewport = {
  themeColor: '#0b0f17',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <InitialSplash />
        {children}
      </body>
    </html>
  );
}
