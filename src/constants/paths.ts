/**
 * Centralized route paths.
 *
 * Mục đích:
 * - Tránh hard-code string '/login', '/dashboard' rải rác trong code.
 * - Khi đổi path chỉ cần sửa 1 chỗ.
 *
 * Quy ước:
 * - Tên hằng số: PATH_<TÊN_VIẾT_HOA>
 * - Giá trị: bắt đầu bằng '/' và không có trailing slash.
 */
export const PATHS = {
  // Auth
  VERIFY_EMAIL: '/verify',

  // Public
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  ABOUT: '/about',
  TERMS: '/terms',
  PRIVACY: '/privacy',
  CONTACT: '/contact',

  // Customer (đăng nhập mới thấy)
  DASHBOARD: '/dashboard',
  TOURS: '/tours',
  TOUR_DETAIL: '/tours/:id',
  MY_TOURS: '/my-tours',
  COMMUNITY: '/community',
  NEWS: '/news',
  NEWS_DETAIL: '/news/:blogId',
  NOTIFICATIONS: '/notifications',
  CHAT: '/chat',

  // Settings
  SETTINGS: '/settings',
  CHANGE_PASSWORD: '/settings/change-password',

  // Profile
  PROFILE: '/profile',
  EDIT_PROFILE: '/profile/edit',
} as const;

export type AppPath = (typeof PATHS)[keyof typeof PATHS];
