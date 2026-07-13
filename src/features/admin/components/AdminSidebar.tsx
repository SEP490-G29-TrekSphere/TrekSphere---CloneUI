import {
  BarChart3,
  Database,
  LayoutDashboard,
  LogOut,
  MapPin,
  Settings,
  Users,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PATHS } from '@/constants';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { useAppStore } from '@/store/useAppStore';

interface MenuItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}

const menuItems: MenuItem[] = [
  { name: 'Dashboard', path: PATHS.ADMIN_DASHBOARD, icon: LayoutDashboard },
  { name: 'Accounts', path: PATHS.ADMIN_ACCOUNTS, icon: Users },
  { name: 'Tours', path: PATHS.ADMIN_TOURS, icon: MapPin },
  { name: 'Data Management', path: PATHS.ADMIN_DATA, icon: Database },
  { name: 'Settings', path: PATHS.ADMIN_SETTINGS, icon: Settings },
];

const ADMIN_AVATAR =
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face';

/**
 * Sidebar của khu vực Admin.
 * - Nền xanh rêu đậm (#06261D), chiều cao full màn hình.
 * - Logo "Admin Portal" + "MANAGEMENT SUITE" ở trên cùng.
 * - Danh sách menu items dạng cột dọc với highlight cho item đang active.
 * - User info (avatar + name + email) ở dưới cùng, click mở dropdown
 *   với "Hồ sơ" và "Đăng xuất".
 */
export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAppStore((state) => state.user);
  const { logout } = useLogout({ redirectTo: PATHS.LOGIN });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropdownOpen]);

  const avatarUrl = user?.avatarUrl ?? ADMIN_AVATAR;
  const displayName = user?.name ?? 'Admin User';
  const displayEmail = user?.email ?? 'admin@treksphere.com';
  const initial = displayName.charAt(0).toUpperCase();

  const handleProfileClick = () => {
    setDropdownOpen(false);
    // Admin chưa có trang hồ sơ riêng → tạm đưa về login-style profile chung.
    // Sau khi có route admin profile thì đổi sang PATHS.ADMIN_SETTINGS hoặc tạo mới.
    navigate(PATHS.PROFILE);
  };

  const handleLogoutClick = async () => {
    setDropdownOpen(false);
    await logout();
  };

  return (
    <aside
      className="flex h-screen w-full flex-col border-r text-white"
      style={{ backgroundColor: '#06261D' }}
    >
      {/* Logo Header */}
      <div className="flex shrink-0 flex-col px-6 pb-8 pt-8">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: 'rgba(162, 235, 210, 0.15)' }}
          >
            <BarChart3 className="h-5 w-5" style={{ color: '#A2EBD2' }} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold leading-tight text-white">Admin Portal</h1>
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.15em]"
              style={{ color: 'rgba(255, 255, 255, 0.5)' }}
            >
              Management Suite
            </p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.path}
              className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all"
              style={
                isActive
                  ? {
                      backgroundColor: 'rgba(162, 235, 210, 0.12)',
                      color: '#A2EBD2',
                      boxShadow: '0 0 0 1px rgba(162, 235, 210, 0.08)',
                    }
                  : { color: 'rgba(255, 255, 255, 0.6)' }
              }
            >
              <Icon
                className="h-[18px] w-[18px] transition-colors"
                style={{
                  color: isActive ? '#A2EBD2' : 'rgba(255, 255, 255, 0.55)',
                }}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Info Footer — click mở dropdown Hồ sơ / Đăng xuất */}
      <div
        className="mt-auto shrink-0 border-t px-4 py-4"
        style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}
      >
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            aria-haspopup="menu"
            aria-expanded={dropdownOpen}
            className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-bold"
              style={{ backgroundColor: '#A2EBD2', color: '#06261D' }}
            >
              <img
                src={avatarUrl}
                alt={displayName}
                className="h-full w-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const span = document.createElement('span');
                  span.textContent = initial;
                  target.parentElement?.appendChild(span);
                }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{displayName}</p>
              <p className="truncate text-xs" style={{ color: 'rgba(255, 255, 255, 0.55)' }}>
                {displayEmail}
              </p>
            </div>
          </button>

          {dropdownOpen && (
            <div
              role="menu"
              className="absolute bottom-full left-0 right-0 z-50 mb-2 overflow-hidden rounded-xl shadow-lg"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E6E2D1',
              }}
            >
              <button
                type="button"
                role="menuitem"
                onClick={handleProfileClick}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
                style={{ color: '#06261D' }}
              >
                <Users className="h-4 w-4" style={{ color: '#6F7B75' }} />
                Hồ sơ
              </button>
              <div className="h-px" style={{ backgroundColor: '#E6E2D1' }} />
              <button
                type="button"
                role="menuitem"
                onClick={handleLogoutClick}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-destructive/10"
                style={{ color: '#B91C1C' }}
              >
                <LogOut className="h-4 w-4" />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
