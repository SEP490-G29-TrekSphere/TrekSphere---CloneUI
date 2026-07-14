import { ACCOUNT_ROLE_LABELS, type AccountRole } from '../types';

interface RoleBadgeProps {
  role: AccountRole;
}

/**
 * Badge hiển thị loại tài khoản.
 * - Trekker: nền xanh ngọc nhạt, chữ xanh rêu.
 * - Vendor Manager / Vendor Staff: nền xanh rêu tối, chữ sáng màu.
 * - Admin: nền đậm nhất.
 */
export function RoleBadge({ role }: RoleBadgeProps) {
  const styles = getRoleBadgeStyles(role);
  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap"
      style={styles}
    >
      {ACCOUNT_ROLE_LABELS[role]}
    </span>
  );
}

function getRoleBadgeStyles(role: AccountRole): React.CSSProperties {
  switch (role) {
    case 'trekker':
      return {
        backgroundColor: 'rgba(162, 235, 210, 0.35)',
        color: '#06261D',
      };
    case 'vendor_staff':
    case 'vendor_manager':
      return {
        backgroundColor: 'rgba(6, 38, 29, 0.85)',
        color: '#A2EBD2',
      };
    case 'admin':
      return {
        backgroundColor: '#06261D',
        color: '#FFFFFF',
      };
    default:
      return {
        backgroundColor: '#F0EEE6',
        color: '#06261D',
      };
  }
}
