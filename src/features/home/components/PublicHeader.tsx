import { Link, useLocation } from 'react-router-dom';
import { PATHS } from '@/constants';
import { AppLogo } from '@/shared/ui';

const NAV_ITEMS = [
  { label: 'KhÃ¡m phÃ¡', path: PATHS.HOME },
  { label: 'Tour cá»§a tÃ´i', path: PATHS.MY_TOURS },
  { label: 'Cá»™ng Ä‘á»“ng', path: PATHS.COMMUNITY },
  { label: 'Tin tá»©c', path: PATHS.NEWS },
];

/**
 * PublicHeader â€” header cho landing page (guest).
 * Sau nÃ y má»—i actor cÃ³ header riÃªng, file nÃ y chá»‰ dÃ¹ng cho trang public.
 */
export default function PublicHeader() {
  const location = useLocation();

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
        </div>
      </div>
    </header>
  );
}
