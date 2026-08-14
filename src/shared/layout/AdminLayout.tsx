import {
  AlertTriangle,
  Building2,
  ClipboardCheck,
  Database,
  LayoutGrid,
  LogOut,
  MessageSquare,
  Newspaper,
  Siren,
  Ticket,
  User,
} from 'lucide-react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { PATHS } from '@/constants';
import PortalShell from '@/shared/layout/PortalShell';
import { useAppStore } from '@/store/useAppStore';

const adminNavItems = [
  { name: 'Bảng điều khiển', path: PATHS.ADMIN_DASHBOARD, icon: LayoutGrid, disabled: true },
  { name: 'Tài khoản', path: PATHS.ADMIN_ACCOUNTS, icon: User },
  { name: 'Quản lý Nhà cung cấp', path: PATHS.ADMIN_VENDORS, icon: Building2 },
  { name: 'Duyệt Nhà Cung Cấp', path: PATHS.ADMIN_APPLICATIONS, icon: ClipboardCheck },
  { name: 'Báo cáo Vi phạm', path: PATHS.ADMIN_REPORTS, icon: AlertTriangle },
  { name: 'Khẩn cấp (SOS)', path: PATHS.ADMIN_EMERGENCY, icon: Siren },
  { name: 'Quản lý Bài Viết', path: PATHS.ADMIN_BLOGS, icon: Newspaper },
  { name: 'Quản lý Dữ liệu', path: PATHS.ADMIN_DATA, icon: Database, disabled: true },
  { name: 'Duyệt Voucher', path: PATHS.ADMIN_VOUCHERS, icon: Ticket, disabled: true },
  { name: 'Trò chuyện', path: PATHS.ADMIN_CHAT, icon: MessageSquare },
];

export default function AdminLayout() {
  const location = useLocation();
  const user = useAppStore((state) => state.user);
  const setUser = useAppStore((state) => state.setUser);
  const navigate = useNavigate();
  const isChatPage = location.pathname === PATHS.ADMIN_CHAT;

  const handleLogout = () => {
    setUser(null);
    navigate(PATHS.LOGIN);
  };

  const adminName = user?.name || 'Admin User';
  const adminInitial = adminName.charAt(0).toUpperCase();

  return (
    <PortalShell
      rootClassName="bg-[#F4F4F2]"
      sidebarClassName="bg-[#FAF9F5] border-r border-[#E5E4DE]"
      mobileTitle="TrekSphere Admin"
      fullBleed={isChatPage}
      brand={
        <Link to={PATHS.HOME} className="hover:opacity-85 transition-opacity block">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0B3025] leading-none mb-1">
            TrekSphere
          </h1>
          <span className="text-xs text-zinc-500 font-medium tracking-wide">QUẢN TRỊ VIÊN</span>
        </Link>
      }
      nav={
        <nav className="px-4 space-y-1">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            if (item.disabled) {
              return null;
            }

            const isActive =
              location.pathname === item.path ||
              (item.path === PATHS.ADMIN_APPLICATIONS &&
                location.pathname.startsWith(PATHS.ADMIN_APPLICATIONS)) ||
              (item.path === PATHS.ADMIN_ACCOUNTS &&
                location.pathname.startsWith(PATHS.ADMIN_ACCOUNTS)) ||
              (item.path === PATHS.ADMIN_REPORTS &&
                location.pathname.startsWith(PATHS.ADMIN_REPORTS));
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
      }
      userCard={
        <div className="p-4 border-t border-[#E5E4DE] bg-[#FAF9F5]">
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAF9F5]">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0B3025] text-white text-base font-bold shadow-sm">
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
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-bold text-zinc-800 leading-tight">
                  {adminName}
                </span>
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
      }
    >
      <Outlet />
    </PortalShell>
  );
}
