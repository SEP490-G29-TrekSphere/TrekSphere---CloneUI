import { Check, CheckCircle2, Loader2, Package, RotateCcw, X } from 'lucide-react';
import type { SessionEquipment } from '../types';

interface EquipmentAllocationTableProps {
  equipments: SessionEquipment[];
  onAddClick: () => void;
  onRemoveClick: (equipment: SessionEquipment) => void;
  /**
   * Chỉ Vendor Staff (không phải Manager) được BE cấp quyền gọi
   * `PUT /tracking/sessions/equipments/{id}/check` — Manager không thấy cột này.
   */
  canCheck: boolean;
  /** Trạng thái "đã kiểm tra" theo `sessionEquipmentId` — chỉ lưu tạm trên UI. */
  checkedMap: Record<string, boolean>;
  pendingCheckId?: string;
  onToggleCheck: (equipment: SessionEquipment, next: boolean) => void;

  /** Xác nhận nhập kho 1 thiết bị */
  onConfirmReturn?: (equipment: SessionEquipment) => void;
  /** Xác nhận nhập kho tất cả các thiết bị đang chờ */
  onBulkConfirmReturn?: () => void;
  isConfirming?: boolean;
}

/** Khối "Phân Bổ Trang Thiết Bị" — bảng full-width phía dưới cùng trang Chi tiết. */
export function EquipmentAllocationTable({
  equipments,
  onAddClick,
  onRemoveClick,
  canCheck,
  checkedMap,
  pendingCheckId,
  onToggleCheck,
  onConfirmReturn,
  onBulkConfirmReturn,
  isConfirming = false,
}: EquipmentAllocationTableProps) {
  const pendingConfirmationCount = equipments.filter(
    (e) => e.returnStatus === 'PENDING_CONFIRMATION'
  ).length;

  const baseColumns = ['Tên thiết bị', 'Số lượng cấp', 'Ghi chú'];
  if (canCheck) baseColumns.push('Đã xuất kho');
  baseColumns.push('Trạng thái hoàn trả', '');

  return (
    <div className="rounded-[32px] p-6" style={{ backgroundColor: '#F0EEE6' }}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5" style={{ color: '#06261D' }} />
          <h3 className="text-lg font-bold" style={{ color: '#06261D' }}>
            Phân Bổ Trang Thiết Bị & Kiểm Kê Hoàn Trả
          </h3>
          {pendingConfirmationCount > 0 && (
            <span className="rounded-full bg-amber-100 px-3 py-0.5 text-xs font-bold text-amber-800 border border-amber-300 animate-pulse">
              {pendingConfirmationCount} trang bị chờ nhập kho
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {pendingConfirmationCount > 0 && onBulkConfirmReturn && (
            <button
              type="button"
              onClick={onBulkConfirmReturn}
              disabled={isConfirming}
              className="flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold text-white bg-amber-700 hover:bg-amber-800 transition-colors shadow-sm disabled:opacity-50"
            >
              {isConfirming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Xác nhận nhập kho tất cả ({pendingConfirmationCount})
            </button>
          )}

          <button
            type="button"
            onClick={onAddClick}
            className="rounded-full px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#06261D' }}
          >
            + Cấp thiết bị
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white" style={{ border: '1px solid #E6E2D1' }}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead style={{ backgroundColor: '#F8F6EF' }}>
              <tr>
                {baseColumns.map((col) => (
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
                    colSpan={baseColumns.length}
                    className="px-6 py-10 text-center text-sm"
                    style={{ color: '#6F7B75' }}
                  >
                    Chưa cấp thiết bị nào cho phiên này.
                  </td>
                </tr>
              ) : (
                equipments.map((equipment) => {
                  const status = equipment.returnStatus ?? 'NOT_RETURNED';
                  const isPendingConfirmation = status === 'PENDING_CONFIRMATION';
                  const isConfirmed = status === 'CONFIRMED';

                  return (
                    <tr
                      key={equipment.sessionEquipmentId}
                      className={`border-b transition-colors last:border-b-0 ${
                        isPendingConfirmation ? 'bg-amber-50/40' : ''
                      }`}
                      style={{ borderColor: '#E6E2D1' }}
                    >
                      <td className="px-6 py-4 font-semibold" style={{ color: '#06261D' }}>
                        {equipment.equipmentName}
                      </td>
                      <td className="px-6 py-4 font-bold" style={{ color: '#06261D' }}>
                        {equipment.quantity}
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: '#6F7B75' }}>
                        {equipment.note || '—'}
                      </td>
                      {canCheck && (
                        <td className="px-6 py-4">
                          {pendingCheckId === equipment.sessionEquipmentId ? (
                            <Loader2
                              className="h-4 w-4 animate-spin"
                              style={{ color: '#6F7B75' }}
                            />
                          ) : (
                            <label className="inline-flex cursor-pointer items-center gap-2">
                              <input
                                type="checkbox"
                                checked={
                                  checkedMap[equipment.sessionEquipmentId] ??
                                  equipment.isChecked ??
                                  false
                                }
                                onChange={(e) => onToggleCheck(equipment, e.target.checked)}
                                className="h-4 w-4 accent-emerald-700"
                              />
                              <span className="text-xs font-semibold" style={{ color: '#06261D' }}>
                                {checkedMap[equipment.sessionEquipmentId] || equipment.isChecked
                                  ? 'Đã kiểm tra'
                                  : 'Chưa kiểm tra'}
                              </span>
                            </label>
                          )}
                        </td>
                      )}
                      <td className="px-6 py-4">
                        {isConfirmed && (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-300">
                              <Check className="h-3 w-3" /> Đã nhập kho
                            </span>
                            <div className="text-[11px] text-gray-500 font-medium">
                              Trả đủ: {equipment.returnedQuantity ?? equipment.quantity} | Mất/Hỏng:{' '}
                              {equipment.missingQuantity ?? 0}
                              {equipment.confirmedByName && (
                                <span className="block text-[10px] text-gray-400">
                                  Bởi {equipment.confirmedByName}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {isPendingConfirmation && (
                          <div className="space-y-1.5">
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800 border border-amber-300">
                              <RotateCcw className="h-3 w-3" /> Chờ xác nhận
                            </span>
                            <div className="text-[11px] text-amber-900 font-medium">
                              Trả: {equipment.returnedQuantity ?? 0} | Mất/Hỏng:{' '}
                              {equipment.missingQuantity ?? 0}
                              {equipment.submittedByName && (
                                <span className="block text-[10px] text-amber-700">
                                  Báo bởi {equipment.submittedByName}
                                </span>
                              )}
                            </div>
                            {onConfirmReturn && (
                              <button
                                type="button"
                                onClick={() => onConfirmReturn(equipment)}
                                disabled={isConfirming}
                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 px-2.5 py-1 text-[11px] font-bold text-white shadow-xs transition-colors disabled:opacity-50"
                              >
                                {isConfirming ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Check className="h-3 w-3" />
                                )}
                                Xác nhận nhập kho
                              </button>
                            )}
                          </div>
                        )}

                        {status === 'NOT_RETURNED' && (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
                            Chưa báo hoàn trả
                          </span>
                        )}
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
