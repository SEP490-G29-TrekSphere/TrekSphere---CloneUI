import { Link, useLocation } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';

const navItems = [
  { name: 'Bảng điều khiển', path: '/' },
  { name: 'Chuyến đi', path: '/trips' },
  { name: 'Cài đặt', path: '/settings' },
];

export default function Sidebar() {
  const isSidebarOpen = useAppStore((state) => state.isSidebarOpen);
  const location = useLocation();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r bg-background transition-transform duration-300 md:relative md:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Need spacing at the top on mobile so it doesn't overlap the fixed header. 
          However, in this layout, the header is to the right of the sidebar, so pt-16 is unnecessary if the sidebar is full height */}
      <div className="flex h-16 items-center border-b px-6 md:hidden">
        <span className="font-bold text-lg">Menu</span>
      </div>
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
