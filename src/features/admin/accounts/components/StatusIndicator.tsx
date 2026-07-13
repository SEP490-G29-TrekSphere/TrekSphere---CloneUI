import type { AccountStatus } from '../types';

interface StatusIndicatorProps {
  status: AccountStatus;
}

/**
 * Hiển thị trạng thái tài khoản với dot indicator + text.
 * - ACTIVE: chấm xanh lá, chữ xanh lá.
 * - LOCKED: chấm đỏ, chữ đỏ.
 */
export function StatusIndicator({ status }: StatusIndicatorProps) {
  const isActive = status === 'ACTIVE';
  const label = isActive ? 'Hoạt động' : 'Bị khóa';
  const color = isActive ? '#16A34A' : '#DC2626';
  const bgColor = isActive ? 'rgba(22, 163, 74, 0.1)' : 'rgba(220, 38, 38, 0.1)';

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
