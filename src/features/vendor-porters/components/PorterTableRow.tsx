import { Pencil, Trash2 } from 'lucide-react';
import type { VendorPorterItem } from '../types';
import { PorterStatusBadge } from './PorterStatusBadge';

interface PorterTableRowProps {
  porter: VendorPorterItem;
  onEditClick: (porter: VendorPorterItem) => void;
  /** Không truyền prop này (undefined) sẽ ẩn nút Xóa — chỉ Vendor Manager mới có quyền xóa. */
  onDeleteClick?: (porter: VendorPorterItem) => void;
}

/** 1 hàng trong bảng danh sách porter. */
export function PorterTableRow({ porter, onEditClick, onDeleteClick }: PorterTableRowProps) {
  const initial = porter.fullName.charAt(0).toUpperCase();

  return (
    <tr className="border-b transition-colors last:border-b-0" style={{ borderColor: '#E6E2D1' }}>
      <td className="px-6 py-4" style={{ verticalAlign: 'middle' }}>
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-bold"
            style={{ backgroundColor: '#F0EEE6', color: '#06261D' }}
          >
            {porter.avatarUrl ? (
              <img
                src={porter.avatarUrl}
                alt={porter.fullName}
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
          <div className="flex flex-col">
            <span className="font-semibold" style={{ color: '#06261D' }}>
              {porter.fullName}
            </span>
            <span className="text-xs" style={{ color: '#6F7B75' }}>
              ID: {porter.shortId}
            </span>
          </div>
        </div>
      </td>

      <td className="px-6 py-4" style={{ verticalAlign: 'middle' }}>
        <span className="text-sm" style={{ color: '#6F7B75' }}>
          {porter.phone}
        </span>
      </td>

      <td className="px-6 py-4" style={{ verticalAlign: 'middle' }}>
        <PorterStatusBadge status={porter.status} />
      </td>

      <td className="px-6 py-4" style={{ verticalAlign: 'middle' }}>
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            aria-label={`Sửa ${porter.fullName}`}
            onClick={() => onEditClick(porter)}
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-black/5"
            style={{ color: '#6F7B75' }}
          >
            <Pencil className="h-4 w-4" />
          </button>
          {onDeleteClick && (
            <button
              type="button"
              aria-label={`Xóa ${porter.fullName}`}
              onClick={() => onDeleteClick(porter)}
              className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-black/5"
              style={{ color: '#6F7B75' }}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
