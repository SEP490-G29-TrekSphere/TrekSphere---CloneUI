import type { AccountStatus } from '../types';

interface StatusIndicatorProps {
  status: AccountStatus;
}

/** Nhãn ngắn gọn dùng cho badge trong bảng (khác với nhãn đầy đủ ở trang chi tiết). */
const STATUS_BADGE_CONFIG: Record<
  AccountStatus,
  { label: string; color: string; bgColor: string }
> = {
  ACTIVE: { label: 'Hoạt động', color: '#16A34A', bgColor: 'rgba(22, 163, 74, 0.1)' },
  LOCKED: { label: 'Bị khóa', color: '#DC2626', bgColor: 'rgba(220, 38, 38, 0.1)' },
  DEACTIVATED: { label: 'Bị khóa', color: '#DC2626', bgColor: 'rgba(220, 38, 38, 0.1)' },
};

/**
 * Hiển thị trạng thái tài khoản với dot indicator + text.
 * - ACTIVE: chấm xanh lá.
 * - DEACTIVATED: chấm đỏ — trạng thái admin khóa tài khoản (BE dùng giá trị này
 *   cho `PUT /users/{id}/status`, xem `adminAccountService.updateStatus`).
 * - LOCKED: chấm đỏ — chỉ còn ở dữ liệu cũ, BE chưa implement, hiển thị y hệt
 *   DEACTIVATED để admin không phải phân biệt 2 khái niệm giống nhau.
 */
export function StatusIndicator({ status }: StatusIndicatorProps) {
  const { label, color, bgColor } = STATUS_BADGE_CONFIG[status];

  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
      style={{ color, backgroundColor: bgColor }}
    >
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
