import { Outlet } from 'react-router-dom';
import PublicFooter from '@/features/home/components/PublicFooter';
import PublicHeader from '@/features/home/components/PublicHeader';

export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}
