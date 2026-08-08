import { CalendarClock, LogOut, MessageSquare, MountainSnow } from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { PATHS } from '@/constants';
import { useLogout } from '@/features/auth/hooks/useLogout';
import PortalShell from '@/shared/layout/PortalShell';
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
  const isChatPage = location.pathname === PATHS.COORDINATOR_CHAT;

  const coordinatorName = user?.name || 'Điều phối viên';
  const coordinatorInitial = coordinatorName.charAt(0).toUpperCase();

  return (
    <PortalShell
      rootStyle={{ backgroundColor: '#FAF8F1' }}
      sidebarStyle={{ backgroundColor: '#EFECE6', borderRight: '1px solid #E0DCD1' }}
      mobileTitle="SummitGuard"
      fullBleed={isChatPage}
      brand={
        <Link
          to={PATHS.HOME}
          className="flex items-center gap-2 hover:opacity-85 transition-opacity"
        >
          <MountainSnow className="h-7 w-7 shrink-0" style={{ color: '#06261D' }} />
          <div className="flex min-w-0 flex-col">
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
      }
      nav={
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
          {(() => {
            const isActive = location.pathname.startsWith(PATHS.COORDINATOR_CHAT);
            return (
              <Link
                to={PATHS.COORDINATOR_CHAT}
                className="flex items-center gap-3 px-4 py-3 rounded-full text-sm font-semibold transition-all"
                style={
                  isActive
                    ? { backgroundColor: 'rgba(162, 235, 210, 0.35)', color: '#06261D' }
                    : { color: '#6F7B75' }
                }
              >
                <MessageSquare className="h-5 w-5" />
                Trò chuyện
              </Link>
            );
          })()}
        </nav>
      }
      userCard={
        <div className="p-4" style={{ borderTop: '1px solid #E0DCD1' }}>
          <div className="flex items-center justify-between p-2 rounded-xl">
            <div className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-bold shadow-sm"
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
              <div className="flex min-w-0 flex-col">
                <span
                  className="truncate text-sm font-bold leading-tight"
                  style={{ color: '#06261D' }}
                >
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
      }
    >
      <Outlet />
    </PortalShell>
  );
}
