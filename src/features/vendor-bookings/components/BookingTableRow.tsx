import type { BookingStatus, PaymentStatus, VendorBookingItem } from '../types';

interface BookingTableRowProps {
  booking: VendorBookingItem;
  onConfirm?: (booking: VendorBookingItem) => void;
  onConfirmPayment?: (booking: VendorBookingItem) => void;
  onConfirmRefund?: (booking: VendorBookingItem) => void;
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
}: BookingTableRowProps) {
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

  // Format date: e.g. "24 Oct, 2026"
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
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
        <div className="flex items-center justify-end gap-2">
          {booking.bookingStatus !== 'CANCELLED' && booking.paymentStatus === 'PENDING' && (
            <button
              type="button"
              onClick={() => onConfirmPayment?.(booking)}
              className="rounded-full px-3.5 py-1.5 text-xs font-bold text-[#06261D] bg-[#E2EFE9] hover:bg-[#D2E7DD] transition-colors cursor-pointer"
            >
              Xác nhận nhận tiền
            </button>
          )}
          {booking.bookingStatus === 'PENDING' && (
            <button
              type="button"
              onClick={() => onConfirm?.(booking)}
              className="rounded-full px-4 py-1.5 text-xs font-bold text-white transition-opacity hover:opacity-90 cursor-pointer"
              style={{ backgroundColor: '#06261D' }}
            >
              Duyệt đơn
            </button>
          )}
          {booking.bookingStatus === 'CANCELLED' && booking.paymentStatus !== 'REFUNDED' && (
            <button
              type="button"
              onClick={() => onConfirmRefund?.(booking)}
              className="rounded-full px-3.5 py-1.5 text-xs font-bold text-[#0F766E] bg-[#CCFBF1] hover:bg-[#99F6E4] transition-colors cursor-pointer"
            >
              Xác nhận hoàn tiền
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
