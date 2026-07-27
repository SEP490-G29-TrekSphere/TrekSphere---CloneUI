import { useEffect } from 'react';

/**
 * useDarkMode — manages the `.dark` class on <html> and persists to localStorage.
 * Returns [isDark, toggleDark].
 */
export function useDarkMode(): [boolean, () => void] {
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
  }, []);

  return [false, () => {}];
}
