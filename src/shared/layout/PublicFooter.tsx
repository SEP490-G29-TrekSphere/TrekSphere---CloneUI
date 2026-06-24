import { Link } from 'react-router-dom';

const FOOTER_LINKS = [
  { label: 'Về chúng tôi', to: '/about' },
  { label: 'Điều khoản sử dụng', to: '/terms' },
  { label: 'Chính sách bảo mật', to: '/privacy' },
  { label: 'Liên hệ', to: '/contact' },
];

export default function PublicFooter() {
  return (
    <footer style={{ backgroundColor: '#1F3933' }}>
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0">
            <span className="text-xl font-bold" style={{ color: '#A2EBD2' }}>
              TrekSphere
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex flex-wrap items-center justify-center gap-6">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm transition-opacity hover:opacity-80"
                style={{ color: '#A2EBD2' }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Copyright */}
          <p className="text-sm shrink-0" style={{ color: '#A2EBD2' }}>
            &copy; 2024 TrekSphere. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
