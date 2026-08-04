import { CalendarClock, LogOut, MountainSnow } from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { PATHS } from '@/constants';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { useAppStore } from '@/store/useAppStore';

/**
 * Layout riêng cho khu vực Coordinator — sidebar cố định kiểu `VendorStaffLayout`
 * (TrekPartner) thay cho `MainLayout` chung, thương hiệu "SummitGuard" đồng bộ
 * với trang Vận hành tour thực địa. Chỉ có đúng 1 mục điều hướng thật:
 * "Xem lịch & phân công" — Coordinator hiện chưa có tính năng nào khác.
 */
export default function CoordinatorLayout() {
  const location = useLocation();
  const user = useAppStore((state) => state.user);
  const { logout } = useLogout({ redirectTo: PATHS.LOGIN });

  const coordinatorName = user?.name || 'Điều phối viên';
  const coordinatorInitial = coordinatorName.charAt(0).toUpperCase();

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ backgroundColor: '#FAF8F1' }}>
      <aside
        className="hidden md:flex w-72 flex-col justify-between"
        style={{ backgroundColor: '#EFECE6', borderRight: '1px solid #E0DCD1' }}
      >
        <div className="flex flex-col py-6">
          <div className="px-6 mb-8">
            <Link
              to={PATHS.HOME}
              className="flex items-center gap-2 hover:opacity-85 transition-opacity block"
            >
              <MountainSnow className="h-7 w-7" style={{ color: '#06261D' }} />
              <div className="flex flex-col">
                <h1
                  className="text-2xl font-extrabold tracking-tight leading-none"
                  style={{ color: '#06261D' }}
                >
                  SummitGuard
                </h1>
                <span className="text-xs font-medium tracking-wide" style={{ color: '#6F7B75' }}>
                  Điều phối viên hiện trường
                </span>
              </div>
            </Link>
          </div>

          <nav className="px-4 space-y-1">
            {(() => {
              const isActive = location.pathname.startsWith(PATHS.COORDINATOR_SCHEDULES);
              return (
                <Link
                  to={PATHS.COORDINATOR_SCHEDULES}
                  className="flex items-center gap-3 px-4 py-3 rounded-full text-sm font-semibold transition-all"
                  style={
                    isActive
                      ? { backgroundColor: 'rgba(162, 235, 210, 0.35)', color: '#06261D' }
                      : { color: '#6F7B75' }
                  }
                >
                  <CalendarClock className="h-5 w-5" />
                  Xem lịch & phân công
                </Link>
              );
            })()}
          </nav>
        </div>

        <div className="p-4" style={{ borderTop: '1px solid #E0DCD1' }}>
          <div className="flex items-center justify-between p-2 rounded-xl">
            <div className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-full text-base font-bold shadow-sm"
                style={{ backgroundColor: '#06261D', color: '#FFFFFF' }}
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={coordinatorName}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span>{coordinatorInitial}</span>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold leading-tight" style={{ color: '#06261D' }}>
                  {coordinatorName}
                </span>
                <span className="text-[11px] font-medium" style={{ color: '#6F7B75' }}>
                  Điều phối viên
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="text-red-500 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
              title="Đăng xuất"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
