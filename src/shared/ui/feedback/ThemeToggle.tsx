import { MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from '@/shared/hooks';

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  const toggle = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={resolvedTheme === 'dark'}
      aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={toggle}
      className={className}
    >
      {resolvedTheme === 'dark' ? <SunIcon className="size-5" /> : <MoonIcon className="size-5" />}
    </button>
  );
}
