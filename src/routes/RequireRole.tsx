import { Navigate, useLocation } from 'react-router-dom';
import { canAccessPath, PATHS, ROLES, type Role } from '@/constants';
import { getPrimaryRole } from '@/constants/roles';
import { useAuthCheck } from '@/shared/hooks/useAuthCheck';
import { AppSpinner } from '@/shared/ui';
import { useAppStore } from '@/store/useAppStore';

interface RequireRoleProps {
  children: React.ReactNode;
  /**
   * Danh sách role được phép truy cập.
   * Mặc định: `[ROLES.ADMIN]` — dùng cho khu vực admin.
   */
  allowedRoles?: Role[];
}

/**
 * Bọc các route yêu cầu role cụ thể.
 * - Chưa login → redirect về /login, lưu lại "from" để sau khi login có thể quay lại.
 * - Đợi store hydrated xong trước khi check auth (tránh race condition khi F5).
 * - Có login nhưng role không thuộc `allowedRoles` → redirect về trang phù hợp với role.
 */
export default function RequireRole({ children, allowedRoles = [ROLES.ADMIN] }: RequireRoleProps) {
  const { isAuthenticated, isLoading } = useAuthCheck();
  const location = useLocation();
  const user = useAppStore((state) => state.user);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <AppSpinner size="lg" className="text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={PATHS.LOGIN} state={{ from: location }} replace />;
  }

  // Role "chính" theo độ ưu tiên (admin > vendor_manager > vendor_staff >
  // trekker) — KHÔNG dùng roles[0] vì thứ tự mảng từ BE không đảm bảo (vd:
  // user vốn là trekker được cấp thêm vendor_manager thì role mới có thể
  // nằm cuối mảng).
  const primaryRole = getPrimaryRole(user.roles);

  // Nếu user có role nằm trong allowedRoles → cho vào
  const hasAccess = primaryRole !== null && allowedRoles.includes(primaryRole);

  // Ngoài ra, dùng ROLE_PROTECTED_ROUTES để fallback khi user vào sai khu vực
  // (vd: trekker gõ /admin/accounts → redirect về /dashboard).
  const pathAllowed = primaryRole !== null && canAccessPath(primaryRole, location.pathname);

  if (!hasAccess && !pathAllowed) {
    // Tìm trang mặc định phù hợp với role của user
    const redirectPath =
      primaryRole === ROLES.TREKKER
        ? PATHS.DASHBOARD
        : primaryRole === ROLES.VENDOR_STAFF
          ? '/partner'
          : primaryRole === ROLES.VENDOR_MANAGER
            ? '/vendor-manager'
            : PATHS.LOGIN;

    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
