import { RotateCcw, Search } from 'lucide-react';
import type { BookingStatus, PaymentStatus, VendorBookingFilter } from '../types';

interface BookingFilterBarProps {
  filter: VendorBookingFilter;
  onFilterChange: (newFilter: Partial<VendorBookingFilter>) => void;
  onReset: () => void;
}

export function BookingFilterBar({ filter, onFilterChange, onReset }: BookingFilterBarProps) {
  const hasActiveFilter = Boolean(filter.keyword || filter.bookingStatus || filter.paymentStatus);
  return (
    <div
      className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl p-4 shadow-sm"
      style={{ backgroundColor: '#FAF8F1' }}
    >
      <div className="flex flex-1 flex-col sm:flex-row items-center gap-3">
        {/* Search Keyword */}
        <div className="relative w-full sm:w-72">
          <span
            className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none"
            style={{ color: '#6F7B75' }}
          >
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            value={filter.keyword ?? ''}
            onChange={(e) => onFilterChange({ keyword: e.target.value })}
            placeholder="Tìm tên tour, mã đơn, khách hàng..."
            aria-label="Tìm kiếm đơn đặt tour"
            className="w-full rounded-full border-none py-2.5 pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-1 transition-all"
            style={{ backgroundColor: '#FFFFFF', color: '#06261D', border: '1px solid #E0DCD1' }}
          />
        </div>

        {/* Filter Booking Status */}
        <select
          value={filter.bookingStatus ?? ''}
          onChange={(e) =>
            onFilterChange({
              bookingStatus: (e.target.value as BookingStatus) || undefined,
            })
          }
          aria-label="Lọc theo trạng thái đặt tour"
          className="w-full sm:w-auto rounded-full border-none px-4 py-2.5 text-sm font-medium focus:outline-none cursor-pointer"
          style={{ backgroundColor: '#FFFFFF', color: '#06261D', border: '1px solid #E0DCD1' }}
        >
          <option value="">Trạng thái đơn</option>
          <option value="PAYMENT_PENDING">Chờ thanh toán</option>
          <option value="PENDING_CONFIRMATION">Chờ xác nhận</option>
          <option value="CONFIRMED">Đã xác nhận</option>
          <option value="IN_PROGRESS">Đang diễn ra</option>
          <option value="CANCELLED">Đã hủy</option>
          <option value="EXPIRED">Hết hạn</option>
          <option value="REJECTED">Bị từ chối</option>
          <option value="COMPLETED">Đã hoàn thành</option>
        </select>

        {/* Filter Payment Status */}
        <select
          value={filter.paymentStatus ?? ''}
          onChange={(e) =>
            onFilterChange({
              paymentStatus: (e.target.value as PaymentStatus) || undefined,
            })
          }
          aria-label="Lọc theo trạng thái thanh toán"
          className="w-full sm:w-auto rounded-full border-none px-4 py-2.5 text-sm font-medium focus:outline-none cursor-pointer"
          style={{ backgroundColor: '#FFFFFF', color: '#06261D', border: '1px solid #E0DCD1' }}
        >
          <option value="">Trạng thái thanh toán</option>
          <option value="UNPAID">Chưa thanh toán</option>
          <option value="PARTIALLY_PAID">Đã đặt cọc</option>
          <option value="PAID">Đã thanh toán</option>
          <option value="REFUND_PENDING">Chờ hoàn tiền</option>
          <option value="REFUNDED">Đã hoàn tiền</option>
          <option value="PARTIALLY_REFUNDED">Hoàn tiền một phần</option>
        </select>
        {hasActiveFilter && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold text-[#6F7B75] hover:bg-white sm:w-auto"
          >
            <RotateCcw className="h-4 w-4" /> Xóa lọc
          </button>
        )}
      </div>
    </div>
  );
}
