import { Outlet } from 'react-router-dom';
import PublicFooter from '@/features/home/components/PublicFooter';
import PublicHeader from '@/features/home/components/PublicHeader';

/**
 * PublicLayout — layout chung cho các trang công khai:
 * PublicHeader (sticky) + Outlet (nội dung page) + PublicFooter.
 *
 * Trước đây mỗi page tự gắn header/footer riêng dẫn tới lặp code và thiếu
 * đồng bộ. Layout này là nơi duy nhất định nghĩa khung ngoài cho toàn bộ
 * public route (home, tours, news, news detail, …).
 */
export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />

      <main className="flex-1">
        <Outlet />
      </main>

      <PublicFooter />
    </div>
  );
}
