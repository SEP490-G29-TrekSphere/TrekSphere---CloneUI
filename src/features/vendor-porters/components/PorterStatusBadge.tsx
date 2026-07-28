import type { PorterStatus } from '../types';

interface PorterStatusBadgeProps {
  status: PorterStatus;
}

/** Badge trạng thái porter: dot + text — API chỉ có 2 trạng thái (ACTIVE/INACTIVE). */
export function PorterStatusBadge({ status }: PorterStatusBadgeProps) {
  const isActive = status === 'ACTIVE';
  const color = isActive ? '#16A34A' : '#6F7B75';
  const bgColor = isActive ? 'rgba(22, 163, 74, 0.1)' : 'rgba(111, 123, 117, 0.1)';
  const label = isActive ? 'Đang hoạt động' : 'Ngừng hoạt động';

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
