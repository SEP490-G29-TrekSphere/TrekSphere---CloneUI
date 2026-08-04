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
  MY_VENDOR_APPLICATIONS: '/my-vendor-applications',
  GROUPS: '/groups',
  GROUPS_CREATE: '/groups/create',
  GROUPS_JOIN: '/groups/:groupId/join',
  GROUPS_DETAIL: '/groups/:groupId',
  COMMUNITY: '/groups',
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

  // Trekker portal
  TREKKER: '/trekker',
  TREKKER_PROFILE: '/trekker/profile',
  TREKKER_PROFILE_EDIT: '/trekker/profile/edit',
  TREKKER_MY_TOURS: '/trekker/my-tours',
  TREKKER_VENDOR_APPLICATIONS: '/trekker/vendor-applications',
  TREKKER_BLOG_LIST: '/trekker/blog',
  TREKKER_BLOG_CREATE: '/trekker/blog/create',
  TREKKER_BLOG_EDIT: '/trekker/blog/edit/:blogId',
  TREKKER_CHANGE_PASSWORD: '/trekker/change-password',
  TREKKER_BOOKING_DETAIL: '/trekker/bookings/:bookingId',
  TREKKER_BOOKING_PAYMENT: '/trekker/bookings/:bookingId/payment',
  TREKKER_BOOK_TOUR: '/tours/:id/book',
  TREKKER_CHAT: '/trekker/chat',

  // Admin
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_ACCOUNTS: '/admin/accounts',
  ADMIN_ACCOUNT_DETAIL: '/admin/accounts/:id',
  ADMIN_VENDORS: '/admin/vendors',
  ADMIN_TOURS: '/admin/tours',
  ADMIN_DATA: '/admin/data',
  ADMIN_APPLICATIONS: '/admin/applications',
  ADMIN_APPLICATION_DETAIL: '/admin/applications/:id',
  ADMIN_REPORTS: '/admin/reports',
  ADMIN_REPORT_DETAIL: '/admin/reports/:id',
  ADMIN_VOUCHERS: '/admin/vouchers',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_EMERGENCY: '/admin/emergency',
  ADMIN_CHAT: '/admin/chat',

  // Vendor Manager (TrekManager portal)
  VENDOR_MANAGER: '/vendor-manager',
  VENDOR_MANAGER_PROFILE: '/vendor-manager/profile',
  VENDOR_MANAGER_PROFILE_EDIT: '/vendor-manager/profile/edit',
  VENDOR_MANAGER_STAFF: '/vendor-manager/staff',
  VENDOR_MANAGER_TOURS: '/vendor-manager/tours',
  VENDOR_MANAGER_TOUR_CREATE: '/vendor-manager/tours/new',
  VENDOR_MANAGER_TOUR_EDIT: '/vendor-manager/tours/:id/edit',
  VENDOR_MANAGER_TOUR_APPROVALS: '/vendor-manager/tours/approvals',
  VENDOR_MANAGER_TOUR_SCHEDULES: '/vendor-manager/tours/:id/schedules',
  VENDOR_MANAGER_BOOKINGS: '/vendor-manager/bookings',
  VENDOR_MANAGER_EQUIPMENT: '/vendor-manager/equipment',
  VENDOR_MANAGER_PORTERS: '/vendor-manager/porters',
  VENDOR_MANAGER_PORTER_CREATE: '/vendor-manager/porters/new',
  VENDOR_MANAGER_PORTER_EDIT: '/vendor-manager/porters/:id/edit',
  VENDOR_MANAGER_SESSIONS: '/vendor-manager/sessions',
  VENDOR_MANAGER_SESSION_DETAIL: '/vendor-manager/sessions/:sessionId',
  VENDOR_MANAGER_EMERGENCY: '/vendor-manager/emergency',
  VENDOR_MANAGER_VOUCHERS: '/vendor-manager/vouchers',
  VENDOR_MANAGER_CHAT: '/vendor-manager/chat',

  // Vendor Staff (TrekPartner portal)
  PARTNER: '/partner',
  PARTNER_PROFILE: '/partner/profile',
  PARTNER_TOURS: '/partner/tours',
  PARTNER_TOUR_CREATE: '/partner/tours/new',
  PARTNER_TOUR_EDIT: '/partner/tours/:id/edit',
  PARTNER_TOUR_SCHEDULES: '/partner/tours/:id/schedules',
  PARTNER_BOOKINGS: '/partner/bookings',
  PARTNER_EQUIPMENT: '/partner/equipment',
  PARTNER_PORTERS: '/partner/porters',
  PARTNER_PORTER_CREATE: '/partner/porters/new',
  PARTNER_PORTER_EDIT: '/partner/porters/:id/edit',
  PARTNER_SESSIONS: '/partner/sessions',
  PARTNER_SESSION_DETAIL: '/partner/sessions/:sessionId',
  PARTNER_BLOG_CREATE: '/partner/blog/create',
  PARTNER_VOUCHERS: '/partner/vouchers',
  PARTNER_CHAT: '/partner/chat',

  // Admin — Blog moderation
  ADMIN_BLOGS: '/admin/blogs',

  // Coordinator
  COORDINATOR: '/coordinator',
  COORDINATOR_SCHEDULES: '/coordinator/schedules',
  COORDINATOR_SESSION_OPERATIONS: '/coordinator/sessions/:sessionId',
  COORDINATOR_CHAT: '/coordinator/chat',
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
export const getVendorManagerTourEditPath = (id: string) =>
  PATHS.VENDOR_MANAGER_TOUR_EDIT.replace(':id', id);
export const getPartnerTourEditPath = (id: string) => PATHS.PARTNER_TOUR_EDIT.replace(':id', id);
export const getVendorManagerTourSchedulesPath = (id: string) =>
  PATHS.VENDOR_MANAGER_TOUR_SCHEDULES.replace(':id', id);
export const getPartnerTourSchedulesPath = (id: string) =>
  PATHS.PARTNER_TOUR_SCHEDULES.replace(':id', id);
export const getNewsDetailPath = (blogId: string) => PATHS.NEWS_DETAIL.replace(':blogId', blogId);
export const getVendorManagerSessionDetailPath = (sessionId: string) =>
  PATHS.VENDOR_MANAGER_SESSION_DETAIL.replace(':sessionId', sessionId);
export const getPartnerSessionDetailPath = (sessionId: string) =>
  PATHS.PARTNER_SESSION_DETAIL.replace(':sessionId', sessionId);
export const getCoordinatorSessionOperationsPath = (sessionId: string) =>
  PATHS.COORDINATOR_SESSION_OPERATIONS.replace(':sessionId', sessionId);
export const getTrekkerBookingDetailPath = (bookingId: string) =>
  PATHS.TREKKER_BOOKING_DETAIL.replace(':bookingId', bookingId);
export const getTrekkerBookingPaymentPath = (bookingId: string) =>
  PATHS.TREKKER_BOOKING_PAYMENT.replace(':bookingId', bookingId);
