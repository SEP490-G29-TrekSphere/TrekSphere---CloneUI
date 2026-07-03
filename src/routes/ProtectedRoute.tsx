import { Navigate, useLocation } from 'react-router-dom';
import { PATHS } from '@/constants';
import { useAppStore } from '@/store/useAppStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Bọc các route cần đăng nhập.
 * - Chưa login → redirect về /login, lưu lại "from" để sau khi login có thể quay lại.
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const user = useAppStore((state) => state.user);
  const location = useLocation();

  // Cho phép truy cập khi có user trong store HOẶC vẫn còn accessToken trong localStorage
  // (trường hợp F5 trang khi đã login trước đó, store bị reset nhưng token còn).
  const hasToken =
    typeof window !== 'undefined' ? Boolean(localStorage.getItem('accessToken')) : false;

  if (!user && !hasToken) {
    return <Navigate to={PATHS.LOGIN} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
