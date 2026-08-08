import {
  Backpack,
  BarChart3,
  CalendarClock,
  ClipboardCheck,
  Footprints,
  LayoutGrid,
  LogOut,
  Map as MapIcon,
  MessageSquare,
  Siren,
  Tag,
  Ticket,
  UserRound,
  Users,
} from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { PATHS } from '@/constants';
import { useLogout } from '@/features/auth/hooks/useLogout';
import PortalShell from '@/shared/layout/PortalShell';
import { useAppStore } from '@/store/useAppStore';

const navItems = [
  { name: 'Tổng quan', path: PATHS.VENDOR_MANAGER_PROFILE, icon: LayoutGrid, disabled: false },
  { name: 'Lịch trình', path: PATHS.VENDOR_MANAGER_SESSIONS, icon: CalendarClock, disabled: false },
  { name: 'Nhân viên', path: PATHS.VENDOR_MANAGER_STAFF, icon: Users, disabled: false },
  { name: 'Tour', path: PATHS.VENDOR_MANAGER_TOURS, icon: MapIcon, disabled: false },
  {
    name: 'Duyệt tour',
    path: PATHS.VENDOR_MANAGER_TOUR_APPROVALS,
    icon: ClipboardCheck,
    disabled: false,
  },
  { name: 'Đặt tour', path: PATHS.VENDOR_MANAGER_BOOKINGS, icon: Ticket, disabled: false },
  { name: 'Voucher', path: PATHS.VENDOR_MANAGER_VOUCHERS, icon: Tag, disabled: false },
  { name: 'Khách hàng', path: '', icon: UserRound, disabled: true },
  { name: 'Thiết bị', path: PATHS.VENDOR_MANAGER_EQUIPMENT, icon: Backpack, disabled: false },
  { name: 'Porter', path: PATHS.VENDOR_MANAGER_PORTERS, icon: Footprints, disabled: false },
  { name: 'Khẩn cấp (SOS)', path: PATHS.VENDOR_MANAGER_EMERGENCY, icon: Siren, disabled: false },
  { name: 'Trò chuyện', path: PATHS.VENDOR_MANAGER_CHAT, icon: MessageSquare, disabled: false },
  { name: 'Báo cáo', path: '', icon: BarChart3, disabled: true },
];

export default function VendorManagerLayout() {
  const location = useLocation();
  const user = useAppStore((state) => state.user);
  const { logout } = useLogout({ redirectTo: PATHS.LOGIN });
  const isChatPage = location.pathname === PATHS.VENDOR_MANAGER_CHAT;

  const vendorName = user?.name || 'Vendor Manager';
  const vendorInitial = vendorName.charAt(0).toUpperCase();

  // Nhiều mục có thể cùng khớp prefix (vd "Tour" và "Duyệt tour" đều bắt đầu bằng
  // "/vendor-manager/tours") — chỉ mục có path khớp DÀI NHẤT được coi là active.
  const activeItem = navItems
    .filter((item) => !item.disabled && location.pathname.startsWith(item.path))
    .sort((a, b) => b.path.length - a.path.length)[0];

  return (
    <PortalShell
      rootStyle={{ backgroundColor: '#FAF8F1' }}
      sidebarStyle={{ backgroundColor: '#EFECE6', borderRight: '1px solid #E0DCD1' }}
      mobileTitle="TrekManager"
      fullBleed={isChatPage}
      brand={
        <Link to={PATHS.HOME} className="hover:opacity-85 transition-opacity block">
          <h1
            className="text-3xl font-extrabold tracking-tight leading-none mb-1"
            style={{ color: '#06261D' }}
          >
            TrekManager
          </h1>
          <span className="text-xs font-medium tracking-wide" style={{ color: '#6F7B75' }}>
            Quản lý đoàn leo núi
          </span>
        </Link>
      }
      nav={
        <nav className="px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            if (item.disabled) {
              return null;
            }

            const isActive = item === activeItem;
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
                    alt={vendorName}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span>{vendorInitial}</span>
                )}
              </div>
              <div className="flex min-w-0 flex-col">
                <span
                  className="truncate text-sm font-bold leading-tight"
                  style={{ color: '#06261D' }}
                >
                  {vendorName}
                </span>
                <span className="text-[11px] font-medium" style={{ color: '#6F7B75' }}>
                  Quản lý
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
