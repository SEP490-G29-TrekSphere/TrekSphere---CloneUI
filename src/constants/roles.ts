/**
 * User roles trong há»‡ thá»‘ng TrekSphere.
 *
 * 5 actor chÃ­nh:
 * - GUEST       : duyá»‡t tour khÃ´ng cáº§n Ä‘Äƒng nháº­p
 * - TREKKER     : Ä‘áº·t tour, review, group matchmaking, blog
 * - VENDOR_STAFF: nhÃ  cung cáº¥p - táº¡o tour, lá»‹ch khá»Ÿi hÃ nh, voucher
 * - VENDOR_MANAGER: duyá»‡t tour trÆ°á»›c khi hiá»ƒn thá»‹ cho trekker
 * - ADMIN       : quáº£n lÃ½ toÃ n bá»™ platform
 *
 * Khi thÃªm role má»›i: thÃªm giÃ¡ trá»‹ á»Ÿ Ä‘Ã¢y + táº¡o folder features/<role>/.
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
 * Routes dÃ nh riÃªng cho tá»«ng role.
 * Route nÃ o cÃ³ trong array nÃ y thÃ¬ RequireRole sáº½ cho phÃ©p.
 */
export const ROLE_PROTECTED_ROUTES: Record<Role, readonly string[]> = {
  [ROLES.GUEST]: [],
  [ROLES.TREKKER]: ['/dashboard', '/my-tours', '/community'],
  [ROLES.VENDOR_STAFF]: ['/partner'],
  [ROLES.VENDOR_MANAGER]: ['/vendor-manager'],
  [ROLES.ADMIN]: ['/admin'],
};

/**
 * Helper: kiá»ƒm tra role cÃ³ quyá»n truy cáº­p path khÃ´ng.
 */
export function canAccessPath(role: Role | null, pathname: string): boolean {
  if (!role) return false;
  const allowedRoutes = ROLE_PROTECTED_ROUTES[role] ?? [];
  return allowedRoutes.some((route) => pathname.startsWith(route));
}
