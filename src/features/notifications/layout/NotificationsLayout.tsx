import PublicFooter from '@/features/home/components/PublicFooter';
import PublicHeader from '@/features/home/components/PublicHeader';

export default function NotificationsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />
      <main className="flex-1 pt-16">{children}</main>
      <PublicFooter />
    </div>
  );
}
