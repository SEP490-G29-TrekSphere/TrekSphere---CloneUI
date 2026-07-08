import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const STORAGE_KEY_PREFIX = 'scroll_';

/**
 * Read a saved scroll position for a given location key.
 */
const MAX_KEYS = 30;

/**
 * Read a saved scroll position for a given location key.
 */
function getSavedPosition(key: string): number {
  try {
    const raw = sessionStorage.getItem(`${STORAGE_KEY_PREFIX}${key}`);
    return raw ? Number(raw) : 0;
  } catch {
    return 0;
  }
}

/**
 * Persist the current scroll position for a given location key.
 */
function savePosition(key: string, y: number, keys: string[], cache: Record<string, number>): void {
  try {
    sessionStorage.setItem(`${STORAGE_KEY_PREFIX}${key}`, String(Math.round(y)));
    cache[key] = y;

    const idx = keys.indexOf(key);
    if (idx > -1) {
      keys.splice(idx, 1);
    }
    keys.push(key);

    if (keys.length > MAX_KEYS) {
      const oldest = keys.shift();
      if (oldest) {
        sessionStorage.removeItem(`${STORAGE_KEY_PREFIX}${oldest}`);
        delete cache[oldest];
      }
    }
    sessionStorage.setItem(`${STORAGE_KEY_PREFIX}_keys`, JSON.stringify(keys));
  } catch {
    // sessionStorage full or unavailable — silently ignore
  }
}

/**
 * Scroll-restoration hook for client-side routing.
 *
 * Captures scroll positions in real-time on window scroll to prevent loss
 * during React Suspense unmount / page height collapses.
 *
 * Behaviour:
 * - **PUSH/REPLACE** (forward navigation): scrolls to the top of the page.
 * - **POP**  (back / forward button): restores the scroll position that
 *   was saved when the user originally left the page.
 */
export function useScrollRestoration(): void {
  const location = useLocation();
  const navigationType = useNavigationType();
  const prevKeyRef = useRef<string>(location.key);
  const keysRef = useRef<string[]>([]);

  // Load keys list from sessionStorage on mount
  useEffect(() => {
    try {
      const rawKeys = sessionStorage.getItem(`${STORAGE_KEY_PREFIX}_keys`);
      if (rawKeys) {
        keysRef.current = JSON.parse(rawKeys);
      }
    } catch {}
  }, []);

  // In-memory cache of scroll positions for the current session
  const scrollCache = useRef<Record<string, number>>({});

  // 1. Disable browser's native scroll restoration so it doesn't race
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // 2. Listen to scroll events to capture scroll position in real-time.
  // This is critical because when navigation happens, the page might collapse
  // to a spinner (Suspense) before useEffect runs, resetting scrollY to 0.
  useEffect(() => {
    const handleScroll = () => {
      scrollCache.current[location.key] = window.scrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location.key]);

  // 3. Handle navigation scroll positioning
  useEffect(() => {
    // Save the last known position of the page we are leaving to sessionStorage
    const prevKey = prevKeyRef.current;
    const lastY = scrollCache.current[prevKey];
    if (lastY !== undefined) {
      savePosition(prevKey, lastY, keysRef.current, scrollCache.current);
    }

    let rafId: number;

    if (navigationType === 'POP') {
      // Back/forward navigation — restore saved position
      const savedY = getSavedPosition(location.key);
      scrollCache.current[location.key] = savedY;

      // Restore position across multiple animation frames to ensure layout changes / DOM updates don't reset it
      let count = 0;
      const restore = () => {
        window.scrollTo(0, savedY);
        count++;
        if (count < 5) {
          rafId = requestAnimationFrame(restore);
        }
      };
      rafId = requestAnimationFrame(restore);
    } else {
      // Forward navigation (PUSH/REPLACE) — always start at the top
      window.scrollTo(0, 0);
      scrollCache.current[location.key] = 0;
    }

    // Track the current key so the next navigation can save it
    prevKeyRef.current = location.key;

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [location.key, navigationType]);

  // 4. Save scroll position on page unload/refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      const currentY = scrollCache.current[location.key] ?? window.scrollY;
      savePosition(location.key, currentY, keysRef.current, scrollCache.current);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [location.key]);
}
