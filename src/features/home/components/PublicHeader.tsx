import { Bell, LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PATHS } from '@/constants';
import { getRoleDashboardPath } from '@/constants/roles';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { mockNotifications } from '@/features/notifications/data/mockNotifications';
import { AppLogo } from '@/shared/ui';
import { useAppStore } from '@/store/useAppStore';

const NAV_ITEMS = [
  { label: 'Trang chủ', path: PATHS.HOME },
  { label: 'Danh sách Tour', path: PATHS.TOURS },
  { label: 'Ghép nhóm', path: PATHS.GROUPS },
  { label: 'Bài viết', path: PATHS.NEWS },
];

export default function PublicHeader() {
  const location = useLocation();
  const user = useAppStore((state) => state.user);
  // Đang ở trang public nên logout xong vẫn đứng nguyên tại chỗ — truyền
  // pathname hiện tại làm `redirectTo` để `useLogout` không đá đi đâu cả.
  const { logout } = useLogout({ redirectTo: location.pathname });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void location.pathname;
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [location.pathname]);

  // Điều hướng xong thì đóng mobile menu, nếu không nó che mất trang vừa mở.
  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname chỉ dùng để trigger effect, không đọc giá trị trong body
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
  };

  const initial = user?.name?.charAt(0).toUpperCase() ?? 'A';
  const unreadCount = mockNotifications.filter((n) => !n.read).length;
  const dashboardPath = getRoleDashboardPath(user?.roles);

  // On the home page the header starts transparent over the cinematic hero
  const isHome = location.pathname === PATHS.HOME;
  const transparent = isHome && !scrolled;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || !isHome
          ? 'bg-background/80 backdrop-blur-[16px] border-b border-border/60'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-none w-full items-center justify-between px-4 sm:px-6">
        <AppLogo height={40} to={PATHS.HOME} tone={transparent ? 'light' : undefined} />

        <nav className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative text-sm font-medium transition-colors ${
                  transparent
                    ? isActive
                      ? 'text-white'
                      : 'text-white/70 hover:text-white'
                    : isActive
                      ? 'text-primary hover:text-primary'
                      : 'text-muted-foreground hover:text-primary'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    className={`absolute -bottom-1 left-0 right-0 h-0.5 rounded-full ${
                      transparent ? 'bg-white' : 'bg-primary'
                    }`}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            /* Authenticated: bell + avatar + dropdown */
            <>
              <Link
                to={PATHS.NOTIFICATIONS}
                className={`relative flex size-9 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring mr-1 ${
                  transparent
                    ? 'text-white/80 hover:text-white hover:bg-white/10'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Bell className="size-5" />
                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-primary ring-2 ring-background">
                    {unreadCount}
                  </span>
                )}
              </Link>
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 cursor-pointer"
                  aria-label="Mở menu cá nhân"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name ?? 'User'}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        const span = document.createElement('span');
                        span.textContent = initial;
                        span.className = 'text-sm font-bold text-primary-foreground';
                        target.parentElement?.appendChild(span);
                      }}
                    />
                  ) : (
                    <span>{initial}</span>
                  )}
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border bg-popover p-1 shadow-lg">
                    <div className="px-3 py-2">
                      <p className="truncate text-sm font-semibold">{user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="my-1 h-px bg-border" />
                    {dashboardPath && (
                      <Link
                        to={dashboardPath}
                        onClick={() => setDropdownOpen(false)}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Bảng điều khiển
                      </Link>
                    )}
                    <div className="my-1 h-px bg-border" />
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10 cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Khách vãng lai: Đăng nhập / Đăng ký */
            <>
              <Link
                to={PATHS.LOGIN}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-opacity hover:opacity-80 ${
                  transparent ? 'text-white' : 'text-primary'
                }`}
              >
                Đăng nhập
              </Link>
              <Link
                to={PATHS.REGISTER}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  transparent
                    ? 'text-primary bg-white hover:bg-white/90'
                    : 'text-white bg-primary hover:opacity-90'
                }`}
              >
                Đăng ký
              </Link>
            </>
          )}

          {/* Nút hamburger — chỉ hiện trên mobile, nằm cùng hàng với logo */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className={`-mr-1 flex size-9 items-center justify-center rounded-lg transition-colors md:hidden ${
              transparent ? 'text-white hover:bg-white/10' : 'text-foreground hover:bg-muted'
            }`}
            aria-label="Mở menu điều hướng"
            aria-expanded={mobileMenuOpen}
            aria-controls="public-mobile-nav"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav panel — trượt xuống khi mở, ẩn trên ≥ md */}
      {mobileMenuOpen && (
        <nav
          id="public-mobile-nav"
          className={`md:hidden border-t px-4 py-3 space-y-1 ${
            transparent
              ? 'border-white/20 bg-black/20 backdrop-blur-[16px]'
              : 'border-border/60 bg-background/95 backdrop-blur-[16px]'
          }`}
        >
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  transparent
                    ? isActive
                      ? 'text-white bg-white/10'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                    : isActive
                      ? 'text-primary bg-primary/5'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
