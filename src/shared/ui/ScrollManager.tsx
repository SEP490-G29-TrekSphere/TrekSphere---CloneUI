import { useScrollRestoration } from '@/shared/hooks/useScrollRestoration';

/**
 * Invisible component that manages scroll behaviour across route transitions.
 *
 * - Forward navigation (click a link) → scrolls to top.
 * - Back / forward button           → restores saved scroll position.
 *
 * Place once inside the Router context (e.g. at the top of `AppRoutes`).
 */
export function ScrollManager(): null {
  useScrollRestoration();
  return null;
}
