/**
 * Helper utilities thuần (không phụ thuộc React).
 *
 * Format, convert, sanitize, slugify — những hàm dùng được ở mọi nơi.
 */

export function formatDate(date: Date | string | null | undefined, locale = 'vi-VN'): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(locale, { year: 'numeric', month: '2-digit', day: '2-digit' });
}

export function formatDateTime(date: Date | string | null | undefined, locale = 'vi-VN'): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * `Date` → chuỗi `yyyy-MM-dd` theo giờ địa phương.
 *
 * Không dùng `toISOString()` vì hàm đó quy về UTC — với GMT+7, ngày đã chọn
 * sẽ bị lùi 1 ngày ở mọi thời điểm trước 07:00.
 */
export function toIsoDate(date: Date | null | undefined): string {
  if (!date || Number.isNaN(date.getTime())) return '';
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * Chuỗi `yyyy-MM-dd` → `Date` lúc 00:00 giờ địa phương.
 *
 * `new Date('2026-08-06')` được JS hiểu là UTC nên cũng lệch múi giờ — vì vậy
 * phải tách thủ công từng thành phần. Trả `null` nếu chuỗi rỗng/không hợp lệ.
 */
export function parseIsoDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  const parsed = new Date(year, month - 1, day);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatCurrency(amount: number, currency = 'VND', locale = 'vi-VN'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export function truncate(text: string, max = 100, suffix = '…'): string {
  return text.length > max ? `${text.slice(0, max).trim()}${suffix}` : text;
}
