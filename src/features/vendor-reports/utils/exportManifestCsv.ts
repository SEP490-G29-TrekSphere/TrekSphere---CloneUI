import type { ManifestPaymentStatus, ScheduleManifest } from '../types';

const PAYMENT_LABELS: Record<ManifestPaymentStatus, string> = {
  PAID: 'Đã thanh toán',
  PENDING: 'Chờ thanh toán',
  PARTIALLY_REFUNDED: 'Hoàn một phần',
  REFUNDED: 'Đã hoàn tiền',
};

const HEADERS = [
  'STT',
  'Mã đơn',
  'Họ và tên',
  'Số điện thoại',
  'Email',
  'Giới tính',
  'Ngày sinh',
  'Yêu cầu đặc biệt',
  'Trạng thái thanh toán',
];

const GENDER_LABELS: Record<string, string> = {
  MALE: 'Nam',
  FEMALE: 'Nữ',
  OTHER: 'Khác',
};

/** BOM UTF-8 — thiếu ký tự này Excel sẽ đọc sai tiếng Việt có dấu. */
const UTF8_BOM = '\uFEFF';

function formatGender(gender?: string): string {
  if (!gender) return '';
  return GENDER_LABELS[gender.toUpperCase()] ?? gender;
}

function formatDate(value?: string): string {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('vi-VN');
}

/**
 * Bọc một ô CSV: escape dấu nháy kép và luôn quote để dấu phẩy trong địa chỉ
 * hay yêu cầu đặc biệt không làm vỡ cột.
 */
function escapeCell(value: string | number | undefined): string {
  const text = value === undefined || value === null ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

/** Bỏ ký tự không hợp lệ trong tên file trên Windows/macOS. */
function safeFileName(input: string): string {
  return input
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, '-')
    .slice(0, 80);
}

/**
 * Tạo và tải file CSV danh sách hành khách ngay tại client (BE chưa có
 * endpoint export).
 */
export function exportManifestCsv(manifest: ScheduleManifest): void {
  const rows = manifest.passengers.map((passenger, index) =>
    [
      index + 1,
      passenger.bookingCode ?? '',
      passenger.fullName,
      passenger.phoneNumber ?? '',
      passenger.email ?? '',
      formatGender(passenger.gender),
      formatDate(passenger.dateOfBirth),
      passenger.specialRequirements ?? '',
      PAYMENT_LABELS[passenger.paymentStatus],
    ]
      .map(escapeCell)
      .join(',')
  );

  const csv = [HEADERS.map(escapeCell).join(','), ...rows].join('\r\n');
  const blob = new Blob([UTF8_BOM + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const departure = manifest.departureDate ? formatDate(manifest.departureDate) : '';
  const fileName = safeFileName(
    `danh-sach-khach-${manifest.tourName}${departure ? `-${departure}` : ''}`
  );

  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}.csv`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
