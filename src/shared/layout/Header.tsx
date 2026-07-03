import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PATHS } from '@/constants';
import { AppLogo } from '@/shared/ui';
import { useAppStore } from '@/store/useAppStore';

export default function Header() {
  const user = useAppStore((state) => state.user);
  // Lấy chữ cái đầu của tên user làm avatar placeholder
  const initial = user?.name?.charAt(0).toUpperCase() ?? 'A';

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-background px-4 shadow-sm md:px-6">
      <AppLogo height={40} to="/" />
      <div className="flex items-center gap-4">
        {/* Notifications Bell */}
        <Link
          to={PATHS.NOTIFICATIONS}
          className="relative flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Bell className="size-5" />
          {/* Unread badge indicator */}
          <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-primary ring-2 ring-background">
            4
          </span>
        </Link>
        {/* User avatar — click vào để mở trang hồ sơ */}
        <Link
          to={PATHS.PROFILE}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
          aria-label="Mở hồ sơ cá nhân"
        >
          {initial}
        </Link>
      </div>
    </header>
  );
}
