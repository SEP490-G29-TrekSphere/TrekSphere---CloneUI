import type { SessionStatus } from '../types';

const STATUS_STYLES: Record<SessionStatus, { label: string; color: string }> = {
  PENDING: { label: 'Chờ khởi hành', color: '#16A34A' },
  IN_PROGRESS: { label: 'Đang diễn ra', color: '#CA8A04' },
  COMPLETED: { label: 'Đã hoàn tất', color: '#2563EB' },
  CANCELLED: { label: 'Đã hủy', color: '#DC2626' },
};

interface SessionStatusBadgeProps {
  status: SessionStatus;
}

export function SessionStatusBadge({ status }: SessionStatusBadgeProps) {
  const style = STATUS_STYLES[status];

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide"
      style={{ backgroundColor: `${style.color}1A`, color: style.color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: style.color }} />
      {style.label}
    </span>
  );
}
