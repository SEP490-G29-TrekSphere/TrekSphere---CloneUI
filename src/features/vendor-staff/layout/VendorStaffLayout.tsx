import {
  Backpack,
  BarChart3,
  CalendarClock,
  Footprints,
  LayoutGrid,
  LogOut,
  Map as MapIcon,
  MessageSquare,
  PenSquare,
  Tag,
  Ticket,
} from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { PATHS } from '@/constants';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { useAppStore } from '@/store/useAppStore';

/**
 * Menu Vendor Staff — mirror `VendorManagerLayout` nhưng KHÔNG có mục "Nhân
 * viên" (đó là quyền riêng của Vendor Manager, xem `ROLE_PROTECTED_ROUTES`).
 */
const navItems = [
  { name: 'Tổng quan', path: PATHS.PARTNER_PROFILE, icon: LayoutGrid, disabled: false },
  { name: 'Lịch trình', path: PATHS.PARTNER_SESSIONS, icon: CalendarClock, disabled: false },
  { name: 'Tour', path: PATHS.PARTNER_TOURS, icon: MapIcon, disabled: false },
  { name: 'Đặt tour', path: PATHS.PARTNER_BOOKINGS, icon: Ticket, disabled: false },
  { name: 'Voucher', path: PATHS.PARTNER_VOUCHERS, icon: Tag, disabled: false },
  { name: 'Thiết bị', path: PATHS.PARTNER_EQUIPMENT, icon: Backpack, disabled: false },
  { name: 'Porter', path: PATHS.PARTNER_PORTERS, icon: Footprints, disabled: false },
  { name: 'Viết Blog', path: PATHS.PARTNER_BLOG_CREATE, icon: PenSquare, disabled: false },
  { name: 'Trò chuyện', path: PATHS.PARTNER_CHAT, icon: MessageSquare, disabled: false },
  { name: 'Báo cáo', path: '', icon: BarChart3, disabled: true },
];

export default function VendorStaffLayout() {
  const location = useLocation();
  const user = useAppStore((state) => state.user);
  const { logout } = useLogout({ redirectTo: PATHS.LOGIN });

  const staffName = user?.name || 'Vendor Staff';
  const staffInitial = staffName.charAt(0).toUpperCase();
  const isChatPage = location.pathname === PATHS.PARTNER_CHAT;

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ backgroundColor: '#FAF8F1' }}>
      <aside
        className="hidden md:flex w-72 flex-col justify-between"
        style={{ backgroundColor: '#EFECE6', borderRight: '1px solid #E0DCD1' }}
      >
        <div className="flex flex-col py-6">
          <div className="px-6 mb-8">
            <Link to={PATHS.HOME} className="hover:opacity-85 transition-opacity block">
              <h1
                className="text-3xl font-extrabold tracking-tight leading-none mb-1"
                style={{ color: '#06261D' }}
              >
                TrekPartner
              </h1>
              <span className="text-xs font-medium tracking-wide" style={{ color: '#6F7B75' }}>
                Quản lý tour của bạn
              </span>
            </Link>
          </div>

          <nav className="px-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              if (item.disabled) {
                return (
                  <span
                    key={item.name}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold opacity-40 cursor-not-allowed select-none"
                    style={{ color: '#6F7B75' }}
                    title={`${item.name} (chưa thực hiện)`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </span>
                );
              }

              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className="flex items-center gap-3 px-4 py-3 rounded-full text-sm font-semibold transition-all"
                  style={
                    isActive
                      ? { backgroundColor: 'rgba(162, 235, 210, 0.35)', color: '#06261D' }
                      : { color: '#6F7B75' }
                  }
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
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
                    alt={staffName}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span>{staffInitial}</span>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold leading-tight" style={{ color: '#06261D' }}>
                  {staffName}
                </span>
                <span className="text-[11px] font-medium" style={{ color: '#6F7B75' }}>
                  Nhân viên
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

      {/* Không có header riêng — mỗi trang tự dựng tiêu đề/thanh công cụ của
          mình, giống VendorManagerLayout và CoordinatorLayout. */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main
          className={`flex-1 ${isChatPage ? 'overflow-hidden p-0' : 'overflow-y-auto p-6 md:p-8'}`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
