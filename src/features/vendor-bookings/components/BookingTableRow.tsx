import { Check, ChevronDown, CreditCard, RotateCcw, X } from 'lucide-react';
import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { BookingStatus, PaymentStatus, VendorBookingItem } from '../types';

interface BookingTableRowProps {
  booking: VendorBookingItem;
  onConfirm?: (booking: VendorBookingItem) => void;
  onConfirmPayment?: (booking: VendorBookingItem) => void;
  onConfirmRefund?: (booking: VendorBookingItem) => void;
  onReject?: (booking: VendorBookingItem) => void;
}

const bookingStatusConfig: Record<BookingStatus, { label: string; bg: string; text: string }> = {
  PENDING: { label: 'Chờ xác nhận', bg: '#FEF3C7', text: '#92400E' },
  CONFIRMED: { label: 'Đã xác nhận', bg: '#DBEAFE', text: '#1E40AF' },
  CANCELLED: { label: 'Đã hủy', bg: '#F3F4F6', text: '#6B7280' },
  COMPLETED: { label: 'Hoàn thành', bg: '#D1FAE5', text: '#065F46' },
};

const paymentStatusConfig: Record<PaymentStatus, { label: string; bg: string; text: string }> = {
  PENDING: { label: 'Chờ thanh toán', bg: '#FEF3C7', text: '#B45309' },
  PAID: { label: 'Đã thanh toán', bg: '#D1FAE5', text: '#047857' },
  REFUNDED: { label: 'Đã hoàn tiền', bg: '#CCFBF1', text: '#0F766E' },
  PARTIALLY_REFUNDED: { label: 'Hoàn tiền một phần', bg: '#E0E7FF', text: '#3730A3' },
};

export function BookingTableRow({
  booking,
  onConfirm,
  onConfirmPayment,
  onConfirmRefund,
  onReject,
}: BookingTableRowProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);

  const bStatus = bookingStatusConfig[booking.bookingStatus] || {
    label: booking.bookingStatus,
    bg: '#F3F4F6',
    text: '#374151',
  };

  const pStatus = paymentStatusConfig[booking.paymentStatus] || {
    label: booking.paymentStatus,
    bg: '#F3F4F6',
    text: '#374151',
  };

  // Format date: e.g. "24/10/2026"
  const formatDate = (dateStr: string) => {
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

  // Extract initial for avatar fallback
  const getInitials = (name?: string) => {
    if (!name) return 'TRK';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const showConfirmPayment =
    booking.bookingStatus !== 'CANCELLED' && booking.paymentStatus === 'PENDING';
  const showConfirmBooking = booking.bookingStatus === 'PENDING';
  const showRejectBooking = booking.bookingStatus === 'PENDING';
  const showConfirmRefund =
    booking.bookingStatus === 'CANCELLED' && booking.paymentStatus !== 'REFUNDED';
  const hasActions =
    showConfirmPayment || showConfirmBooking || showRejectBooking || showConfirmRefund;

  return (
    <tr
      className="border-b transition-colors hover:bg-gray-50/50"
      style={{ borderColor: '#F0EEE6' }}
    >
      {/* Booking ID */}
      <td className="px-6 py-4 text-sm font-bold" style={{ color: '#06261D' }}>
        {booking.bookingCode || booking.bookingId.substring(0, 8)}
      </td>

      {/* Customer Name */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold"
            style={{ backgroundColor: '#E0DCD1', color: '#06261D' }}
          >
            {getInitials(booking.customerName)}
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: '#06261D' }}>
              {booking.customerName || 'Khách đặt tour'}
            </p>
            <p className="text-xs text-gray-500">{booking.numberOfParticipants} người tham gia</p>
          </div>
        </div>
      </td>

      {/* Tour Name */}
      <td className="px-6 py-4 text-sm font-medium" style={{ color: '#06261D' }}>
        <div className="flex items-center gap-3">
          {booking.coverImageUrl && (
            <img
              src={booking.coverImageUrl}
              alt={booking.tourName}
              className="h-10 w-10 rounded-xl object-cover"
            />
          )}
          <span className="line-clamp-2">{booking.tourName}</span>
        </div>
      </td>

      {/* Date */}
      <td className="px-6 py-4 text-sm font-medium text-gray-600 whitespace-nowrap">
        {formatDate(booking.departureDate)}
      </td>

      {/* Total Amount */}
      <td
        className="px-6 py-4 text-sm font-extrabold whitespace-nowrap"
        style={{ color: '#06261D' }}
      >
        {booking.totalPrice.toLocaleString('vi-VN')}đ
      </td>

      {/* Status Badges */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col items-start gap-1.5">
          <span
            className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
            style={{ backgroundColor: bStatus.bg, color: bStatus.text }}
          >
            {bStatus.label}
          </span>
          <span
            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium"
            style={{ backgroundColor: pStatus.bg, color: pStatus.text }}
          >
            {pStatus.label}
          </span>
        </div>
      </td>

      {/* Actions */}
      <td className="px-6 py-4 text-right whitespace-nowrap">
        <div className="flex items-center justify-end">
          {hasActions ? (
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#E6E2D1] bg-white px-3.5 py-1.5 text-xs font-bold text-[#06261D] hover:bg-[#FAF8F1] transition-colors shadow-xs cursor-pointer focus:outline-hidden"
              >
                Thao tác
                <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-48 p-1 bg-white border border-[#E6E2D1] rounded-2xl shadow-lg isolate z-50 flex flex-col gap-0.5"
              >
                {showConfirmPayment && (
                  <button
                    type="button"
                    onClick={() => {
                      setPopoverOpen(false);
                      onConfirmPayment?.(booking);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-[#06261D] hover:bg-[#E2EFE9] transition-colors cursor-pointer"
                  >
                    <CreditCard className="h-4 w-4 text-[#06261D]" />
                    Xác nhận nhận tiền
                  </button>
                )}
                {showConfirmBooking && (
                  <button
                    type="button"
                    onClick={() => {
                      setPopoverOpen(false);
                      onConfirm?.(booking);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-[#06261D] hover:bg-[#FAF8F1] transition-colors cursor-pointer"
                  >
                    <Check className="h-4 w-4 text-[#06261D]" />
                    Duyệt đơn
                  </button>
                )}
                {showRejectBooking && (
                  <button
                    type="button"
                    onClick={() => {
                      setPopoverOpen(false);
                      onReject?.(booking);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <X className="h-4 w-4 text-red-600" />
                    Từ chối
                  </button>
                )}
                {showConfirmRefund && (
                  <button
                    type="button"
                    onClick={() => {
                      setPopoverOpen(false);
                      onConfirmRefund?.(booking);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-[#0F766E] hover:bg-[#CCFBF1] transition-colors cursor-pointer"
                  >
                    <RotateCcw className="h-4 w-4 text-[#0F766E]" />
                    Xác nhận hoàn tiền
                  </button>
                )}
              </PopoverContent>
            </Popover>
          ) : (
            <span className="text-xs text-gray-400 font-medium italic">Không có thao tác</span>
          )}
        </div>
      </td>
    </tr>
  );
}
