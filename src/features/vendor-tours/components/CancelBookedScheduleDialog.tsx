import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, CalendarX2, Loader2, Users } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatDate } from '@/utils/format';
import { vendorScheduleCancellationService } from '../services/vendorScheduleCancellationService';
import type { TourSchedule } from '../types';

interface CancelBookedScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule: TourSchedule | null;
  isPending?: boolean;
  errorMessage?: string;
  onConfirm: (reason: string) => void;
}

export function CancelBookedScheduleDialog({
  open,
  onOpenChange,
  schedule,
  isPending = false,
  errorMessage,
  onConfirm,
}: CancelBookedScheduleDialogProps) {
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);
  const preview = useQuery({
    queryKey: [
      'schedule-cancellation-preview',
      schedule?.scheduleId,
      schedule?.bookedSlots,
      schedule?.updatedAt,
    ],
    queryFn: () => vendorScheduleCancellationService.preview(schedule as TourSchedule),
    enabled: open && Boolean(schedule),
  });

  useEffect(() => {
    if (!open) return;
    setReason('');
    setReasonError('');
  }, [open]);

  if (!schedule) return null;

  const data = preview.data;
  const isBlocked = Boolean(
    preview.isError ||
      !data ||
      !data.isSlotCountConsistent ||
      data.blockingBookings.length > 0 ||
      data.cancellableBookings.length === 0
  );

  function handleConfirm() {
    const trimmedReason = reason.trim();
    if (trimmedReason.length < 5) {
      setReasonError('Vui lòng nhập lý do hủy ít nhất 5 ký tự.');
      return;
    }
    setReasonError('');
    onConfirm(trimmedReason);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={dialogRef}
        className="max-h-[90vh] overflow-y-auto sm:max-w-[560px]"
        initialFocus={dialogRef}
      >
        <DialogHeader>
          <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
            <CalendarX2 className="h-5 w-5" />
          </div>
          <DialogTitle className="pr-8 text-xl font-bold">Hủy lịch khởi hành?</DialogTitle>
          <DialogDescription className="leading-relaxed">
            Lịch {formatDate(schedule.departureDate)} – {formatDate(schedule.returnDate)} đã có
            khách đặt. Hệ thống sẽ hủy lịch cùng toàn bộ booking và tạo yêu cầu hoàn 100% số tiền đã
            thu.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {preview.isLoading ? (
            <div className="flex items-center justify-center gap-2 rounded-2xl bg-[#F7F5EF] p-6 text-sm font-semibold text-[#6F7B75]">
              <Loader2 className="h-4 w-4 animate-spin" /> Đang đối chiếu các booking...
            </div>
          ) : preview.isError ? (
            <div className="space-y-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <p className="font-semibold">
                Không thể tải danh sách booking để đối chiếu. Chưa có thay đổi nào được thực hiện.
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => preview.refetch()}
                disabled={preview.isFetching}
                className="border-red-200 bg-white text-red-700 hover:bg-red-100"
              >
                {preview.isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Thử tải lại
              </Button>
            </div>
          ) : data ? (
            <>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-2xl bg-[#F7F5EF] p-3 text-center">
                  <p className="text-xl font-extrabold text-[#06261D]">
                    {data.cancellableBookings.length}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold text-[#6F7B75]">Booking</p>
                </div>
                <div className="rounded-2xl bg-[#F7F5EF] p-3 text-center">
                  <p className="text-xl font-extrabold text-[#06261D]">{data.participantCount}</p>
                  <p className="mt-1 text-[11px] font-semibold text-[#6F7B75]">Người tham gia</p>
                </div>
                <div className="rounded-2xl bg-amber-50 p-3 text-center">
                  <p className="text-xl font-extrabold text-amber-900">{data.paidBookingCount}</p>
                  <p className="mt-1 text-[11px] font-semibold text-amber-700">Booking hoàn tiền</p>
                </div>
              </div>

              {data.cancellableBookings.length === 0 && (
                <div className="flex gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold leading-relaxed text-red-700">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    Không tìm thấy booking đang hoạt động để xử lý. Hệ thống đã chặn thao tác để
                    tránh hủy lịch trên dữ liệu chưa đồng bộ.
                  </span>
                </div>
              )}

              {!data.isSlotCountConsistent && (
                <div className="flex gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold leading-relaxed text-red-700">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    Không thể đối chiếu an toàn: lịch ghi nhận {schedule.bookedSlots} người nhưng
                    manifest ghi nhận {data.bookedParticipantCount} người đã giữ chỗ chính thức. Hệ
                    thống đã chặn thao tác để tránh hủy sai dữ liệu.
                  </span>
                </div>
              )}

              {data.blockingBookings.length > 0 && (
                <div className="flex gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold leading-relaxed text-red-700">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    Có {data.blockingBookings.length} booking đã bắt đầu hoặc hoàn thành. Không thể
                    hủy lịch bằng luồng này.
                  </span>
                </div>
              )}

              {data.isSlotCountConsistent &&
                data.blockingBookings.length === 0 &&
                data.cancellableBookings.length > 0 && (
                  <div className="flex gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-medium leading-relaxed text-amber-900">
                    <Users className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>
                      Booking chưa thanh toán sẽ bị từ chối và giải phóng chỗ. Booking đã thu tiền
                      sẽ chuyển sang chờ hoàn tiền qua PayOS hoặc chuyển khoản thủ công.
                    </span>
                  </div>
                )}
            </>
          ) : null}

          <div>
            <label
              htmlFor="schedule-cancellation-reason"
              className="text-sm font-bold text-[#06261D]"
            >
              Lý do hủy <span className="text-red-500">*</span>
            </label>
            <textarea
              id="schedule-cancellation-reason"
              value={reason}
              onChange={(event) => {
                setReason(event.target.value);
                if (event.target.value.trim().length >= 5) setReasonError('');
              }}
              disabled={isPending || isBlocked}
              rows={3}
              placeholder="Ví dụ: Hủy lịch do dự báo thời tiết nguy hiểm..."
              className="mt-1.5 w-full resize-none rounded-2xl border border-[#D8D3C4] bg-white px-4 py-3 text-base outline-none focus:border-[#06261D] disabled:bg-gray-50 sm:text-sm"
            />
            {reasonError && (
              <p className="mt-1 text-xs font-semibold text-red-600">{reasonError}</p>
            )}
          </div>

          {errorMessage && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold leading-relaxed text-red-700">
              {errorMessage}
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            Giữ lịch
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isPending || isBlocked}
            className="w-full bg-red-600 text-white hover:bg-red-700 sm:w-auto"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Đang hủy lịch...
              </>
            ) : (
              'Xác nhận hủy lịch'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
