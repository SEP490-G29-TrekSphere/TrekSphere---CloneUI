import { PATHS } from '@/constants';
import { AppLogo } from '@/shared/ui';

export default function PublicFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex flex-col sm:flex-row min-h-16 max-w-none w-full items-center justify-center gap-4 px-4 sm:px-6 py-4 sm:py-0">
        <AppLogo height={32} to={PATHS.HOME} />
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} TrekSphere. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
