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
  BOOK_TOUR: '/tours/:id/book',
  BOOKING_DETAIL: '/bookings/:bookingId',
  BOOKING_PAYMENT: '/bookings/:bookingId/payment',
  MY_TOURS: '/my-tours',
  GROUPS: '/groups',
  GROUPS_CREATE: '/groups/create',
  GROUPS_JOIN: '/groups/:groupId/join',
  GROUPS_DETAIL: '/groups/:groupId',
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

  // Trekker Community / Blog
  BLOG_LIST: '/blog',
  BLOG_CREATE: '/blog/create',
  BLOG_EDIT: '/blog/edit/:blogId',

  // Admin
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_ACCOUNTS: '/admin/accounts',
  ADMIN_ACCOUNT_DETAIL: '/admin/accounts/:id',
  ADMIN_TOURS: '/admin/tours',
  ADMIN_DATA: '/admin/data',
  ADMIN_APPLICATIONS: '/admin/applications',
  ADMIN_APPLICATION_DETAIL: '/admin/applications/:id',
  ADMIN_VOUCHERS: '/admin/vouchers',
  ADMIN_SETTINGS: '/admin/settings',
} as const;

export type AppPath = (typeof PATHS)[keyof typeof PATHS];

export const getBookTourPath = (id: string) => PATHS.BOOK_TOUR.replace(':id', id);
export const getBookingDetailPath = (bookingId: string) =>
  PATHS.BOOKING_DETAIL.replace(':bookingId', bookingId);
export const getBookingPaymentPath = (bookingId: string) =>
  PATHS.BOOKING_PAYMENT.replace(':bookingId', bookingId);
export const getGroupDetailPath = (groupId: string) =>
  PATHS.GROUPS_DETAIL.replace(':groupId', groupId);
export const getGroupJoinPath = (groupId: string) => PATHS.GROUPS_JOIN.replace(':groupId', groupId);
