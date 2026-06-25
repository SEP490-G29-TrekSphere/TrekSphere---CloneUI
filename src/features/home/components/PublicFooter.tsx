import { Link } from 'react-router-dom';
import { PATHS } from '@/constants';

const FOOTER_LINKS = [
  { label: 'Về chúng tôi', to: PATHS.ABOUT },
  { label: 'Điều khoản sử dụng', to: PATHS.TERMS },
  { label: 'Chính sách bảo mật', to: PATHS.PRIVACY },
  { label: 'Liên hệ', to: PATHS.CONTACT },
];

/**
 * PublicFooter — footer cho landing page.
 */
export default function PublicFooter() {
  return (
    <footer style={{ backgroundColor: '#1F3933' }}>
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Link to={PATHS.HOME} className="flex items-center shrink-0">
            <span className="text-xl font-bold" style={{ color: '#A2EBD2' }}>
              TrekSphere
            </span>
          </Link>

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

          <p className="text-sm shrink-0" style={{ color: '#A2EBD2' }}>
            &copy; 2024 TrekSphere. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
