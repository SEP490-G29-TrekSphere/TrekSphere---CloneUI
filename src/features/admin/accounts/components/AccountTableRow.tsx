import { ArrowRight, Lock, Unlock } from 'lucide-react';
import type { AdminAccount } from '../types';
import { RoleBadge } from './RoleBadge';
import { StatusIndicator } from './StatusIndicator';

interface AccountTableRowProps {
  account: AdminAccount;
  onViewDetail: (account: AdminAccount) => void;
  onToggleLock: (account: AdminAccount) => void;
  isStatusPending?: boolean;
}

/**
 * Một hàng trong bảng account list.
 * - Cột 1: Avatar + Họ tên (in đậm).
 * - Cột 2: Email (màu xám rêu).
 * - Cột 3: RoleBadge.
 * - Cột 4: StatusIndicator (dot + text).
 * - Cột 5: Nút "Xem chi tiết" (bo tròn ovan).
 */
export function AccountTableRow({
  account,
  onViewDetail,
  onToggleLock,
  isStatusPending = false,
}: AccountTableRowProps) {
  const initial = account.fullName.charAt(0).toUpperCase();
  const isLocked = account.status !== 'ACTIVE';

  return (
    <tr className="border-b transition-colors last:border-b-0" style={{ borderColor: '#E6E2D1' }}>
      {/* Họ và tên */}
      <td className="px-6 py-4" style={{ verticalAlign: 'middle' }}>
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-bold"
            style={{ backgroundColor: '#F0EEE6', color: '#06261D' }}
          >
            {account.avatarUrl ? (
              <img
                src={account.avatarUrl}
                alt={account.fullName}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <span>{initial}</span>
            )}
          </div>
          <span className="font-semibold" style={{ color: '#06261D' }}>
            {account.fullName}
          </span>
        </div>
      </td>

      {/* Email */}
      <td className="px-6 py-4" style={{ verticalAlign: 'middle' }}>
        <span className="text-sm" style={{ color: '#6F7B75' }}>
          {account.email}
        </span>
      </td>

      {/* Loại tài khoản */}
      <td className="px-6 py-4" style={{ verticalAlign: 'middle' }}>
        <RoleBadge role={account.role} />
      </td>

      {/* Trạng thái */}
      <td className="px-6 py-4" style={{ verticalAlign: 'middle' }}>
        <StatusIndicator status={account.status} />
      </td>

      {/* Thao tác */}
      <td className="px-6 py-4 text-right" style={{ verticalAlign: 'middle' }}>
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => onToggleLock(account)}
            disabled={isStatusPending}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              backgroundColor: '#FFFFFF',
              color: isLocked ? '#166534' : '#DC2626',
              border: `1px solid ${isLocked ? '#16A34A' : '#DC2626'}`,
            }}
          >
            {isLocked ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
            {isLocked ? 'Mở khóa' : 'Khóa'}
          </button>
          <button
            type="button"
            onClick={() => onViewDetail(account)}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-colors"
            style={{
              backgroundColor: '#FFFFFF',
              color: '#06261D',
              border: '1px solid #06261D',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F0EEE6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
            }}
          >
            Xem chi tiết
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}
