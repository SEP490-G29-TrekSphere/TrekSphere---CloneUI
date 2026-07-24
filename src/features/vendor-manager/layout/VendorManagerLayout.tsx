import {
  Backpack,
  BarChart3,
  Bell,
  CalendarClock,
  LayoutGrid,
  LogOut,
  Map as MapIcon,
  Search,
  Settings,
  UserRound,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { PATHS } from '@/constants';
import { useLogout } from '@/features/auth/hooks/useLogout';
import type { VendorManagerLayoutContext } from '@/features/vendor-manager/staff/types';
import { useAppStore } from '@/store/useAppStore';

const navItems = [
  { name: 'Tổng quan', path: '', icon: LayoutGrid, disabled: true },
  { name: 'Lịch trình', path: '', icon: CalendarClock, disabled: true },
  { name: 'Nhân viên', path: PATHS.VENDOR_MANAGER_STAFF, icon: Users, disabled: false },
  { name: 'Tour', path: PATHS.VENDOR_MANAGER_TOURS, icon: MapIcon, disabled: false },
  { name: 'Khách hàng', path: '', icon: UserRound, disabled: true },
  { name: 'Thiết bị', path: '', icon: Backpack, disabled: true },
  { name: 'Báo cáo', path: '', icon: BarChart3, disabled: true },
];

export default function VendorManagerLayout() {
  const location = useLocation();
  const user = useAppStore((state) => state.user);
  const { logout } = useLogout({ redirectTo: PATHS.LOGIN });
  const [searchValue, setSearchValue] = useState('');

  const vendorName = user?.name || 'Vendor Manager';
  const vendorInitial = vendorName.charAt(0).toUpperCase();
  // Header search chỉ phục vụ trang Nhân viên (lọc qua context) — ẩn ở màn Tour
  // vì Tour đã có ô lọc riêng của chính nó, header ở đây chỉ là dư thừa.
  const showHeader = !location.pathname.startsWith(PATHS.VENDOR_MANAGER_TOURS);

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ backgroundColor: '#FAF8F1' }}>
      <aside
        className="hidden md:flex w-72 flex-col justify-between"
        style={{ backgroundColor: '#EFECE6', borderRight: '1px solid #E0DCD1' }}
      >
        <div className="flex flex-col py-6">
          <div className="px-6 mb-8">
            <h1
              className="text-3xl font-extrabold tracking-tight leading-none mb-1"
              style={{ color: '#06261D' }}
            >
              TrekManager
            </h1>
            <span className="text-xs font-medium tracking-wide" style={{ color: '#6F7B75' }}>
              Quản lý đoàn leo núi
            </span>
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
                    alt={vendorName}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span>{vendorInitial}</span>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold leading-tight" style={{ color: '#06261D' }}>
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
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {showHeader && (
          <header
            className="flex h-16 w-full items-center justify-between bg-white px-6 md:px-8 shadow-sm"
            style={{ borderBottom: '1px solid #E6E2D1' }}
          >
            <div className="relative w-72 md:w-96">
              <span
                className="absolute inset-y-0 left-3 flex items-center"
                style={{ color: '#6F7B75' }}
              >
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Tìm kiếm thông tin nhân viên..."
                aria-label="Tìm kiếm thông tin nhân viên"
                className="w-full pl-10 pr-4 py-2 text-sm rounded-full border-none focus:outline-none focus:ring-1 transition-all font-medium"
                style={{ backgroundColor: '#F0EEE6', color: '#06261D' }}
              />
            </div>

            <div className="flex items-center gap-6">
              <button
                type="button"
                className="relative flex h-9 w-9 items-center justify-center rounded-full transition-colors focus:outline-none"
                style={{ color: '#6F7B75' }}
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
              </button>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full transition-colors focus:outline-none"
                style={{ color: '#6F7B75' }}
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </header>
        )}

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet context={{ searchValue } satisfies VendorManagerLayoutContext} />
        </main>
      </div>
    </div>
  );
}
