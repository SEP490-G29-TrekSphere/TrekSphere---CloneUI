import {
  ClipboardList,
  Compass,
  FileText,
  Key,
  LogOut,
  MessageSquare,
  User,
  Users,
} from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { PATHS } from '@/constants';
import { useLogout } from '@/features/auth/hooks/useLogout';
import PortalShell from '@/shared/layout/PortalShell';
import { useAppStore } from '@/store/useAppStore';

const navItems = [
  { name: 'Hồ sơ', path: PATHS.TREKKER_PROFILE, icon: User, disabled: false },
  { name: 'Tour của tôi', path: PATHS.TREKKER_MY_TOURS, icon: Compass, disabled: false },
  { name: 'Nhóm của tôi', path: PATHS.TREKKER_MY_GROUPS, icon: Users, disabled: false },
  {
    name: 'Lịch sử đăng ký Vendor',
    path: PATHS.TREKKER_VENDOR_APPLICATIONS,
    icon: ClipboardList,
    disabled: false,
  },
  {
    name: 'Bài viết của tôi',
    path: PATHS.TREKKER_BLOG_LIST,
    icon: FileText,
    disabled: false,
  },
  {
    name: 'Đổi mật khẩu',
    path: PATHS.TREKKER_CHANGE_PASSWORD,
    icon: Key,
    disabled: false,
  },
  {
    name: 'Trò chuyện',
    path: PATHS.TREKKER_CHAT,
    icon: MessageSquare,
    disabled: false,
  },
];

export default function TrekkerLayout() {
  const location = useLocation();
  const user = useAppStore((state) => state.user);
  const { logout } = useLogout({ redirectTo: PATHS.LOGIN });
  const isChatPage = location.pathname === PATHS.TREKKER_CHAT;

  const userName = user?.name || 'Trekker';
  const userInitial = userName.charAt(0).toUpperCase();

  // Active item: longest matching path wins
  const activeItem = navItems
    .filter((item) => !item.disabled && location.pathname.startsWith(item.path))
    .sort((a, b) => b.path.length - a.path.length)[0];

  return (
    <PortalShell
      rootStyle={{ backgroundColor: '#FAF8F1' }}
      sidebarStyle={{ backgroundColor: '#EFECE6', borderRight: '1px solid #E0DCD1' }}
      mobileTitle="TrekSphere"
      fullBleed={isChatPage}
      brand={
        <Link to={PATHS.HOME} className="hover:opacity-85 transition-opacity block">
          <h1
            className="text-3xl font-extrabold tracking-tight leading-none mb-1"
            style={{ color: '#06261D' }}
          >
            TrekSphere
          </h1>
          <span className="text-xs font-medium tracking-wide" style={{ color: '#6F7B75' }}>
            Tài khoản cá nhân
          </span>
        </Link>
      }
      nav={
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
                    alt={userName}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span>{userInitial}</span>
                )}
              </div>
              <div className="flex min-w-0 flex-col">
                <span
                  className="truncate text-sm font-bold leading-tight"
                  style={{ color: '#06261D' }}
                >
                  {userName}
                </span>
                <span className="text-[11px] font-medium" style={{ color: '#6F7B75' }}>
                  Trekker
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
