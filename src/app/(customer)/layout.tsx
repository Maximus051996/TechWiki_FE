import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { VisitorTracker } from '@/components/VisitorTracker';

/** Customer Portal shell — public, no auth. */
export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <VisitorTracker />
      <Navbar />
      <main className="container" style={{ paddingTop: 28, minHeight: '70vh' }}>
        {children}
      </main>
      <Footer />
    </>
  );
}
