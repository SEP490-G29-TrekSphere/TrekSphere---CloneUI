import { Link } from 'react-router-dom';
import { PATHS } from '@/constants';
import { AppLogo } from '@/shared/ui';

const EXPLORE_LINKS = [
  { label: 'Trang chủ', to: PATHS.HOME },
  { label: 'Tour du lịch', to: PATHS.TOURS },
  { label: 'Cộng đồng', to: PATHS.COMMUNITY },
  { label: 'Tin tức', to: PATHS.NEWS },
];

const SUPPORT_LINKS = [
  { label: 'Về chúng tôi', to: PATHS.ABOUT },
  { label: 'Liên hệ', to: PATHS.CONTACT },
  { label: 'Điều khoản sử dụng', to: PATHS.TERMS },
  { label: 'Chính sách bảo mật', to: PATHS.PRIVACY },
];

const SOCIAL: Array<{ label: string; href: string; icon: React.ReactNode }> = [];

/**
 * PublicFooter — footer cho landing page. Multi-column v2.
 */
export default function PublicFooter() {
  return (
    <footer className="bg-primary">
      {/* Main grid */}
      <div className="mx-auto max-w-none w-full px-4 sm:px-6 pt-14 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Column 1: Brand */}
          <div className="lg:col-span-1">
            <AppLogo height={40} to={PATHS.HOME} tone="light" />
            <p className="mt-4 text-sm text-white/60 leading-relaxed max-w-xs">
              Trải nghiệm trekking chuyên nghiệp, an toàn và bền vững tại Việt Nam.
            </p>
            <div className="mt-6 flex items-center gap-2">
              {SOCIAL.map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/10 text-white/80 transition-all duration-200 shrink-0 hover:bg-white/20 hover:text-white hover:-translate-y-0.5"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Khám Phá */}
          <div>
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-5">
              Khám Phá
            </h3>
            <ul className="space-y-3">
              {EXPLORE_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Hỗ Trợ */}
          <div>
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-5">
              Hỗ Trợ
            </h3>
            <ul className="space-y-3">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Liên Hệ */}
          <div>
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-5">
              Liên Hệ
            </h3>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                  />
                </svg>
                <a href="mailto:hello@treksphere.vn" className="hover:text-white transition-colors">
                  hello@treksphere.vn
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider + bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} TrekSphere. Mọi quyền được bảo lưu.
          </p>
          <p className="text-xs text-white/40 flex items-center gap-1">
            Made with
            <svg
              className="w-3.5 h-3.5 text-red-400 inline-block"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5 2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.53L12 21.35z" />
            </svg>
            in Vietnam
          </p>
        </div>
      </div>
    </footer>
  );
}
