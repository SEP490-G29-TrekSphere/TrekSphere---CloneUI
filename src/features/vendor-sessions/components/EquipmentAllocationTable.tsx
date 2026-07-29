import { Package, X } from 'lucide-react';
import type { SessionEquipment } from '../types';

interface EquipmentAllocationTableProps {
  equipments: SessionEquipment[];
  onAddClick: () => void;
  onRemoveClick: (equipment: SessionEquipment) => void;
}

const COLUMNS = ['Tên thiết bị', 'Số lượng', 'Ghi chú', ''];

/** Khối "Phân Bổ Trang Thiết Bị" — bảng full-width phía dưới cùng trang Chi tiết. */
export function EquipmentAllocationTable({
  equipments,
  onAddClick,
  onRemoveClick,
}: EquipmentAllocationTableProps) {
  return (
    <div className="rounded-[32px] p-6" style={{ backgroundColor: '#F0EEE6' }}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5" style={{ color: '#06261D' }} />
          <h3 className="text-lg font-bold" style={{ color: '#06261D' }}>
            Phân Bổ Trang Thiết Bị
          </h3>
        </div>
        <button
          type="button"
          onClick={onAddClick}
          className="rounded-full px-5 py-2.5 text-sm font-semibold text-white"
          style={{ backgroundColor: '#06261D' }}
        >
          + Cấp thiết bị
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white" style={{ border: '1px solid #E6E2D1' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: '#F8F6EF' }}>
              <tr>
                {COLUMNS.map((col) => (
                  <th
                    key={col}
                    className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider"
                    style={{ color: '#06261D' }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {equipments.length === 0 ? (
                <tr>
                  <td
                    colSpan={COLUMNS.length}
                    className="px-6 py-10 text-center text-sm"
                    style={{ color: '#6F7B75' }}
                  >
                    Chưa cấp thiết bị nào cho phiên này.
                  </td>
                </tr>
              ) : (
                equipments.map((equipment) => (
                  <tr
                    key={equipment.sessionEquipmentId}
                    className="border-b transition-colors last:border-b-0"
                    style={{ borderColor: '#E6E2D1' }}
                  >
                    <td className="px-6 py-4 font-semibold" style={{ color: '#06261D' }}>
                      {equipment.equipmentName}
                    </td>
                    <td className="px-6 py-4" style={{ color: '#06261D' }}>
                      {equipment.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: '#6F7B75' }}>
                      {equipment.note || '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        aria-label={`Hủy phân bổ ${equipment.equipmentName}`}
                        onClick={() => onRemoveClick(equipment)}
                        className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-red-50"
                        style={{ color: '#DC2626' }}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
