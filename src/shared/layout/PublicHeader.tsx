import { Link, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { label: 'Khám phá', path: '/' },
  { label: 'Tour của tôi', path: '/my-tours' },
  { label: 'Cộng đồng', path: '/community' },
  { label: 'Tin tức', path: '/news' },
];

export default function PublicHeader() {
  const location = useLocation();

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 border-b"
      style={{ backgroundColor: '#FAF8F1', borderColor: '#E6E2D1' }}
    >
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="text-xl font-bold" style={{ color: '#1F3933' }}>
            TrekSphere
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative text-sm font-medium transition-colors hover:text-[#1F3933]"
                style={{ color: isActive ? '#1F3933' : '#6F7B75' }}
              >
                {item.label}
                {isActive && (
                  <span
                    className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full"
                    style={{ backgroundColor: '#1F3933' }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="px-4 py-2 rounded-full text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ color: '#1F3933' }}
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#1F3933' }}
          >
            Sign up
          </Link>
        </div>
      </div>
    </header>
  );
}
