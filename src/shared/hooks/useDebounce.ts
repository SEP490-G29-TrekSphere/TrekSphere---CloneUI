import { useEffect, useState } from 'react';

/**
 * Debounce má»™t giÃ¡ trá»‹ â€” chá»‰ update sau khi ngá»«ng thay Ä‘á»•i trong `delay` ms.
 *
 * Há»¯u Ã­ch cho search input, validation realtime, ...
 *
 * @example
 *   const debounced = useDebounce(searchTerm, 300);
 *   useEffect(() => fetchResults(debounced), [debounced]);
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
