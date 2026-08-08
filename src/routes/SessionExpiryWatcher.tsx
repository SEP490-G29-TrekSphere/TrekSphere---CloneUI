import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PATHS } from '@/constants';
import { onSessionExpired } from '@/lib/session';

/**
 * Các khu vực bắt buộc đăng nhập — dùng chung cho TẤT CẢ role, không riêng
 * trekker. Khi phiên hết hạn lúc user đang ở một trong các prefix này thì phải
 * đá về `/login`; còn nếu họ đang ở trang public (`/`, `/tours`, `/news`, ...)
 * thì chỉ cần toast, không cắt ngang trải nghiệm duyệt trang.
 */
const AUTH_REQUIRED_PREFIXES: readonly string[] = [
  PATHS.TREKKER, // /trekker      — Trekker portal
  PATHS.ADMIN, // /admin        — Admin
  PATHS.VENDOR_MANAGER, // /vendor-manager — Vendor manager
  PATHS.PARTNER, // /partner      — Vendor staff
  PATHS.COORDINATOR, // /coordinator  — Coordinator
  PATHS.DASHBOARD,
  PATHS.PROFILE,
  PATHS.MY_TOURS,
  PATHS.MY_VENDOR_APPLICATIONS,
  PATHS.SETTINGS,
  PATHS.NOTIFICATIONS,
  PATHS.CHAT,
  '/bookings',
  '/blog',
];

const requiresAuth = (pathname: string): boolean =>
  AUTH_REQUIRED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

/**
 * Lắng nghe sự kiện hết hạn phiên phát ra từ `clearExpiredSession` (được gọi
 * trong axios interceptor — nơi không dùng được hook) và điều hướng về `/login`.
 *
 * Vì sao cần component này: trước đây interceptor chỉ xoá token + toast. Trang
 * đang mở vẫn đứng nguyên (đã render xong), user tiếp tục bấm được các nút chỉ
 * để nhận thêm 401 — chỉ khi nào họ tự F5 hoặc đổi route mới bị guard đá ra.
 *
 * `state.from` được giữ lại để sau khi đăng nhập lại có thể quay về đúng chỗ.
 */
export default function SessionExpiryWatcher() {
  const navigate = useNavigate();
  const location = useLocation();

  // Listener chỉ đăng ký 1 lần; đọc location qua ref để luôn lấy giá trị mới
  // nhất mà không phải gỡ/gắn lại listener mỗi lần đổi route.
  const locationRef = useRef(location);
  locationRef.current = location;

  useEffect(
    () =>
      onSessionExpired(() => {
        const current = locationRef.current;
        if (current.pathname === PATHS.LOGIN) return;
        if (!requiresAuth(current.pathname)) return;

        navigate(PATHS.LOGIN, { state: { from: current }, replace: true });
      }),
    [navigate]
  );

  return null;
}
