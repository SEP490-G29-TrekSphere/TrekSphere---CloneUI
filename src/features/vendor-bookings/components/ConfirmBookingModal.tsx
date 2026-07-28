import { Bell, Calendar, Check, Info, Loader2, Mountain, Users } from 'lucide-react';
import type { VendorBookingItem } from '../types';

interface ConfirmBookingModalProps {
  booking: VendorBookingItem | null;
  isOpen: boolean;
  isPending: boolean;
  onClose: () => void;
  onConfirm: (bookingId: string) => void;
}

export function ConfirmBookingModal({
  booking,
  isOpen,
  isPending,
  onClose,
  onConfirm,
}: ConfirmBookingModalProps) {
  if (!isOpen || !booking) return null;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  const handleConfirm = () => {
    onConfirm(booking.bookingId);
  };

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
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-[32px] p-8 shadow-2xl transition-all animate-in fade-in zoom-in-95 duration-200"
        style={{ backgroundColor: '#FAF8F1' }}
      >
        {/* Top Check Badge Icon */}
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#E2EFE9] text-[#06261D]">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#06261D] text-white">
            <Check className="h-6 w-6 stroke-[3]" />
          </div>
        </div>

        {/* Title & Subtitle */}
        <h3 className="text-center text-2xl font-extrabold tracking-tight text-[#06261D] mb-2">
          Xác nhận Giữ chỗ Chính thức
        </h3>
        <p className="text-center text-sm font-medium text-gray-500 mb-6 px-4">
          Xác nhận giữ chỗ chính thức cho đoàn của khách hàng{' '}
          <span className="font-bold text-[#06261D]">{booking.customerName || 'khách hàng'}</span>?
        </p>

        {/* Details Grid Container */}
        <div className="mb-6 rounded-2xl bg-[#F4F0E8] p-5">
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            {/* Tour Name */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <Mountain className="h-4 w-4 text-gray-400" /> TOUR
              </div>
              <p className="mt-1 text-sm font-bold text-[#06261D] line-clamp-2">
                {booking.tourName}
              </p>
            </div>

            {/* Departure Date */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <Calendar className="h-4 w-4 text-gray-400" /> NGÀY KHỞI HÀNH
              </div>
              <p className="mt-1 text-sm font-bold text-[#06261D]">
                {formatDate(booking.departureDate)}
              </p>
            </div>

            {/* Members */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <Users className="h-4 w-4 text-gray-400" /> THÀNH VIÊN
              </div>
              <p className="mt-1 text-sm font-bold text-[#06261D]">
                {booking.numberOfParticipants} người
              </p>
            </div>

            {/* Request Type */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <Info className="h-4 w-4 text-gray-400" /> LOẠI YÊU CẦU
              </div>
              <p className="mt-1 text-sm font-bold text-[#06261D]">Đoàn khách lẻ</p>
            </div>
          </div>
        </div>

        {/* Notice Callout Box */}
        <div className="mb-8 flex items-start gap-3 rounded-2xl bg-[#E4EBE6] p-4 text-xs text-[#06261D]">
          <Bell className="mt-0.5 h-4 w-4 shrink-0 text-[#06261D]" />
          <p className="leading-relaxed">
            Sau khi xác nhận, chỗ của khách sẽ được chốt chính thức trong lịch trình tour. Trạng
            thái sẽ chuyển sang <span className="font-bold">ĐÃ XÁC NHẬN (CONFIRMED)</span>.
          </p>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="flex-1 rounded-full bg-[#E8E4DA] py-3.5 px-6 text-sm font-bold text-[#06261D] transition-colors hover:bg-[#DDD8CB] disabled:opacity-50"
          >
            Quay lại
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            className="flex-1 flex items-center justify-center gap-2 rounded-full bg-[#06261D] py-3.5 px-6 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Xác nhận giữ chỗ
          </button>
        </div>
      </div>
    </div>
  );
}
