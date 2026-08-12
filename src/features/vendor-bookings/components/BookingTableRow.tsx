import { Check, ChevronDown, Eye, RotateCcw, X } from 'lucide-react';
import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { BookingStatus, PaymentStatus, VendorBookingItem } from '../types';

interface BookingTableRowProps {
  booking: VendorBookingItem;
  onConfirm?: (booking: VendorBookingItem) => void;
  onReject?: (booking: VendorBookingItem) => void;
  onViewDetail?: (bookingId: string) => void;
  onOpenRefund?: (bookingId: string) => void;
}

const bookingStatusConfig: Record<BookingStatus, { label: string; bg: string; text: string }> = {
  PAYMENT_PENDING: { label: 'Chờ thanh toán', bg: '#FEF3C7', text: '#92400E' },
  PENDING_CONFIRMATION: { label: 'Chờ xác nhận', bg: '#FEF3C7', text: '#92400E' },
  CONFIRMED: { label: 'Đã xác nhận', bg: '#DBEAFE', text: '#1E40AF' },
  IN_PROGRESS: { label: 'Đang diễn ra', bg: '#E0F2FE', text: '#075985' },
  CANCELLED: { label: 'Đã hủy', bg: '#F3F4F6', text: '#6B7280' },
  EXPIRED: { label: 'Hết hạn', bg: '#F3F4F6', text: '#6B7280' },
  REJECTED: { label: 'Bị từ chối', bg: '#FEE2E2', text: '#B91C1C' },
  COMPLETED: { label: 'Hoàn thành', bg: '#D1FAE5', text: '#065F46' },
};

const paymentStatusConfig: Record<PaymentStatus, { label: string; bg: string; text: string }> = {
  UNPAID: { label: 'Chưa thanh toán', bg: '#FEF3C7', text: '#B45309' },
  PARTIALLY_PAID: { label: 'Đã đặt cọc', bg: '#DBEAFE', text: '#1D4ED8' },
  PAID: { label: 'Đã thanh toán', bg: '#D1FAE5', text: '#047857' },
  REFUND_PENDING: { label: 'Chờ hoàn tiền', bg: '#FFEDD5', text: '#C2410C' },
  REFUNDED: { label: 'Đã hoàn tiền', bg: '#CCFBF1', text: '#0F766E' },
  PARTIALLY_REFUNDED: { label: 'Hoàn tiền một phần', bg: '#E0E7FF', text: '#3730A3' },
};

export function BookingTableRow({
  booking,
  onConfirm,
  onReject,
  onViewDetail,
  onOpenRefund,
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

  const showConfirmBooking = booking.bookingStatus === 'PENDING_CONFIRMATION';
  const showRejectBooking = ['PAYMENT_PENDING', 'PENDING_CONFIRMATION', 'CONFIRMED'].includes(
    booking.bookingStatus
  );
  const hasActions = showConfirmBooking || showRejectBooking;

  return (
    <tr
      className="border-b transition-colors hover:bg-gray-50/50"
      style={{ borderColor: '#F0EEE6' }}
    >
      {/* Booking ID */}
      <td className="px-6 py-4 text-sm">
        <button
          type="button"
          onClick={() => onViewDetail?.(booking.bookingId)}
          className="font-bold hover:underline transition-all text-left cursor-pointer focus:outline-hidden"
          style={{ color: '#06261D' }}
        >
          {booking.bookingCode || booking.bookingId.substring(0, 8)}
        </button>
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
        <div className="flex items-center justify-end gap-2">
          {booking.paymentStatus === 'REFUND_PENDING' && (
            <button
              type="button"
              onClick={() => onOpenRefund?.(booking.bookingId)}
              className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3.5 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-200"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Hoàn tiền
            </button>
          )}
          <button
            type="button"
            onClick={() => onViewDetail?.(booking.bookingId)}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#E6E2D1] bg-white px-3.5 py-1.5 text-xs font-bold text-[#06261D] hover:bg-[#FAF8F1]"
          >
            <Eye className="h-3.5 w-3.5" /> Chi tiết
          </button>
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
              </PopoverContent>
            </Popover>
          ) : null}
        </div>
      </td>
    </tr>
  );
}
