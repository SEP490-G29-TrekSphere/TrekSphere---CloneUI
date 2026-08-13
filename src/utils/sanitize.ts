import DOMPurify from 'dompurify';

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
    const parsed = new URL(url, 'http://dummy.local');
    const allowedProtocols = ['http:', 'https:', 'data:'];
    return allowedProtocols.includes(parsed.protocol) ? url : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Sanitize HTML content to prevent XSS.
 * Removes dangerous tags like <script>, <iframe>, etc.
 */
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return '';
  return DOMPurify.sanitize(html);
}

/**
 * Extract plain text from HTML, stripping out all tags.
 * Safer than using RegExp /<[^>]+>/g which can be bypassed.
 */
export function stripHtml(html: string | null | undefined): string {
  if (!html) return '';
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: [] });
}
