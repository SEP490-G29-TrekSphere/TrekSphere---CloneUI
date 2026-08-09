import { Info, Loader2, RotateCcw, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { tourService } from '@/features/tours/services/tourService';
import type { BookingDetailResponse } from '@/features/tours/types';
import type { VendorBookingItem } from '../types';

interface ConfirmRefundModalProps {
  booking: VendorBookingItem | null;
  isOpen: boolean;
  isPending: boolean;
  onClose: () => void;
  onConfirm: (bookingId: string) => void;
}

export function ConfirmRefundModal({
  booking,
  isOpen,
  isPending,
  onClose,
  onConfirm,
}: ConfirmRefundModalProps) {
  const [fullBooking, setFullBooking] = useState<BookingDetailResponse | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    if (isOpen && booking?.bookingId) {
      setLoadingDetail(true);
      tourService
        .getBookingDetail(booking.bookingId)
        .then((data) => {
          setFullBooking(data);
        })
        .catch((err) => {
          console.error('Lỗi tải chi tiết đơn đặt:', err);
        })
        .finally(() => {
          setLoadingDetail(false);
        });
    } else {
      setFullBooking(null);
    }
  }, [isOpen, booking?.bookingId]);

  if (!isOpen || !booking) return null;

  const handleConfirm = () => {
    onConfirm(booking.bookingId);
  };

  const currentBooking = fullBooking || booking;
  const bookingCode = currentBooking.bookingCode || currentBooking.bookingId.substring(0, 8);
  const customerName =
    currentBooking.customerName || (currentBooking as any).userFullName || 'khách hàng';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        tabIndex={-1}
        aria-label="Đóng modal"
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity border-none cursor-default"
        onClick={isPending ? undefined : onClose}
      />

      {/* Modal Card */}
      <div
        className="relative z-10 w-full max-w-md overflow-hidden rounded-[32px] p-8 shadow-2xl transition-all animate-in fade-in zoom-in-95 duration-200"
        style={{ backgroundColor: '#FAF8F1' }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-200/50 hover:text-gray-600 transition-colors disabled:opacity-50"
          aria-label="Đóng"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Top Icon Badge */}
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#52D89C]/20 text-[#06261D]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#52D89C] text-[#06261D]">
            <RotateCcw className="h-6 w-6 stroke-[2.5]" />
          </div>
        </div>

        {/* Title & Subtitle */}
        <h3 className="text-center text-2xl font-extrabold tracking-tight text-[#06261D] mb-3">
          Xác nhận Đã hoàn tiền
        </h3>
        <p className="text-center text-sm font-medium text-gray-600 mb-6 px-2 leading-relaxed">
          Bạn xác nhận đã thực hiện hoàn tiền cho khách hàng{' '}
          <span className="font-bold text-[#06261D]">{customerName}</span>?
        </p>

        {/* Details Card */}
        <div className="mb-5 rounded-2xl bg-[#F4F0E8] p-5 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-gray-500 uppercase text-xs tracking-wider">
              MÃ ĐƠN HÀNG
            </span>
            <span className="font-extrabold text-[#06261D]">#{bookingCode}</span>
          </div>
          <div className="flex items-center justify-between text-sm pt-1">
            <span className="font-semibold text-gray-500 uppercase text-xs tracking-wider">
              SỐ TIỀN HOÀN TRẢ
            </span>
            <div className="flex flex-col items-end gap-1">
              <span className="text-lg font-extrabold text-[#06261D]">
                {currentBooking.totalPrice.toLocaleString('vi-VN')} VND
              </span>
              <span className="inline-flex items-center rounded-md bg-[#52D89C]/30 px-2 py-0.5 text-[10px] font-bold text-[#06261D] tracking-wide uppercase">
                100% THANH TOÁN
              </span>
            </div>
          </div>
        </div>

        {/* Proof of Payment Image Section */}
        {loadingDetail ? (
          <div className="mb-5 rounded-2xl bg-white border border-gray-200 p-6 flex flex-col justify-center items-center gap-2 text-xs text-gray-400">
            <Loader2 className="h-5 w-5 animate-spin text-[#06261D]" />
            <span>Đang tải hình ảnh minh chứng...</span>
          </div>
        ) : currentBooking.proofImageUrl ? (
          <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-3">
            <span className="block text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wide">
              Hình ảnh minh chứng thanh toán
            </span>
            <div className="overflow-hidden rounded-xl border border-gray-100 max-h-56 bg-zinc-50 flex justify-center">
              <img
                src={currentBooking.proofImageUrl}
                alt="Minh chứng thanh toán từ khách hàng"
                className="max-h-52 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>
        ) : (
          <div className="mb-5 rounded-2xl bg-amber-50 border border-amber-100 p-4 text-xs text-amber-800 text-center">
            Khách hàng chưa tải lên hình ảnh minh chứng.
          </div>
        )}

        {/* Notice Callout Box */}
        <div className="mb-8 flex items-start gap-3 rounded-2xl bg-[#E4EBE6] p-4 text-xs text-[#06261D]">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#06261D]" />
          <p className="leading-relaxed font-medium">
            Hệ thống sẽ cập nhật trạng thái đơn thành{' '}
            <span className="font-bold">ĐÃ HOÀN TIỀN</span> và lưu lại lịch sử giao dịch hoàn trả.
          </p>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="flex-1 rounded-full bg-[#E8E4DA] py-3.5 px-6 text-sm font-bold text-[#06261D] transition-colors hover:bg-[#DDD8CB] disabled:opacity-50 cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            className="flex-1 flex items-center justify-center gap-2 rounded-full bg-[#06261D] py-3.5 px-6 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Xác nhận đã hoàn tiền
          </button>
        </div>
      </div>
    </div>
  );
}
