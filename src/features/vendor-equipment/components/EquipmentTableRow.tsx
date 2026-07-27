import { Pencil, Trash2 } from 'lucide-react';
import { formatDate } from '@/utils/format';
import type { VendorEquipmentItem } from '../types';

interface EquipmentTableRowProps {
  equipment: VendorEquipmentItem;
  onEditClick: (equipment: VendorEquipmentItem) => void;
  /** Không truyền prop này (undefined) sẽ ẩn nút Xóa — dùng để gate quyền theo role ở trang cha. */
  onDeleteClick?: (equipment: VendorEquipmentItem) => void;
}

/** 1 hàng trong bảng dụng cụ kho. */
export function EquipmentTableRow({
  equipment,
  onEditClick,
  onDeleteClick,
}: EquipmentTableRowProps) {
  return (
    <tr className="border-b transition-colors last:border-b-0" style={{ borderColor: '#E6E2D1' }}>
      <td className="px-6 py-4" style={{ verticalAlign: 'middle' }}>
        <span className="font-semibold" style={{ color: '#06261D' }}>
          {equipment.name}
        </span>
      </td>

      <td className="px-6 py-4" style={{ verticalAlign: 'middle', maxWidth: '320px' }}>
        <p
          className="truncate text-sm"
          style={{ color: '#6F7B75' }}
          title={equipment.description || undefined}
        >
          {equipment.description || '—'}
        </p>
      </td>

      <td className="px-6 py-4" style={{ verticalAlign: 'middle' }}>
        <span className="text-sm font-semibold" style={{ color: '#06261D' }}>
          {equipment.totalQuantity} đơn vị
        </span>
      </td>

      <td className="px-6 py-4" style={{ verticalAlign: 'middle' }}>
        <span className="text-sm" style={{ color: '#6F7B75' }}>
          {formatDate(equipment.createdAt)}
        </span>
      </td>

      <td className="px-6 py-4" style={{ verticalAlign: 'middle' }}>
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            aria-label={`Sửa ${equipment.name}`}
            onClick={() => onEditClick(equipment)}
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-black/5"
            style={{ color: '#6F7B75' }}
          >
            <Pencil className="h-4 w-4" />
          </button>
          {onDeleteClick && (
            <button
              type="button"
              aria-label={`Xóa ${equipment.name}`}
              onClick={() => onDeleteClick(equipment)}
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
