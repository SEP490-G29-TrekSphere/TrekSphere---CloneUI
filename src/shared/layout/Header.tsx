import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AppLogo } from '@/shared/ui';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-background px-4 shadow-sm md:px-6">
      <AppLogo height={40} to="/" />
      <div className="flex items-center gap-4">
        {/* Notifications Bell */}
        <Link
          to="/notifications"
          className="relative flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Bell className="size-5" />
          {/* Unread badge indicator */}
          <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-primary ring-2 ring-background">
            4
          </span>
        </Link>
        {/* User avatar placeholder */}
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-sm">
          A
        </div>
      </div>
    </header>
  );
}
