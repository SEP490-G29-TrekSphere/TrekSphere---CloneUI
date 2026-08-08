/**
 * Đọc payload của JWT ở phía FE.
 *
 * KHÔNG verify signature (đó là việc của BE) — chỉ decode phần payload để biết
 * token còn hạn hay không, nhằm:
 *   - Không coi user là "đã đăng nhập" chỉ vì trong localStorage còn 1 chuỗi
 *     token đã hết hạn (xem `useAuthCheck`).
 *   - Không mở WebSocket/gọi request chắc chắn bị 401.
 */

interface JwtPayload {
  exp?: number;
  iat?: number;
  sub?: string;
  [key: string]: unknown;
}

/**
 * Decode payload (phần giữa) của JWT. Trả `null` nếu token rỗng, không phải
 * JWT 3 phần, hoặc payload không parse được.
 */
export function decodeJwt(token: string | null | undefined): JwtPayload | null {
  if (!token) return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
    // base64url → base64 + pad cho đủ bội số của 4.
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    // `atob` trả chuỗi byte — cần decode lại UTF-8 để không vỡ ký tự tiếng Việt.
    const json = decodeURIComponent(
      Array.from(atob(padded))
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join('')
    );
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

/** Trừ trước vài giây để không dùng token sắp hết hạn ngay giữa lúc gửi request. */
const DEFAULT_LEEWAY_SECONDS = 5;

/**
 * Token đã hết hạn chưa?
 *
 * Trả `false` khi không đọc được `exp` (token opaque do BE tự sinh, hoặc payload
 * không có `exp`) — trong trường hợp đó để BE quyết định qua 401, tuyệt đối
 * không tự ý logout user.
 */
export function isJwtExpired(
  token: string | null | undefined,
  leewaySeconds = DEFAULT_LEEWAY_SECONDS
): boolean {
  const payload = decodeJwt(token);
  if (!payload || typeof payload.exp !== 'number') return false;
  return payload.exp * 1000 <= Date.now() + leewaySeconds * 1000;
}

/** Thời điểm hết hạn (ms epoch) của token, `null` nếu không đọc được. */
export function getJwtExpiryMs(token: string | null | undefined): number | null {
  const payload = decodeJwt(token);
  return typeof payload?.exp === 'number' ? payload.exp * 1000 : null;
}
