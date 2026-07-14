import { ArrowRight } from 'lucide-react';
import type { AdminAccount } from '../types';
import { RoleBadge } from './RoleBadge';
import { StatusIndicator } from './StatusIndicator';

interface AccountTableRowProps {
  account: AdminAccount;
  onViewDetail: (account: AdminAccount) => void;
}

const FALLBACK_AVATAR =
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face';

/**
 * Một hàng trong bảng account list.
 * - Cột 1: Avatar + Họ tên (in đậm).
 * - Cột 2: Email (màu xám rêu).
 * - Cột 3: RoleBadge.
 * - Cột 4: StatusIndicator (dot + text).
 * - Cột 5: Nút "Xem chi tiết" (bo tròn ovan).
 */
export function AccountTableRow({ account, onViewDetail }: AccountTableRowProps) {
  const avatarSrc = account.avatarUrl ?? FALLBACK_AVATAR;
  const initial = account.fullName.charAt(0).toUpperCase();

  return (
    <tr className="border-b transition-colors last:border-b-0" style={{ borderColor: '#E6E2D1' }}>
      {/* Họ và tên */}
      <td className="px-6 py-4" style={{ verticalAlign: 'middle' }}>
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-bold"
            style={{ backgroundColor: '#F0EEE6', color: '#06261D' }}
          >
            <img
              src={avatarSrc}
              alt={account.fullName}
              className="h-full w-full object-cover"
              loading="lazy"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = 'none';
                const span = document.createElement('span');
                span.textContent = initial;
                target.parentElement?.appendChild(span);
              }}
            />
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
      </td>
    </tr>
  );
}
