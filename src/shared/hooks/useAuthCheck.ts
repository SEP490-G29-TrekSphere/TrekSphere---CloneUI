import { useEffect } from 'react';
import { clearExpiredSession, getAccessToken, getRefreshToken } from '@/lib/session';
import { useAppStore } from '@/store/useAppStore';
import { isJwtExpired } from '@/utils/jwt';

interface AuthCheckResult {
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * Hook kiểm tra authentication state với proper hydration handling.
 * Dùng chung cho MỌI role (trekker, vendor_staff, vendor_manager, coordinator,
 * admin) qua `ProtectedRoute` và `RequireRole`.
 *
 * Race condition fix:
 * - Khi app mới mount, Zustand persist chưa hydrated ngay lập tức
 * - Nếu check `user` ngay, sẽ bị null và redirect sai
 * - Hook này đợi store hydrated xong trước khi check authentication
 *
 * Điều kiện "đã đăng nhập" (siết lại so với bản cũ `Boolean(user) || hasToken`):
 *   1. Có `user` trong store — cần cho `RequireRole` biết role nào.
 *   2. Có access token CÒN HẠN, hoặc có refresh token để xin token mới.
 *
 * Bản cũ dùng OR nên có 2 lỗ:
 *   - `user` còn trong localStorage nhưng token đã bị xoá (session mồ côi) →
 *     vẫn cho vào trang, mọi request sau đó 401 hàng loạt.
 *   - Token còn trong storage nhưng `exp` đã qua → vẫn coi là đăng nhập, user
 *     thấy layout/sidebar rồi mới bị đá ra khi request đầu tiên trả 401.
 */
export function useAuthCheck(): AuthCheckResult {
  const user = useAppStore((state) => state.user);
  const _hasHydrated = useAppStore((state) => state._hasHydrated);

  const accessToken = _hasHydrated ? getAccessToken() : null;
  const refreshToken = _hasHydrated ? getRefreshToken() : null;
  // Access token hết hạn nhưng còn refresh token → CHƯA phải mất phiên:
  // interceptor sẽ tự refresh ở request đầu tiên. Chỉ khi không còn đường cứu
  // mới coi là hết hạn.
  const hasUsableToken =
    (Boolean(accessToken) && !isJwtExpired(accessToken)) || Boolean(refreshToken);
  const isAuthenticated = _hasHydrated && Boolean(user) && hasUsableToken;

  // Phần "rác" còn sót lại của phiên cũ (user không token, hoặc token hết hạn
  // không refresh được) phải được dọn — nếu để nguyên, mỗi lần điều hướng lại
  // tính toán lại từ đầu và cache React Query của phiên trước vẫn hiển thị.
  const shouldClear = _hasHydrated && !hasUsableToken && Boolean(user || accessToken);
  useEffect(() => {
    // Không gọi trong thân render: `clearExpiredSession` set state của store.
    if (!shouldClear) return;
    clearExpiredSession(accessToken ? 'access-token-expired' : 'orphan-user');
  }, [shouldClear, accessToken]);

  if (!_hasHydrated) {
    return { isAuthenticated: false, isLoading: true };
  }

  return { isAuthenticated, isLoading: false };
}
