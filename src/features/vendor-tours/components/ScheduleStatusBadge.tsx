import type { ApiScheduleStatus } from '../types';

const STATUS_STYLES: Record<ApiScheduleStatus, { label: string; color: string }> = {
  OPEN: { label: 'Đang mở', color: '#16A34A' },
  CLOSED: { label: 'Đã đóng', color: '#6F7B75' },
  CANCELLED: { label: 'Đã hủy', color: '#DC2626' },
  COMPLETED: { label: 'Đã hoàn thành', color: '#2563EB' },
};

interface ScheduleStatusBadgeProps {
  status: ApiScheduleStatus;
}

export function ScheduleStatusBadge({ status }: ScheduleStatusBadgeProps) {
  const style = STATUS_STYLES[status];

  return (
    <span
      className="inline-flex items-center gap-1.5 text-sm font-semibold"
      style={{ color: style.color }}
    >
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: style.color }} />
      {style.label}
    </span>
  );
}
