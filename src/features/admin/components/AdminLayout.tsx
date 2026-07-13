import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

/**
 * Layout cho toàn bộ khu vực Admin.
 * - 2 cột: Sidebar cố định (20% width) + Main content (80% width).
 * - Sidebar nền xanh rêu đậm, full height.
 * - Main content nền trắng kem nhạt.
 */
export default function AdminLayout() {
  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ backgroundColor: '#FAF8F1' }}>
      {/* Sidebar - 20% width */}
      <div className="hidden shrink-0 md:block md:w-[20%] md:min-w-[260px] md:max-w-[300px]">
        <AdminSidebar />
      </div>

      {/* Main content - 80% width */}
      <main className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
