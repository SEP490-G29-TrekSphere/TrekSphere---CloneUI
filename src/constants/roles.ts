/**
 * User roles trong hệ thống TrekSphere.
 *
 * 5 actor chính:
 * - GUEST       : duyệt tour không cần đăng nhập
 * - TREKKER     : đặt tour, review, group matchmaking, blog
 * - VENDOR_STAFF: nhà cung cấp - tạo tour, lịch khởi hành, voucher
 * - VENDOR_MANAGER: duyệt tour trước khi hiển thị cho trekker
 * - ADMIN       : quản lý toàn bộ platform
 *
 * Khi thêm role mới: thêm giá trị ở đây + tạo folder features/<role>/.
 */
export const ROLES = {
  GUEST: 'guest',
  TREKKER: 'trekker',
  VENDOR_STAFF: 'vendor_staff',
  VENDOR_MANAGER: 'vendor_manager',
  ADMIN: 'admin',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/**
 * Routes dành riêng cho từng role.
 * Route nào có trong array này thì RequireRole sẽ cho phép.
 */
export const ROLE_PROTECTED_ROUTES: Record<Role, readonly string[]> = {
  [ROLES.GUEST]: [],
  [ROLES.TREKKER]: ['/dashboard', '/my-tours', '/community'],
  [ROLES.VENDOR_STAFF]: ['/partner'],
  [ROLES.VENDOR_MANAGER]: ['/vendor-manager'],
  [ROLES.ADMIN]: ['/admin'],
};

/**
 * Helper: kiểm tra role có quyền truy cập path không.
 */
export function canAccessPath(role: Role | null, pathname: string): boolean {
  if (!role) return false;
  const allowedRoutes = ROLE_PROTECTED_ROUTES[role] ?? [];
  return allowedRoutes.some((route) => pathname.startsWith(route));
}
