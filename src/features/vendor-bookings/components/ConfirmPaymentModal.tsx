import { Info, Loader2, Wallet, X } from 'lucide-react';
import type { VendorBookingItem } from '../types';

interface ConfirmPaymentModalProps {
  booking: VendorBookingItem | null;
  isOpen: boolean;
  isPending: boolean;
  onClose: () => void;
  onConfirm: (bookingId: string) => void;
}

export function ConfirmPaymentModal({
  booking,
  isOpen,
  isPending,
  onClose,
  onConfirm,
}: ConfirmPaymentModalProps) {
  if (!isOpen || !booking) return null;

  const handleConfirm = () => {
    onConfirm(booking.bookingId);
  };

  const bookingCode = booking.bookingCode || booking.bookingId.substring(0, 8);

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

        {/* Top Wallet Icon */}
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#52D89C]/20 text-[#06261D]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#52D89C] text-[#06261D]">
            <Wallet className="h-6 w-6 stroke-[2.5]" />
          </div>
        </div>

        {/* Title & Subtitle */}
        <h3 className="text-center text-2xl font-extrabold tracking-tight text-[#06261D] mb-3">
          Xác nhận Đã nhận tiền
        </h3>
        <p className="text-center text-sm font-medium text-gray-600 mb-6 px-2 leading-relaxed">
          Bạn có chắc chắn đã nhận đủ số tiền cho mã đơn hàng{' '}
          <span className="font-bold text-[#06261D]">#{bookingCode}</span>?
        </p>

        {/* Details Card */}
        <div className="mb-5 rounded-2xl bg-[#F4F0E8] p-5 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-500">Khách hàng</span>
            <span className="font-bold text-[#06261D]">
              {booking.customerName || 'Khách đặt tour'}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-500">Tổng số tiền</span>
            <span className="text-lg font-extrabold text-[#06261D]">
              {booking.totalPrice.toLocaleString('vi-VN')} VND
            </span>
          </div>
        </div>

        {/* Notice Callout Box */}
        <div className="mb-8 flex items-start gap-3 rounded-2xl bg-[#E4EBE6] p-4 text-xs text-[#06261D]">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#06261D]" />
          <p className="leading-relaxed">
            Hành động này sẽ chuyển trạng thái đơn sang{' '}
            <span className="font-bold">ĐÃ THANH TOÁN (PAID)</span> và gửi thông báo cho khách hàng.
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
            Xác nhận đã nhận tiền
          </button>
        </div>
      </div>
    </div>
  );
}
