import { Link } from 'react-router-dom';
import { PATHS } from '@/constants';
import { AppLogo } from '@/shared/ui';

const FOOTER_LINKS = [
  { label: 'Vá» chÃºng tÃ´i', to: PATHS.ABOUT },
  { label: 'Äiá»u khoáº£n sá»­ dá»¥ng', to: PATHS.TERMS },
  { label: 'ChÃ­nh sÃ¡ch báº£o máº­t', to: PATHS.PRIVACY },
  { label: 'LiÃªn há»‡', to: PATHS.CONTACT },
];

/**
 * PublicFooter â€” footer cho landing page.
 */
export default function PublicFooter() {
  return (
    <footer className="bg-primary">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <AppLogo height={40} to={PATHS.HOME} tone="light" />

          <nav className="flex flex-wrap items-center justify-center gap-6">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm transition-opacity hover:opacity-80 text-secondary"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <p className="text-sm shrink-0 text-secondary">
            &copy; 2024 TrekSphere. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
