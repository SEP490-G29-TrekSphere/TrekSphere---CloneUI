import { Backpack, CheckCircle2, Clock, Loader2, RotateCcw } from 'lucide-react';
import type { SessionEquipmentAllocation } from '../types';

interface GearChecklistPanelProps {
  equipments: SessionEquipmentAllocation[];
  checkedMap: Record<string, boolean>;
  pendingId?: string;
  onToggle: (sessionEquipmentId: string, next: boolean) => void;
  onOpenReturnModal?: () => void;
  disabled?: boolean;
}

export function GearChecklistPanel({
  equipments,
  checkedMap,
  pendingId,
  onToggle,
  onOpenReturnModal,
  disabled = false,
}: GearChecklistPanelProps) {
  const totalCount = equipments.length;
  const pendingCount = equipments.filter((e) => e.returnStatus === 'PENDING_CONFIRMATION').length;
  const confirmedCount = equipments.filter((e) => e.returnStatus === 'CONFIRMED').length;
  const unreturnedCount = equipments.filter(
    (e) => !e.returnStatus || e.returnStatus === 'NOT_RETURNED'
  ).length;

  const allConfirmed = totalCount > 0 && confirmedCount === totalCount;
  const allPendingOrConfirmed = totalCount > 0 && unreturnedCount === 0;
  const hasPending = pendingCount > 0;

  return (
    <div className="rounded-3xl bg-[#EFECE6] p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-bold text-[#06261D]">
          <Backpack className="h-4 w-4" />
          Kiểm tra trang bị
        </h2>

        {onOpenReturnModal && totalCount > 0 && (
          <div>
            {allConfirmed ? (
              <div className="flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-300 px-3 py-1 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Đã nhập kho
              </div>
            ) : allPendingOrConfirmed ? (
              <button
                type="button"
                disabled
                className="flex items-center gap-1.5 rounded-full bg-amber-100 border border-amber-300 px-3 py-1 text-xs font-bold text-amber-900 cursor-not-allowed opacity-90 shadow-xs"
                title="Yêu cầu hoàn trả đã được gửi về cho Staff/Manager. Đang chờ xác nhận nhập kho."
              >
                <Clock className="h-3.5 w-3.5 text-amber-700 animate-spin" />
                Đã gửi yêu cầu (Chờ duyệt)
              </button>
            ) : (
              <button
                type="button"
                disabled={disabled}
                onClick={onOpenReturnModal}
                className="flex items-center gap-1.5 rounded-full bg-[#06261D] px-3.5 py-1 text-xs font-semibold text-white shadow-sm transition-all hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Hoàn trả trang bị {hasPending && `(${unreturnedCount} còn lại)`}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Thông báo trạng thái nếu đã gửi yêu cầu hoặc đã xác nhận nhập kho */}
      {allPendingOrConfirmed && !allConfirmed && (
        <div className="mb-3 flex items-start gap-2.5 rounded-2xl bg-amber-50 border border-amber-200/80 p-3 text-xs text-amber-900 font-medium">
          <Clock className="h-4 w-4 shrink-0 text-amber-600 mt-0.5 animate-pulse" />
          <div>
            <p className="font-bold">Đã gửi báo cáo hoàn trả trang bị</p>
            <p className="text-[11px] text-amber-800 mt-0.5">
              Danh sách trang bị đã gửi tới Staff/Manager. Hệ thống đang chờ xác nhận nhập kho để
              hoàn bù.
            </p>
          </div>
        </div>
      )}

      {allConfirmed && (
        <div className="mb-3 flex items-start gap-2.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 p-3 text-xs text-emerald-900 font-medium">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
          <div>
            <p className="font-bold">Đã hoàn tất kiểm kê & nhập kho</p>
            <p className="text-[11px] text-emerald-800 mt-0.5">
              Tất cả trang bị của phiên tour đã được Staff/Manager xác nhận nhập kho đầy đủ.
            </p>
          </div>
        </div>
      )}

      {equipments.length === 0 ? (
        <p className="text-xs font-medium text-[#6F7B75]">
          Phiên tour chưa được cấp phát trang bị.
        </p>
      ) : (
        <ul className="space-y-2">
          {equipments.map((eq) => {
            const isChecked = checkedMap[eq.sessionEquipmentId] ?? false;
            const isPending = pendingId === eq.sessionEquipmentId;
            const status = eq.returnStatus ?? 'NOT_RETURNED';
            const isItemDisabled =
              disabled || isPending || status === 'PENDING_CONFIRMATION' || status === 'CONFIRMED';

            return (
              <li key={eq.sessionEquipmentId}>
                <button
                  type="button"
                  onClick={() => onToggle(eq.sessionEquipmentId, !isChecked)}
                  disabled={isItemDisabled}
                  title={
                    isItemDisabled && (status === 'PENDING_CONFIRMATION' || status === 'CONFIRMED')
                      ? 'Trạng thái kiểm tra bị khóa sau khi gửi báo cáo hoàn trả'
                      : undefined
                  }
                  className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left transition-colors ${
                    isItemDisabled
                      ? 'cursor-not-allowed opacity-70 hover:bg-transparent'
                      : 'hover:bg-white/60'
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-sm font-medium text-[#06261D] truncate">
                      {eq.equipmentName} ({eq.quantity})
                    </span>

                    {status === 'PENDING_CONFIRMATION' && (
                      <span className="shrink-0 rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-300">
                        Chờ duyệt
                      </span>
                    )}

                    {status === 'CONFIRMED' && (
                      <span className="shrink-0 rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-300">
                        Đã nhập kho
                      </span>
                    )}
                  </div>

                  {isPending ? (
                    <Loader2 className="h-5 w-5 shrink-0 animate-spin text-[#6F7B75]" />
                  ) : (
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                        isChecked
                          ? 'border-[#06261D] bg-[#06261D]'
                          : 'border-[#C9C3B2] bg-transparent'
                      }`}
                    >
                      {isChecked && (
                        <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none">
                          <path
                            d="M3 8.5L6.2 11.5L13 4.5"
                            stroke="#FFFFFF"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
