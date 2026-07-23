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

import { PATHS } from './paths';

/**
 * Routes dành riêng cho từng role.
 * Route nào có trong array này thì RequireRole sẽ cho phép.
 */
export const ROLE_PROTECTED_ROUTES: Record<Role, readonly string[]> = {
  [ROLES.GUEST]: [],
  [ROLES.TREKKER]: ['/dashboard', '/my-tours', '/blog'],
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

/**
 * Chuẩn hoá role string từ BE về lowercase để so khớp với `ROLES`.
 *
 * BE `POST /auth/login` trả `roles: ["ADMIN"]` — uppercase. `RequireRole`
 * và `ROLES` đều lowercase (`ROLES.ADMIN = 'admin'`), nên cần lowercase trước
 * khi so sánh.
 *
 * Trả về `[]` (không fallback) nếu không đọc được `roles` array — để caller
 * tự quyết định, tránh mask bug "BE thiếu role".
 */
export function extractRoles(input: unknown): string[] {
  if (!input || typeof input !== 'object') return [];

  const roles = (input as { roles?: unknown }).roles;
  if (!Array.isArray(roles)) return [];

  return roles
    .filter((r): r is string => typeof r === 'string' && r.trim().length > 0)
    .map((r) => r.trim().toLowerCase());
}

/**
 * Thứ tự ưu tiên role khi 1 user có nhiều role cùng lúc (vd: vừa là trekker
 * vừa được cấp thêm vendor_manager). Dùng chung cho `getPostLoginRoute` và
 * `RequireRole` để đảm bảo nhất quán — KHÔNG được suy ra role chính từ
 * `roles[0]` vì thứ tự mảng do BE trả về không đảm bảo.
 */
const ROLE_PRIORITY: readonly Role[] = [
  ROLES.ADMIN,
  ROLES.VENDOR_MANAGER,
  ROLES.VENDOR_STAFF,
  ROLES.TREKKER,
];

/**
 * Trả về role "chính" của user theo độ ưu tiên ở trên, bất kể thứ tự trong
 * mảng `roles` gốc. Trả `null` nếu không khớp role nào đã biết.
 */
export function getPrimaryRole(roles: string[] | undefined | null): Role | null {
  const set = new Set(roles ?? []);
  return ROLE_PRIORITY.find((role) => set.has(role)) ?? null;
}

/**
 * Trả về trang đích sau login dựa trên role của user.
 *
 * Ưu tiên theo thứ tự: admin → vendor_manager → vendor_staff → trekker.
 * Nếu không nhận diện được role nào, fallback về trang chủ.
 */
export function getPostLoginRoute(roles: string[]): string {
  switch (getPrimaryRole(roles)) {
    case ROLES.ADMIN:
      return PATHS.ADMIN_ACCOUNTS;
    case ROLES.VENDOR_MANAGER:
      return PATHS.VENDOR_MANAGER;
    case ROLES.VENDOR_STAFF:
      return '/partner';
    default:
      return PATHS.HOME;
  }
}
