import { Download, Filter, Search } from 'lucide-react';
import type { BookingStatus, PaymentStatus, VendorBookingFilter } from '../types';

interface BookingFilterBarProps {
  filter: VendorBookingFilter;
  onFilterChange: (newFilter: Partial<VendorBookingFilter>) => void;
  onReset: () => void;
}

export function BookingFilterBar({ filter, onFilterChange }: BookingFilterBarProps) {
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
          <option value="">Tất cả trạng thái tour</option>
          <option value="PENDING">Chờ xác nhận (PENDING)</option>
          <option value="CONFIRMED">Đã xác nhận (CONFIRMED)</option>
          <option value="CANCELLED">Đã hủy (CANCELLED)</option>
          <option value="COMPLETED">Đã hoàn thành (COMPLETED)</option>
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
          <option value="">Tất cả trạng thái thanh toán</option>
          <option value="PENDING">Chờ thanh toán (PENDING)</option>
          <option value="PAID">Đã thanh toán (PAID)</option>
          <option value="REFUNDED">Đã hoàn tiền (REFUNDED)</option>
          <option value="PARTIALLY_REFUNDED">Hoàn tiền 1 phần (PARTIALLY_REFUNDED)</option>
        </select>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 self-end md:self-auto">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors"
          style={{ backgroundColor: '#EFECE6', color: '#06261D' }}
        >
          <Filter className="h-4 w-4" />
          Lọc nâng cao
        </button>

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform active:scale-95"
          style={{ backgroundColor: '#06261D' }}
        >
          <Download className="h-4 w-4" />
          Xuất báo cáo
        </button>
      </div>
    </div>
  );
}
