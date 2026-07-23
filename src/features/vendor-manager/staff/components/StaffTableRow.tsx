import type { VendorStaffMember } from '../types';
import { StaffStatusBadge } from './StaffStatusBadge';

interface StaffTableRowProps {
  staff: VendorStaffMember;
  /** Bấm "Khóa" chỉ mở confirm dialog ở component cha — không gọi API trực tiếp ở đây. */
  onLockClick: (staff: VendorStaffMember) => void;
  /** Bấm "Mở khóa" gọi thẳng, không cần xác nhận (giống hành vi unlock bên Admin). */
  onUnlock: (staff: VendorStaffMember) => void;
}

const FALLBACK_AVATAR =
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face';

/** 1 hàng trong bảng nhân viên — không có nút Sửa (BE chưa có API cập nhật thông tin). */
export function StaffTableRow({ staff, onLockClick, onUnlock }: StaffTableRowProps) {
  const avatarSrc = staff.avatarUrl ?? FALLBACK_AVATAR;
  const initial = staff.fullName.charAt(0).toUpperCase();

  return (
    <tr className="border-b transition-colors last:border-b-0" style={{ borderColor: '#E6E2D1' }}>
      <td className="px-6 py-4" style={{ verticalAlign: 'middle' }}>
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-bold"
            style={{ backgroundColor: '#F0EEE6', color: '#06261D' }}
          >
            <img
              src={avatarSrc}
              alt={staff.fullName}
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
          <div className="flex flex-col">
            <span className="font-semibold" style={{ color: '#06261D' }}>
              {staff.fullName}
            </span>
            <span className="text-xs" style={{ color: '#6F7B75' }}>
              ID: {staff.shortId}
            </span>
          </div>
        </div>
      </td>

      <td className="px-6 py-4" style={{ verticalAlign: 'middle' }}>
        <span className="text-sm" style={{ color: '#6F7B75' }}>
          {staff.email}
        </span>
      </td>

      <td className="px-6 py-4" style={{ verticalAlign: 'middle' }}>
        <StaffStatusBadge isActive={staff.isActive} />
      </td>

      <td className="px-6 py-4 text-right" style={{ verticalAlign: 'middle' }}>
        {staff.isActive ? (
          <button
            type="button"
            onClick={() => onLockClick(staff)}
            className="inline-flex items-center rounded-full px-5 py-2 text-sm font-semibold transition-colors"
            style={{ backgroundColor: '#FFFFFF', color: '#DC2626', border: '1px solid #DC2626' }}
          >
            Khóa
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onUnlock(staff)}
            className="inline-flex items-center rounded-full px-5 py-2 text-sm font-semibold transition-colors"
            style={{ backgroundColor: '#06261D', color: '#FFFFFF' }}
          >
            Mở khóa
          </button>
        )}
      </td>
    </tr>
  );
}
