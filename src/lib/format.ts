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
