import { queryClient } from '@/config/queryClient';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';
import { isJwtExpired } from '@/utils/jwt';
import { storage } from '@/utils/storage';

/**
 * Nguồn duy nhất quản lý "phiên đăng nhập" ở phía FE — dùng chung cho MỌI role
 * (trekker, vendor_staff, vendor_manager, coordinator, admin).
 *
 * Tách khỏi `apiClient` để tránh phụ thuộc vòng: `apiClient` cần dọn session,
 * còn `useAuthCheck` / `ChatWebSocketProvider` / `SessionExpiryWatcher` cần đọc
 * token + nghe sự kiện hết hạn mà không phải import cả axios instance.
 */

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export type SessionExpiryReason =
  /** Refresh token không còn hợp lệ (BE trả 401/403). */
  | 'refresh-failed'
  /** Bị 401 nhưng trong storage không có refresh token để cứu. */
  | 'refresh-token-missing'
  /** Access token trong storage đã hết hạn và không có refresh token. */
  | 'access-token-expired'
  /** Store còn `user` nhưng không còn token nào (session "mồ côi"). */
  | 'orphan-user';

export interface SessionExpiredDetail {
  reason: SessionExpiryReason;
}

const SESSION_EXPIRED_EVENT = 'treksphere:session-expired';

export const getAccessToken = (): string | null => storage.get<string>(ACCESS_TOKEN_KEY);
export const getRefreshToken = (): string | null => storage.get<string>(REFRESH_TOKEN_KEY);

/** Có access token và token đó chưa hết hạn. */
export const hasValidAccessToken = (): boolean => {
  const token = getAccessToken();
  return Boolean(token) && !isJwtExpired(token);
};

/**
 * Cờ idempotent cho 1 "đợt" hết hạn.
 *
 * Trước đây `clearExpiredSession` guard bằng `if (!accessToken) return;` để tránh
 * toast lặp khi nhiều request 401 cùng lúc. Hậu quả: request 401 thứ hai (token
 * đã bị xoá bởi request đầu) return sớm, nên `user` trong store và cache React
 * Query KHÔNG bao giờ được dọn nếu token đã mất trước đó — guard vẫn thấy `user`
 * nên cho vào trang, còn cache thì hiển thị dữ liệu phiên cũ.
 *
 * Giờ tách đôi: phần dọn dẹp luôn chạy, chỉ toast + phát event là idempotent.
 */
let sessionExpiring = false;

/** Đang trong đợt hết hạn (đã toast/điều hướng) hay chưa. */
export const isSessionExpiring = (): boolean => sessionExpiring;

/**
 * Mở lại "cửa" toast/điều hướng cho đợt hết hạn kế tiếp. Gọi khi bắt đầu phiên
 * mới (login) hoặc khi user chủ động logout.
 */
export const resetSessionExpiryFlag = (): void => {
  sessionExpiring = false;
};

/** Lưu token của phiên mới. Refresh token rỗng → xoá hẳn để không dùng lại token cũ. */
export const setSessionTokens = (accessToken: string, refreshToken?: string | null): void => {
  storage.set(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) {
    storage.set(REFRESH_TOKEN_KEY, refreshToken);
  } else {
    storage.remove(REFRESH_TOKEN_KEY);
  }
  resetSessionExpiryFlag();
};

/** Chỉ xoá token trong storage — KHÔNG chạm tới cờ hết hạn. */
export const clearSessionTokens = (): void => {
  storage.remove(ACCESS_TOKEN_KEY);
  storage.remove(REFRESH_TOKEN_KEY);
};

/**
 * Đăng ký listener cho sự kiện hết hạn phiên. Trả về hàm unsubscribe.
 *
 * Dùng `window` event thay vì import trực tiếp `navigate` vì `clearExpiredSession`
 * được gọi từ interceptor (ngoài React tree) — không thể gọi hook ở đó.
 */
export const onSessionExpired = (
  listener: (detail: SessionExpiredDetail) => void
): (() => void) => {
  if (typeof window === 'undefined') return () => {};

  const handler = (event: Event) => {
    listener((event as CustomEvent<SessionExpiredDetail>).detail);
  };
  window.addEventListener(SESSION_EXPIRED_EVENT, handler);
  return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handler);
};

/**
 * Dọn sạch phiên khi token hết hạn hẳn (không refresh được nữa).
 *
 * Luôn chạy đủ 3 việc, bất kể đã bị gọi bao nhiêu lần trong cùng 1 đợt:
 *   1. Xoá access + refresh token.
 *   2. Reset `useAppStore.user` — nếu còn `user`, guard coi như vẫn đăng nhập.
 *   3. `queryClient.clear()` — nếu không, trang đang mount vẫn vẽ dữ liệu cũ.
 *
 * Chỉ toast + phát event `session-expired` một lần cho mỗi đợt (cờ idempotent).
 */
export const clearExpiredSession = (reason: SessionExpiryReason): void => {
  const isFirstInBatch = !sessionExpiring;
  sessionExpiring = true;

  clearSessionTokens();
  useAppStore.getState().setUser(null);
  queryClient.clear();

  if (!isFirstInBatch) return;

  toast.warning('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.');
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent<SessionExpiredDetail>(SESSION_EXPIRED_EVENT, { detail: { reason } })
    );
  }
};
