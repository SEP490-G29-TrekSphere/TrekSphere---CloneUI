import { AlertCircle, CheckCircle2, Clock, Loader2, RotateCcw, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useClickOutside } from '@/shared/hooks';
import type { EquipmentReturnStatus, SessionEquipmentAllocation } from '../types';

export interface ReturnEquipmentItemState {
  sessionEquipmentId: string;
  equipmentName: string;
  allocatedQuantity: number;
  returnedQuantity: number;
  missingQuantity: number;
  note: string;
  selected: boolean;
  returnStatus?: EquipmentReturnStatus;
  isAlreadyProcessed: boolean;
}

interface ReturnEquipmentModalProps {
  isOpen: boolean;
  equipments: SessionEquipmentAllocation[];
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (
    items: {
      sessionEquipmentId: string;
      returnedQuantity: number;
      missingQuantity: number;
      note?: string;
    }[]
  ) => Promise<void>;
}

export function ReturnEquipmentModal({
  isOpen,
  equipments,
  isSubmitting = false,
  onClose,
  onSubmit,
}: ReturnEquipmentModalProps) {
  const [items, setItems] = useState<ReturnEquipmentItemState[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    setItems(
      equipments.map((eq) => {
        const status = eq.returnStatus ?? 'NOT_RETURNED';
        const isProcessed = status === 'PENDING_CONFIRMATION' || status === 'CONFIRMED';
        return {
          sessionEquipmentId: eq.sessionEquipmentId,
          equipmentName: eq.equipmentName,
          allocatedQuantity: eq.quantity,
          returnedQuantity: isProcessed ? (eq.returnedQuantity ?? eq.quantity) : eq.quantity,
          missingQuantity: isProcessed ? (eq.missingQuantity ?? 0) : 0,
          note: eq.note ?? (isProcessed ? '' : 'Trả đủ'),
          selected: !isProcessed,
          returnStatus: status,
          isAlreadyProcessed: isProcessed,
        };
      })
    );
  }, [isOpen, equipments]);

  const modalRef = useClickOutside<HTMLDivElement>(onClose, isOpen);

  if (!isOpen) return null;

  const handleToggleSelect = (index: number) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index || item.isAlreadyProcessed) return item;
        return { ...item, selected: !item.selected };
      })
    );
  };

  const handleReturnedQuantityChange = (index: number, val: number) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index || item.isAlreadyProcessed) return item;
        const returnedQuantity = Math.max(0, Math.min(val, item.allocatedQuantity));
        const missingQuantity = Math.max(0, item.allocatedQuantity - returnedQuantity);
        return {
          ...item,
          returnedQuantity,
          missingQuantity,
        };
      })
    );
  };

  const handleMissingQuantityChange = (index: number, val: number) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index || item.isAlreadyProcessed) return item;
        const missingQuantity = Math.max(0, Math.min(val, item.allocatedQuantity));
        const returnedQuantity = Math.max(0, item.allocatedQuantity - missingQuantity);
        return {
          ...item,
          returnedQuantity,
          missingQuantity,
        };
      })
    );
  };

  const handleNoteChange = (index: number, note: string) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index || item.isAlreadyProcessed) return item;
        return { ...item, note };
      })
    );
  };

  const handleSetFullReturn = (index: number) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index && !item.isAlreadyProcessed
          ? {
              ...item,
              returnedQuantity: item.allocatedQuantity,
              missingQuantity: 0,
              note: 'Trả đủ',
              selected: true,
            }
          : item
      )
    );
  };

  const handleSelectAllFullReturn = () => {
    setItems((prev) =>
      prev.map((item) =>
        item.isAlreadyProcessed
          ? item
          : {
              ...item,
              returnedQuantity: item.allocatedQuantity,
              missingQuantity: 0,
              note: 'Trả đủ',
              selected: true,
            }
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedItems = items.filter((item) => item.selected && !item.isAlreadyProcessed);
    if (selectedItems.length === 0) return;

    const payload = selectedItems.map((item) => ({
      sessionEquipmentId: item.sessionEquipmentId,
      returnedQuantity: item.returnedQuantity,
      missingQuantity: item.missingQuantity,
      note: item.note.trim() || undefined,
    }));

    await onSubmit(payload);
  };

  const selectableItems = items.filter((i) => !i.isAlreadyProcessed);
  const selectedCount = items.filter((i) => i.selected && !i.isAlreadyProcessed).length;
  const allProcessed = items.length > 0 && selectableItems.length === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-3xl bg-white shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E6E2D1] bg-[#F9F8F3] px-6 py-4">
          <div className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-[#06261D]" />
            <h2 className="text-base font-bold text-[#06261D]">Hoàn trả trang bị sau tour</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-full p-1 transition-colors hover:bg-black/5 text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {allProcessed ? (
              <div className="flex flex-col items-center justify-center text-center py-8 px-4 bg-emerald-50/50 rounded-2xl border border-emerald-200">
                <CheckCircle2 className="h-10 w-10 text-emerald-600 mb-2" />
                <h3 className="text-sm font-bold text-emerald-900">
                  Tất cả trang bị đã được xử lý hoàn trả
                </h3>
                <p className="text-xs text-emerald-700 mt-1 max-w-md">
                  Mọi vật dụng trong phiên tour này đã gửi báo cáo hoàn trả hoặc đã được
                  Staff/Manager xác nhận nhập kho thành công.
                </p>
              </div>
            ) : (
              <div className="flex items-start gap-3 rounded-2xl bg-[#F4F2EC] p-4 text-xs font-medium text-[#4A5568]">
                <AlertCircle className="h-4 w-4 shrink-0 text-emerald-700 mt-0.5" />
                <p>
                  Tích chọn các trang bị cần hoàn trả, kiểm tra số lượng thực trả / thiếu hỏng và
                  ghi rõ lý do nếu có thất thoát. Các món đã gửi báo cáo hoàn trả sẽ bị khóa thao
                  tác.
                </p>
              </div>
            )}

            {!allProcessed && (
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#6F7B75]">
                  Danh sách trang bị ({items.length} vật dụng)
                </span>
                {selectableItems.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSelectAllFullReturn}
                    className="text-xs font-semibold text-emerald-700 hover:underline"
                  >
                    Trả đủ tất cả chưa báo
                  </button>
                )}
              </div>
            )}

            {items.length === 0 ? (
              <p className="text-center py-6 text-sm text-gray-500">
                Phiên tour này chưa được phân bổ trang bị.
              </p>
            ) : (
              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div
                    key={item.sessionEquipmentId}
                    className={`rounded-2xl border p-4 transition-all ${
                      item.isAlreadyProcessed
                        ? 'border-gray-200 bg-gray-50/70 opacity-80'
                        : item.selected
                          ? 'border-emerald-700/40 bg-emerald-50/20 shadow-sm'
                          : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <label
                        className={`flex items-center gap-3 ${
                          item.isAlreadyProcessed ? 'cursor-not-allowed' : 'cursor-pointer'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={item.selected}
                          disabled={item.isAlreadyProcessed}
                          onChange={() => handleToggleSelect(idx)}
                          className="h-4 w-4 rounded border-gray-300 text-emerald-700 focus:ring-emerald-600 disabled:opacity-50"
                        />
                        <span className="text-sm font-bold text-gray-900">
                          {item.equipmentName}
                        </span>
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
                          Cấp phát: {item.allocatedQuantity}
                        </span>

                        {item.returnStatus === 'PENDING_CONFIRMATION' && (
                          <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800 border border-amber-300">
                            <Clock className="h-3 w-3 animate-spin" /> Chờ xác nhận
                          </span>
                        )}

                        {item.returnStatus === 'CONFIRMED' && (
                          <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="h-3 w-3" /> Đã nhập kho
                          </span>
                        )}

                        {!item.isAlreadyProcessed && (
                          <button
                            type="button"
                            onClick={() => handleSetFullReturn(idx)}
                            className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Trả đủ
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Form Controls / Summary */}
                    {item.isAlreadyProcessed ? (
                      <div className="text-xs text-gray-600 bg-gray-100/80 p-2.5 rounded-xl border border-gray-200/60 mt-2">
                        <div className="flex justify-between font-semibold text-gray-800">
                          <span>Đã báo trả: {item.returnedQuantity}</span>
                          <span>Hỏng/Mất: {item.missingQuantity}</span>
                        </div>
                        {item.note && (
                          <p className="text-[11px] text-gray-500 mt-0.5">Ghi chú: {item.note}</p>
                        )}
                      </div>
                    ) : (
                      item.selected && (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 pt-2 border-t border-gray-100">
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                              Số lượng trả đủ
                            </label>
                            <input
                              type="number"
                              min={0}
                              max={item.allocatedQuantity}
                              value={item.returnedQuantity}
                              onChange={(e) =>
                                handleReturnedQuantityChange(idx, Number(e.target.value))
                              }
                              className="w-full rounded-xl border border-gray-300 px-3 py-1.5 text-sm font-semibold focus:border-emerald-600 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                              Số lượng thiếu / hỏng
                            </label>
                            <input
                              type="number"
                              min={0}
                              max={item.allocatedQuantity}
                              value={item.missingQuantity}
                              onChange={(e) =>
                                handleMissingQuantityChange(idx, Number(e.target.value))
                              }
                              className="w-full rounded-xl border border-gray-300 px-3 py-1.5 text-sm font-semibold text-red-600 focus:border-red-500 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                              Ghi chú / Lý do
                            </label>
                            <input
                              type="text"
                              placeholder="Lý do hoàn trả..."
                              value={item.note}
                              onChange={(e) => handleNoteChange(idx, e.target.value)}
                              className="w-full rounded-xl border border-gray-300 px-3 py-1.5 text-sm focus:border-emerald-600 focus:outline-none"
                            />
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between border-t border-[#E6E2D1] bg-[#F9F8F3] px-6 py-4">
            <span className="text-xs font-semibold text-gray-600">
              {allProcessed
                ? 'Tất cả đã xử lý'
                : `Đã chọn ${selectedCount} / ${selectableItems.length} trang bị có thể trả`}
            </span>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-full px-5 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
              >
                {allProcessed ? 'Đóng' : 'Hủy'}
              </button>

              {!allProcessed && (
                <button
                  type="submit"
                  disabled={isSubmitting || selectedCount === 0}
                  className="flex items-center gap-2 rounded-full bg-[#06261D] hover:bg-[#06261D]/90 px-6 py-2 text-xs font-bold text-white shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    `Xác nhận hoàn trả (${selectedCount})`
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
