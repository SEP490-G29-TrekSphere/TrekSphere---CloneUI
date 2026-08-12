import { useAppStore } from '@/store/useAppStore';
import { storage } from '@/utils/storage';

/**
 * Hook kiểm tra authentication state với proper hydration handling.
 *
 * Race condition fix:
 * - Khi app mới mount, Zustand persist chưa hydrated ngay lập tức
 * - Nếu check `user` ngay, sẽ bị null và redirect sai
 * - Hook này đợi store hydrated xong trước khi check authentication
 */
export function useAuthCheck() {
  const user = useAppStore((state) => state.user);
  const _hasHydrated = useAppStore((state) => state._hasHydrated);

  // Đợi store hydrated xong trước khi check
  // Nếu chưa hydrated, coi như đang loading (không redirect)
  if (!_hasHydrated) {
    return { isAuthenticated: false, isLoading: true };
  }

  // User và access token phải cùng tồn tại. Trước đây dùng phép OR khiến response
  // login chỉ có user (không có token) vẫn được coi là đã đăng nhập, rồi mọi API
  // phía sau đồng loạt trả 401.
  const hasToken = Boolean(storage.get<string>('accessToken'));
  const isAuthenticated = Boolean(user) && hasToken;

  return { isAuthenticated, isLoading: false };
}
