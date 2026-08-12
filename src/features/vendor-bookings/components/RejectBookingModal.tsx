import { AlertTriangle, Loader2, X } from 'lucide-react';
import { useState } from 'react';
import type { VendorBookingItem } from '../types';

interface RejectBookingModalProps {
  booking: VendorBookingItem | null;
  isOpen: boolean;
  isPending: boolean;
  onClose: () => void;
  onConfirm: (bookingId: string, cancellationReason: string) => void;
}

export function RejectBookingModal({
  booking,
  isOpen,
  isPending,
  onClose,
  onConfirm,
}: RejectBookingModalProps) {
  const [reason, setReason] = useState('');

  if (!isOpen || !booking) return null;

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onConfirm(booking.bookingId, reason.trim());
  };

  const bookingCode = booking.bookingCode || booking.bookingId.substring(0, 8);
  const customerName = booking.customerName || 'khách hàng';

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
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#EF4444]/20 text-[#991B1B]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EF4444] text-white">
            <AlertTriangle className="h-6 w-6 stroke-[2.5]" />
          </div>
        </div>

        {/* Title & Subtitle */}
        <h3 className="text-center text-2xl font-extrabold tracking-tight text-[#06261D] mb-3">
          Từ chối đơn đặt tour
        </h3>
        <p className="text-center text-sm font-medium text-gray-600 mb-6 px-2 leading-relaxed">
          Bạn đang thực hiện từ chối đơn đặt tour của{' '}
          <span className="font-bold text-[#06261D]">{customerName}</span> (Mã đơn: #{bookingCode}).
        </p>

        <form onSubmit={handleConfirm}>
          {/* Reason Input */}
          <div className="mb-4">
            <label
              htmlFor="cancellationReason"
              className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2"
            >
              Lý do từ chối *
            </label>
            <textarea
              id="cancellationReason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ví dụ: Ảnh chuyển khoản không hợp lệ, sai thông tin..."
              disabled={isPending}
              required
              className="w-full rounded-2xl border border-[#E6E2D1] bg-[#FAF8F1] p-4 text-sm text-[#06261D] focus:outline-hidden focus:ring-2 focus:ring-[#06261D]/20 focus:border-[#06261D] placeholder:text-gray-400 resize-none transition-all"
            />
          </div>

          <p className="mb-6 rounded-2xl bg-amber-50 px-4 py-3 text-xs font-medium leading-relaxed text-amber-900">
            Nếu đơn đã thu tiền, hệ thống sẽ tự tạo yêu cầu hoàn tiền. Khách cập nhật tài khoản nhận
            tiền và quản lý xử lý tại tab <strong>Hoàn tiền</strong> trong chi tiết đơn.
          </p>

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
              type="submit"
              disabled={isPending || !reason.trim()}
              className="flex-1 flex items-center justify-center gap-2 rounded-full bg-[#EF4444] py-3.5 px-6 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Xác nhận từ chối
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
