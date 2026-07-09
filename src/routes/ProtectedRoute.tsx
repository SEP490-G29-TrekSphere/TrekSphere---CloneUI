import { Navigate, useLocation } from 'react-router-dom';
import { PATHS } from '@/constants';
import { useAuthCheck } from '@/shared/hooks/useAuthCheck';
import { AppSpinner } from '@/shared/ui';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Bọc các route cần đăng nhập.
 * - Chưa login → redirect về /login, lưu lại "from" để sau khi login có thể quay lại.
 * - Đợi store hydrated xong trước khi check auth (tránh race condition khi F5).
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuthCheck();
  const location = useLocation();

  // Đang loading (store chưa hydrated) → hiển thị spinner, không redirect
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <AppSpinner size="lg" className="text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={PATHS.LOGIN} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
