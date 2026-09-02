import { Outlet, useLocation } from 'react-router-dom';
import { PATHS } from '@/constants';
import PublicFooter from '@/features/home/components/PublicFooter';
import PublicHeader from '@/features/home/components/PublicHeader';

/**
 * PublicLayout — layout chung cho các trang công khai:
 * PublicHeader (sticky) + Outlet (nội dung page) + PublicFooter.
 *
 * Trước đây mỗi page tự gắn header/footer riêng dẫn tới lặp code và thiếu
 * đồng bộ. Layout này là nơi duy nhất định nghĩa khung ngoài cho toàn bộ
 * public route (home, tours, news, news detail, …).
 *
 * Trang chủ (Home) không hiện PublicFooter — nội dung là 1 trải nghiệm cuộn
 * cinematic pin toàn màn hình (CinematicScrollLanding), footer đặt ngay sau đó
 * không hợp bố cục.
 */
export default function PublicLayout() {
  const { pathname } = useLocation();
  const isHome = pathname === PATHS.HOME;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />

      <main className="flex-1">
        <Outlet />
      </main>

      {!isHome && <PublicFooter />}
    </div>
  );
}
