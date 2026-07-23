import type { ApiStatus } from '../types';

const STATUS_STYLES: Record<ApiStatus, { label: string; color: string }> = {
  APPROVED: { label: 'Đã duyệt', color: '#16A34A' },
  PENDING_APPROVAL: { label: 'Đang chờ duyệt', color: '#EA580C' },
  DRAFT: { label: 'Bản nháp', color: '#6F7B75' },
  REJECTED: { label: 'Bị từ chối', color: '#DC2626' },
  HIDDEN: { label: 'Đã ẩn', color: '#6F7B75' },
};

interface TourStatusBadgeProps {
  status: ApiStatus;
}

export function TourStatusBadge({ status }: TourStatusBadgeProps) {
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
