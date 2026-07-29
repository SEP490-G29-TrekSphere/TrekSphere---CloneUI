import { Pencil } from 'lucide-react';
import type { AdminVendor } from '../types';
import { VendorStatusBadge } from './VendorStatusBadge';

interface VendorTableRowProps {
  vendor: AdminVendor;
  onChangeStatus: (vendor: AdminVendor) => void;
}

/**
 * Một hàng trong bảng vendor list.
 * - Cột 1: Logo tròn + tên công ty (đậm) + description rút gọn bên dưới (nếu có).
 * - Cột 2: VendorStatusBadge.
 * - Cột 3: Email liên hệ.
 * - Cột 4: Nút "Đổi trạng thái" (icon bút chì) — hành động admin duy nhất
 *   khả dụng, vì API không hỗ trợ sửa thông tin vendor hay xem chi tiết riêng.
 */
export function VendorTableRow({ vendor, onChangeStatus }: VendorTableRowProps) {
  const initial = vendor.companyName.charAt(0).toUpperCase();

  return (
    <tr className="border-b transition-colors last:border-b-0" style={{ borderColor: '#E6E2D1' }}>
      {/* Vendor Details */}
      <td className="px-6 py-4" style={{ verticalAlign: 'middle' }}>
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-bold"
            style={{ backgroundColor: '#F0EEE6', color: '#06261D' }}
          >
            {vendor.logoUrl ? (
              <img
                src={vendor.logoUrl}
                alt={vendor.companyName}
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
            ) : (
              <span>{initial}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold" style={{ color: '#06261D' }}>
              {vendor.companyName}
            </p>
            {vendor.description && (
              <p className="max-w-xs truncate text-xs" style={{ color: '#6F7B75' }}>
                {vendor.description}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* Status */}
      <td className="px-6 py-4" style={{ verticalAlign: 'middle' }}>
        <VendorStatusBadge status={vendor.status} />
      </td>

      {/* Email Address */}
      <td className="px-6 py-4" style={{ verticalAlign: 'middle' }}>
        <span className="text-sm" style={{ color: '#6F7B75' }}>
          {vendor.contactEmail}
        </span>
      </td>

      {/* Actions */}
      <td className="px-6 py-4 text-right" style={{ verticalAlign: 'middle' }}>
        <button
          type="button"
          onClick={() => onChangeStatus(vendor)}
          aria-label={`Đổi trạng thái ${vendor.companyName}`}
          title="Đổi trạng thái"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors"
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
          <Pencil className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}
