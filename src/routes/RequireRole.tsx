import { Navigate, useLocation } from 'react-router-dom';
import { canAccessPath, PATHS, ROLES, type Role } from '@/constants';
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

  // Lấy danh sách vai trò của user (đã được chuẩn hóa về lowercase)
  const userRoles = (user.roles ?? []) as Role[];

  // Nếu user có ít nhất một role nằm trong allowedRoles → cho vào
  const hasAccess = userRoles.some((role) => allowedRoles.includes(role));

  // Ngoài ra, dùng ROLE_PROTECTED_ROUTES để fallback khi user vào sai khu vực
  const pathAllowed = userRoles.some((role) => canAccessPath(role, location.pathname));

  if (!hasAccess && !pathAllowed) {
    // Tìm trang mặc định phù hợp nhất với các role của user theo thứ tự ưu tiên:
    // admin -> vendor_manager -> vendor_staff -> trekker.
    let redirectPath: string = PATHS.LOGIN;
    if (userRoles.includes(ROLES.ADMIN)) {
      redirectPath = PATHS.ADMIN_ACCOUNTS;
    } else if (userRoles.includes(ROLES.VENDOR_MANAGER)) {
      redirectPath = '/vendor-manager';
    } else if (userRoles.includes(ROLES.VENDOR_STAFF)) {
      redirectPath = '/partner';
    } else if (userRoles.includes(ROLES.TREKKER)) {
      redirectPath = PATHS.DASHBOARD;
    }

    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
