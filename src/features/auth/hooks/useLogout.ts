import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { queryClient } from '@/config/queryClient';
import { PATHS } from '@/constants';
import { authService } from '@/features/auth';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';
import { storage } from '@/utils/storage';

interface UseLogoutOptions {
  /**
   * Đường dẫn redirect sau khi logout xong. Mặc định `/login` (hợp lý cho mọi
   * trang đăng nhập yêu cầu auth, bao gồm admin).
   */
  redirectTo?: string;
  /**
   * Có gọi `authService.logout()` (BE `/auth/logout`) hay không. Mặc định
   * `true`. Set `false` nếu chỉ muốn clear local (vd: session timeout tự dọn).
   */
  callApi?: boolean;
}

interface UseLogoutReturn {
  logout: () => Promise<void>;
  isLoggingOut: boolean;
}

/**
 * Hook dùng chung cho flow logout.
 *
 * Flow chuẩn (match với `Header.tsx` / `PublicHeader.tsx` đã có):
 *   1. Gọi `POST /auth/logout` (optional, mặc định bật).
 *   2. Xoá `accessToken` / `refreshToken` trong storage.
 *   3. Reset `useAppStore.user` → null.
 *   4. Xoá TOÀN BỘ cache React Query (`queryClient.clear()`).
 *   5. Toast thông báo.
 *   6. Navigate về `redirectTo` (mặc định `/login`).
 *
 * Bước 4 phải xoá sạch cache (không chỉ riêng `profile`) vì `staleTime` mặc
 * định của `queryClient` là 5 phút — nếu đăng nhập lại (kể cả tài khoản khác)
 * trong 5 phút đó mà không reload trang, các query key không gắn theo
 * user/vendor (vd danh sách tour) sẽ trả thẳng dữ liệu cache của phiên trước
 * thay vì gọi lại API, khiến user thấy dữ liệu sai/thiếu cho tới khi F5.
 *
 * Lưu ý: bước 1 chỉ để BE invalidate refresh token. Ngay cả khi BE fail (5xx,
 * network) vẫn nên tiếp tục clear local state — user đã yêu cầu logout, để họ
 * kẹt lại ở màn admin là UX tệ.
 */
export function useLogout(options: UseLogoutOptions = {}): UseLogoutReturn {
  const { redirectTo = PATHS.LOGIN, callApi = true } = options;
  const navigate = useNavigate();
  const setUser = useAppStore((state) => state.setUser);

  const logout = useCallback(async () => {
    try {
      if (callApi) {
        // Không await chặt — best effort. Lỗi BE không nên block logout.
        await authService.logout();
      }
    } catch (err) {
      console.warn('[useLogout] authService.logout failed (continuing anyway):', err);
    }

    // Dọn local state dù BE có fail.
    storage.remove('accessToken');
    storage.remove('refreshToken');
    setUser(null);
    queryClient.clear();
    toast.success('Đã đăng xuất.');
    navigate(redirectTo);
  }, [callApi, navigate, redirectTo, setUser]);

  // Chưa cần `isLoggingOut` ngay — trả về `false` để giữ API stable cho
  // component nào sau này muốn disable nút trong lúc đang gọi.
  return { logout, isLoggingOut: false };
}
