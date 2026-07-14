import {
  Bell,
  ClipboardCheck,
  Database,
  LayoutGrid,
  LogOut,
  Search,
  Settings,
  Ticket,
  User,
} from 'lucide-react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { PATHS } from '@/constants';
import { useAppStore } from '@/store/useAppStore';

const adminNavItems = [
  { name: 'Dashboard', path: PATHS.ADMIN_DASHBOARD, icon: LayoutGrid, disabled: true },
  { name: 'Account', path: PATHS.ADMIN_ACCOUNTS, icon: User },
  { name: 'Tour Approval', path: PATHS.ADMIN_APPLICATIONS, icon: ClipboardCheck },
  { name: 'Data Management', path: PATHS.ADMIN_DATA, icon: Database, disabled: true },
  { name: 'Voucher Approval', path: PATHS.ADMIN_VOUCHERS, icon: Ticket, disabled: true },
  { name: 'Settings', path: PATHS.ADMIN_SETTINGS, icon: Settings, disabled: true },
];

export default function AdminLayout() {
  const location = useLocation();
  const user = useAppStore((state) => state.user);
  const setUser = useAppStore((state) => state.setUser);
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    navigate(PATHS.LOGIN);
  };

  // Get current day name in Vietnamese dynamically from current date
  const getFormattedDate = () => {
    const today = new Date();
    const weekdays = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const weekdayName = weekdays[today.getDay()];
    const day = today.getDate();
    const month = today.getMonth() + 1;
    return `${weekdayName}, ${day} Tháng ${month}`;
  };

  const adminName = user?.name || 'Admin User';
  const adminInitial = adminName.charAt(0).toUpperCase();

  // Trang Quản lý tài khoản dùng placeholder riêng cho ô search
  // ("Tìm kiếm tài khoản...") thay vì "Tìm kiếm hồ sơ...". Các icon
  // bên phải (chuông / cài đặt / ngày tháng) hiển thị giống các trang admin khác.
  const isAccountPage = location.pathname.startsWith(PATHS.ADMIN_ACCOUNTS);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F4F4F2]">
      {/* Sidebar */}
      <aside className="hidden md:flex w-72 flex-col bg-[#FAF9F5] border-r border-[#E5E4DE] justify-between">
        <div className="flex flex-col py-6">
          {/* Header/Logo */}
          <div className="px-6 mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-[#0B3025] leading-none mb-1">
              TrekSphere
            </h1>
            <span className="text-xs text-zinc-500 font-medium tracking-wide">ADMIN PORTAL</span>
          </div>

          {/* Navigation Items */}
          <nav className="px-4 space-y-1">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              if (item.disabled) {
                return (
                  <span
                    key={item.name}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold opacity-40 cursor-not-allowed text-zinc-400 select-none"
                    title={`${item.name} (chưa thực hiện)`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </span>
                );
              }

              const isActive =
                location.pathname === item.path ||
                (item.path === PATHS.ADMIN_APPLICATIONS &&
                  location.pathname.startsWith(PATHS.ADMIN_APPLICATIONS)) ||
                (item.path === PATHS.ADMIN_ACCOUNTS &&
                  location.pathname.startsWith(PATHS.ADMIN_ACCOUNTS));
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-[#0B3025] text-white shadow-md'
                      : 'text-zinc-600 hover:bg-[#EAE8E2] hover:text-[#0B3025]'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card at bottom */}
        <div className="p-4 border-t border-[#E5E4DE] bg-[#FAF9F5]">
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAF9F5]">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0B3025] text-white text-base font-bold shadow-sm">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={adminName}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span>{adminInitial}</span>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-zinc-800 leading-tight">{adminName}</span>
                <span className="text-[11px] text-zinc-500 font-medium">Hồ sơ quản trị</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="text-zinc-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
              title="Đăng xuất"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 w-full items-center justify-between border-b border-[#E5E4DE] bg-white px-6 md:px-8 shadow-sm">
          {/* Search Bar */}
          <div className="relative w-72 md:w-96">
            <span className="absolute inset-y-0 left-3 flex items-center text-zinc-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder={isAccountPage ? 'Tìm kiếm tài khoản...' : 'Tìm kiếm hồ sơ...'}
              aria-label={isAccountPage ? 'Tìm kiếm tài khoản' : 'Tìm kiếm hồ sơ'}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-full bg-[#F4F4F2] border-none focus:outline-none focus:ring-1 focus:ring-[#0B3025] text-zinc-800 placeholder-zinc-400 transition-all font-medium"
            />
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-6">
            {/* Notifications */}
            <button
              type="button"
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-zinc-600 hover:bg-[#F4F4F2] transition-colors focus:outline-none"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
            </button>

            {/* Settings */}
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-600 hover:bg-[#F4F4F2] transition-colors focus:outline-none"
            >
              <Settings className="h-5 w-5" />
            </button>

            <div className="h-5 w-px bg-zinc-200" />

            {/* Date Display */}
            <span className="text-sm font-semibold text-zinc-500 hidden sm:inline-block">
              {getFormattedDate()}
            </span>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
