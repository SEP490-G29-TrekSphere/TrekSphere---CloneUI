interface StaffStatusBadgeProps {
  isActive: boolean;
}

/** Badge trạng thái nhân viên: dot + text, giống `StatusIndicator` bên Admin nhưng chỉ 2 trạng thái. */
export function StaffStatusBadge({ isActive }: StaffStatusBadgeProps) {
  const color = isActive ? '#16A34A' : '#DC2626';
  const bgColor = isActive ? 'rgba(22, 163, 74, 0.1)' : 'rgba(220, 38, 38, 0.1)';
  const label = isActive ? 'Hoạt động' : 'Đã khóa';

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
