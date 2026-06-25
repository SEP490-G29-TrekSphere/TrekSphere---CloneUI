/**
 * User roles trong hệ thống TrekSphere.
 *
 * Mỗi role sẽ có một nhóm features riêng trong src/features/<role>/.
 * Khi thêm role mới, thêm giá trị ở đây + tạo folder features/<role>/.
 */
export const ROLES = {
  GUEST: 'guest',
  CUSTOMER: 'customer',
  TOUR_GUIDE: 'tour_guide',
  PARTNER: 'partner',
  STAFF: 'staff',
  ADMIN: 'admin',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/**
 * Routes dành riêng cho từng role.
 * Route nào có trong array này thì RequireRole sẽ cho phép.
 */
export const ROLE_PROTECTED_ROUTES: Record<Role, readonly string[]> = {
  [ROLES.GUEST]: [],
  [ROLES.CUSTOMER]: ['/dashboard', '/my-tours', '/community'],
  [ROLES.TOUR_GUIDE]: ['/guide'],
  [ROLES.PARTNER]: ['/partner'],
  [ROLES.STAFF]: ['/staff'],
  [ROLES.ADMIN]: ['/admin', '/dashboard'],
};

/**
 * Helper: kiểm tra role có quyền truy cập path không.
 */
export function canAccessPath(role: Role | null, pathname: string): boolean {
  if (!role) return false;
  const allowedRoutes = ROLE_PROTECTED_ROUTES[role] ?? [];
  return allowedRoutes.some((route) => pathname.startsWith(route));
}
