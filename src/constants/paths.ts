/**
 * Centralized route paths.
 *
 * Má»¥c Ä‘Ã­ch:
 * - TrÃ¡nh hard-code string '/login', '/dashboard' ráº£i rÃ¡c trong code.
 * - Khi Ä‘á»•i path chá»‰ cáº§n sá»­a 1 chá»—.
 *
 * Quy Æ°á»›c:
 * - TÃªn háº±ng sá»‘: PATH_<TÃŠN_VIáº¾T_HOA>
 * - GiÃ¡ trá»‹: báº¯t Ä‘áº§u báº±ng '/' vÃ  khÃ´ng cÃ³ trailing slash.
 */
export const PATHS = {
  // Public
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  ABOUT: '/about',
  TERMS: '/terms',
  PRIVACY: '/privacy',
  CONTACT: '/contact',

  // Customer (Ä‘Äƒng nháº­p má»›i tháº¥y)
  DASHBOARD: '/dashboard',
  TOURS: '/tours',
  MY_TOURS: '/my-tours',
  COMMUNITY: '/community',
  NEWS: '/news',
} as const;

export type AppPath = (typeof PATHS)[keyof typeof PATHS];
