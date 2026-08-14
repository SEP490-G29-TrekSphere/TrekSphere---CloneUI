import { CalendarClock, LogOut, MessageSquare } from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { PATHS } from '@/constants';
import { useLogout } from '@/features/auth/hooks/useLogout';
import PortalShell from '@/shared/layout/PortalShell';
import { useAppStore } from '@/store/useAppStore';

/**
 * Layout riêng cho khu vực Coordinator — sidebar cố định kiểu `VendorStaffLayout`
 * (TrekPartner) thay cho `MainLayout` chung, thương hiệu "TrekSphere" đồng bộ
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
      rootClassName="bg-[#F4F4F2]"
      sidebarClassName="bg-[#FAF9F5] border-r border-[#E5E4DE]"
      mobileTitle="TrekSphere"
      fullBleed={isChatPage}
      brand={
        <Link to={PATHS.HOME} className="hover:opacity-85 transition-opacity block">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0B3025] leading-none mb-1">
            TrekSphere
          </h1>
          <span className="text-xs text-zinc-500 font-medium tracking-wide">HƯỚNG DẪN VIÊN</span>
        </Link>
      }
      nav={
        <nav className="px-4 space-y-1">
          {(() => {
            const isActive = location.pathname.startsWith(PATHS.COORDINATOR_SCHEDULES);
            return (
              <Link
                to={PATHS.COORDINATOR_SCHEDULES}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-[#0B3025] text-white shadow-md'
                    : 'text-zinc-600 hover:bg-[#EAE8E2] hover:text-[#0B3025]'
                }`}
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
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-[#0B3025] text-white shadow-md'
                    : 'text-zinc-600 hover:bg-[#EAE8E2] hover:text-[#0B3025]'
                }`}
              >
                <MessageSquare className="h-5 w-5" />
                Trò chuyện
              </Link>
            );
          })()}
        </nav>
      }
      userCard={
        <div className="p-4 border-t border-[#E5E4DE] bg-[#FAF9F5]">
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAF9F5]">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0B3025] text-white text-base font-bold shadow-sm">
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
                <span className="truncate text-sm font-bold text-zinc-800 leading-tight">
                  {coordinatorName}
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
