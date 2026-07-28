/**
 * Chỉ cho phép URL http(s), data: hoặc blob: khi gán vào các sink hiển thị ảnh
 * (img src, background-image, ...) — chặn các scheme nguy hiểm như javascript:
 * để tránh DOM-based XSS khi URL đến từ dữ liệu do người dùng cung cấp
 * (API response, upload, v.v.).
 */
export function getSafeImageUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('blob:')) return url;
  try {
    const parsed = new URL(url, window.location.origin);
    const allowedProtocols = ['http:', 'https:', 'data:'];
    return allowedProtocols.includes(parsed.protocol) ? url : undefined;
  } catch {
    return undefined;
  }
}
