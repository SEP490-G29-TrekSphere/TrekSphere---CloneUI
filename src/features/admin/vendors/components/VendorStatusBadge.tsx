import type { VendorStatus } from '../types';

interface VendorStatusBadgeProps {
  status: VendorStatus;
}

const STATUS_BADGE_CONFIG: Record<VendorStatus, { label: string; color: string; bgColor: string }> =
  {
    ACTIVE: { label: 'Đang hoạt động', color: '#16A34A', bgColor: 'rgba(22, 163, 74, 0.1)' },
    INACTIVE: { label: 'Ngừng hoạt động', color: '#6F7B75', bgColor: 'rgba(111, 123, 117, 0.12)' },
    REVOKED: { label: 'Đã thu hồi', color: '#DC2626', bgColor: 'rgba(220, 38, 38, 0.1)' },
  };

/** Hiển thị trạng thái Vendor với dot indicator + text, giống pattern StatusIndicator của accounts. */
export function VendorStatusBadge({ status }: VendorStatusBadgeProps) {
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
