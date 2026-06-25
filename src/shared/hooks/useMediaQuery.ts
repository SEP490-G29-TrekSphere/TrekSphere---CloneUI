import { useEffect, useState } from 'react';

/**
 * Theo dõi kích thước viewport, trả về boolean có khớp với media query không.
 *
 * @example
 *   const isMobile = useMediaQuery('(max-width: 768px)');
 */
export function useMediaQuery(query: string): boolean {
  const getMatch = () => (typeof window !== 'undefined' ? window.matchMedia(query).matches : false);
  const [matches, setMatches] = useState<boolean>(getMatch);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener('change', handler);
    setMatches(mql.matches);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}
