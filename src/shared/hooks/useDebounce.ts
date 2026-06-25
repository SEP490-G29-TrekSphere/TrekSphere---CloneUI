import { useEffect, useState } from 'react';

/**
 * Debounce một giá trị — chỉ update sau khi ngừng thay đổi trong `delay` ms.
 *
 * Hữu ích cho search input, validation realtime, ...
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
