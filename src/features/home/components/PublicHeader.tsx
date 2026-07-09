import { LogOut, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PATHS } from '@/constants';
import { authService } from '@/features/auth';
import { AppLogo } from '@/shared/ui';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';
import { storage } from '@/utils/storage';

const NAV_ITEMS = [
  { label: 'Khám phá', path: PATHS.HOME },
  { label: 'Tour của tôi', path: PATHS.MY_TOURS },
  { label: 'Cộng đồng', path: PATHS.COMMUNITY },
  { label: 'Tin tức', path: PATHS.NEWS },
];

/**
 * PublicHeader — header cho landing page.
 * - Chưa login: hiển thị "Sign in / Sign up".
 * - Đã login: hiển thị avatar + dropdown menu (Hồ sơ, Đăng xuất).
 */
export default function PublicHeader() {
  const location = useLocation();
  const user = useAppStore((state) => state.user);
  const setUser = useAppStore((state) => state.setUser);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    await authService.logout();
    storage.remove('accessToken');
    storage.remove('refreshToken');
    setUser(null);
    toast.success('Đã đăng xuất.');
    setDropdownOpen(false);
  };

  const initial = user?.name?.charAt(0).toUpperCase() ?? 'A';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background border-border">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-6">
        <AppLogo height={40} to={PATHS.HOME} />

        <nav className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative text-sm font-medium transition-colors hover:text-primary ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            /* Authenticated: avatar + dropdown */
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
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
                  <Link
                    to={PATHS.PROFILE}
                    onClick={() => setDropdownOpen(false)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <User className="h-4 w-4" />
                    Hồ sơ
                  </Link>
                  <div className="my-1 h-px bg-border" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Guest: Sign in / Sign up */
            <>
              <Link
                to={PATHS.LOGIN}
                className="px-4 py-2 rounded-full text-sm font-semibold transition-opacity hover:opacity-80 text-primary"
              >
                Sign in
              </Link>
              <Link
                to={PATHS.REGISTER}
                className="px-4 py-2 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90 bg-primary"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
