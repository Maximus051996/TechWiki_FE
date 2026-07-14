import { AuthProvider } from '@/lib/auth';
import { ToastProvider } from '@/components/ui/Toast';

/** Admin Portal shell — distinct URL namespace (/admin) with its own provider. */
export const metadata = { title: { default: 'Admin', template: '%s · TechWiki Admin' } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>{children}</ToastProvider>
    </AuthProvider>
  );
}
