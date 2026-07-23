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

  // Vendor Manager (TrekManager portal)
  VENDOR_MANAGER: '/vendor-manager',
  VENDOR_MANAGER_STAFF: '/vendor-manager/staff',
  VENDOR_MANAGER_TOURS: '/vendor-manager/tours',
  VENDOR_MANAGER_TOUR_CREATE: '/vendor-manager/tours/new',
  VENDOR_MANAGER_TOUR_EDIT: '/vendor-manager/tours/:id/edit',

  // Vendor Staff (TrekPartner portal)
  PARTNER: '/partner',
  PARTNER_TOURS: '/partner/tours',
  PARTNER_TOUR_CREATE: '/partner/tours/new',
  PARTNER_TOUR_EDIT: '/partner/tours/:id/edit',
} as const;

export type AppPath = (typeof PATHS)[keyof typeof PATHS];

export const getBookTourPath = (id: string) => PATHS.BOOK_TOUR.replace(':id', id);
export const getBookingDetailPath = (bookingId: string) =>
  PATHS.BOOKING_DETAIL.replace(':bookingId', bookingId);
export const getBookingPaymentPath = (bookingId: string) =>
  PATHS.BOOKING_PAYMENT.replace(':bookingId', bookingId);
export const getVendorManagerTourEditPath = (id: string) =>
  PATHS.VENDOR_MANAGER_TOUR_EDIT.replace(':id', id);
export const getPartnerTourEditPath = (id: string) => PATHS.PARTNER_TOUR_EDIT.replace(':id', id);
