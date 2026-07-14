import { Bell, ChevronDown, HelpCircle, LogOut, Search, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '@/constants';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { useAppStore } from '@/store/useAppStore';

interface AdminTopbarProps {
  /** Giá trị ô search hiện tại (controlled). */
  searchValue?: string;
  /** Callback khi user gõ vào ô search. */
  onSearchChange?: (value: string) => void;
  /** Placeholder cho ô search. */
  searchPlaceholder?: string;
}

const LANGUAGES = ['Tiếng Việt', 'English'] as const;
type Language = (typeof LANGUAGES)[number];

const FALLBACK_AVATAR =
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face';

/**
 * Topbar của khu vực Admin.
 * - Nền trắng kem nhạt (mặc định bg-card), đường viền mỏng phân cách bên dưới.
 * - Bên trái: ô search bo góc tròn với icon kính lúp.
 * - Bên phải: thông báo (chuông), trợ giúp (chấm hỏi), chọn ngôn ngữ, avatar +
 *   dropdown "Hồ sơ" / "Đăng xuất".
 */
export default function AdminTopbar({
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Tìm kiếm tài khoản...',
}: AdminTopbarProps) {
  const navigate = useNavigate();
  const user = useAppStore((state) => state.user);
  const { logout } = useLogout({ redirectTo: PATHS.LOGIN });

  const [language, setLanguage] = useState<Language>('Tiếng Việt');
  const [languageOpen, setLanguageOpen] = useState(false);
  const languageRef = useRef<HTMLDivElement>(null);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!languageOpen) return;
    const handler = (e: MouseEvent) => {
      if (languageRef.current && !languageRef.current.contains(e.target as Node)) {
        setLanguageOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [languageOpen]);

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

  const avatarUrl = user?.avatarUrl ?? FALLBACK_AVATAR;
  const displayName = user?.name ?? 'Admin User';
  const displayEmail = user?.email ?? 'admin@treksphere.com';
  const initial = displayName.charAt(0).toUpperCase();

  const handleProfileClick = () => {
    setDropdownOpen(false);
    navigate(PATHS.PROFILE);
  };

  const handleLogoutClick = async () => {
    setDropdownOpen(false);
    await logout();
  };

  return (
    <header
      className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b px-8"
      style={{ backgroundColor: '#FFFFFF', borderColor: '#E6E2D1' }}
    >
      {/* Search bar */}
      <div className="flex max-w-md flex-1 items-center">
        <div className="relative w-full">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2"
            style={{ color: '#6F7B75' }}
          />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-11 w-full rounded-full pl-11 pr-4 text-sm outline-none transition-colors focus:ring-2"
            style={{
              backgroundColor: '#F0EEE6',
              color: '#06261D',
              border: '1px solid transparent',
            }}
          />
        </div>
      </div>

      {/* Right side icons */}
      <div className="flex items-center gap-3">
        {/* Notification */}
        <button
          type="button"
          aria-label="Thông báo"
          className="relative flex h-10 w-10 items-center justify-center rounded-full transition-colors"
          style={{ color: '#6F7B75' }}
        >
          <Bell className="h-5 w-5" />
          <span
            className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
            style={{ backgroundColor: '#A2EBD2', color: '#06261D' }}
          >
            3
          </span>
        </button>

        {/* Help */}
        <button
          type="button"
          aria-label="Trợ giúp"
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors"
          style={{ color: '#6F7B75' }}
        >
          <HelpCircle className="h-5 w-5" />
        </button>

        {/* Language selector */}
        <div className="relative" ref={languageRef}>
          <button
            type="button"
            onClick={() => setLanguageOpen((prev) => !prev)}
            className="flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors"
            style={{
              backgroundColor: '#F0EEE6',
              color: '#06261D',
              border: '1px solid #E6E2D1',
            }}
          >
            <span>{language}</span>
            <ChevronDown className="h-4 w-4" />
          </button>

          {languageOpen && (
            <div
              className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl py-1 shadow-lg"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #E6E2D1' }}
            >
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => {
                    setLanguage(lang);
                    setLanguageOpen(false);
                  }}
                  className="flex w-full items-center justify-between px-4 py-2 text-sm transition-colors hover:bg-muted"
                  style={{
                    color: lang === language ? '#06261D' : '#6F7B75',
                    fontWeight: lang === language ? 600 : 500,
                  }}
                >
                  <span>{lang}</span>
                  {lang === language && (
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: '#06261D' }} />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Avatar + dropdown Hồ sơ / Đăng xuất */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            aria-haspopup="menu"
            aria-expanded={dropdownOpen}
            aria-label="Mở menu cá nhân"
            className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full text-sm font-bold transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{
              backgroundColor: '#A2EBD2',
              color: '#06261D',
            }}
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
          </button>

          {dropdownOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl shadow-lg"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #E6E2D1' }}
            >
              <div className="px-4 py-3">
                <p className="truncate text-sm font-semibold" style={{ color: '#06261D' }}>
                  {displayName}
                </p>
                <p className="truncate text-xs" style={{ color: '#6F7B75' }}>
                  {displayEmail}
                </p>
              </div>
              <div className="h-px" style={{ backgroundColor: '#E6E2D1' }} />
              <button
                type="button"
                role="menuitem"
                onClick={handleProfileClick}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
                style={{ color: '#06261D' }}
              >
                <User className="h-4 w-4" style={{ color: '#6F7B75' }} />
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
    </header>
  );
}
