import { ChevronLeft, ChevronRight, ShieldAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDebounce } from '@/shared/hooks';
import { BookingFilterBar } from '../components/BookingFilterBar';
import { BookingStatsCards } from '../components/BookingStatsCards';
import { BookingTableRow } from '../components/BookingTableRow';
import { ConfirmBookingModal } from '../components/ConfirmBookingModal';
import { ConfirmPaymentModal } from '../components/ConfirmPaymentModal';
import { ConfirmRefundModal } from '../components/ConfirmRefundModal';
import { RejectBookingModal } from '../components/RejectBookingModal';
import { useConfirmBooking } from '../hooks/useConfirmBooking';
import { useConfirmPayment } from '../hooks/useConfirmPayment';
import { useConfirmRefund } from '../hooks/useConfirmRefund';
import { useRejectBooking } from '../hooks/useRejectBooking';
import { useVendorBookingStats } from '../hooks/useVendorBookingStats';
import { useVendorBookings } from '../hooks/useVendorBookings';
import type { VendorBookingFilter, VendorBookingItem } from '../types';

const PAGE_SIZE = 10;

export default function BookingList() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<VendorBookingFilter>({
    keyword: '',
    bookingStatus: undefined,
    paymentStatus: undefined,
    tourId: undefined,
  });
  const [selectedBookingForConfirm, setSelectedBookingForConfirm] =
    useState<VendorBookingItem | null>(null);
  const [selectedBookingForConfirmPayment, setSelectedBookingForConfirmPayment] =
    useState<VendorBookingItem | null>(null);
  const [selectedBookingForConfirmRefund, setSelectedBookingForConfirmRefund] =
    useState<VendorBookingItem | null>(null);
  const [selectedBookingForReject, setSelectedBookingForReject] =
    useState<VendorBookingItem | null>(null);

  const confirmBookingMutation = useConfirmBooking();
  const confirmPaymentMutation = useConfirmPayment();
  const confirmRefundMutation = useConfirmRefund();
  const rejectBookingMutation = useRejectBooking();

  const { data: stats } = useVendorBookingStats();

  const debouncedKeyword = useDebounce(filter.keyword ?? '', 400);

  // Reset page to 1 on filter changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: Reset page on debounced keyword or status change
  useEffect(() => {
    setPage(1);
  }, [debouncedKeyword, filter.bookingStatus, filter.paymentStatus, filter.tourId]);

  const activeFilter: VendorBookingFilter = {
    ...filter,
    keyword: debouncedKeyword || undefined,
  };

  const { data, isLoading, isError, error } = useVendorBookings(activeFilter, page, PAGE_SIZE);

  const bookings = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const handleFilterChange = (newFilter: Partial<VendorBookingFilter>) => {
    setFilter((prev) => ({ ...prev, ...newFilter }));
  };

  const handleResetFilter = () => {
    setFilter({
      keyword: '',
      bookingStatus: undefined,
      paymentStatus: undefined,
      tourId: undefined,
    });
    setPage(1);
  };

  const handleConfirmSubmit = (bookingId: string) => {
    confirmBookingMutation.mutate(bookingId, {
      onSuccess: () => {
        setSelectedBookingForConfirm(null);
      },
    });
  };

  const handleConfirmPaymentSubmit = (bookingId: string) => {
    confirmPaymentMutation.mutate(bookingId, {
      onSuccess: () => {
        setSelectedBookingForConfirmPayment(null);
      },
    });
  };

  const handleConfirmRefundSubmit = (bookingId: string) => {
    confirmRefundMutation.mutate(bookingId, {
      onSuccess: () => {
        setSelectedBookingForConfirmRefund(null);
      },
    });
  };

  const handleRejectSubmit = (bookingId: string, cancellationReason: string) => {
    rejectBookingMutation.mutate(
      { bookingId, cancellationReason },
      {
        onSuccess: () => {
          setSelectedBookingForReject(null);
        },
      }
    );
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight" style={{ color: '#06261D' }}>
            Quản Lý Đặt Tour - TrekOps
          </h2>
          <p className="text-sm font-medium mt-1" style={{ color: '#6F7B75' }}>
            Theo dõi danh sách khách đặt chỗ và quản lý đơn hàng của nhà cung cấp.
          </p>
        </div>
      </div>

      {/* Metrics Section */}
      <BookingStatsCards stats={stats} />

      {/* Filters Section */}
      <BookingFilterBar
        filter={filter}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilter}
      />

      {/* Bookings Table Container */}
      <div
        className="overflow-hidden rounded-3xl bg-white shadow-sm"
        style={{ border: '1px solid #E6E2D1' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead style={{ backgroundColor: '#FAF8F1' }}>
              <tr>
                {[
                  'MÃ ĐƠN',
                  'KHÁCH HÀNG',
                  'TÊN TOUR',
                  'NGÀY KHỞI HÀNH',
                  'TỔNG TIỀN',
                  'TRẠNG THÁI',
                  'THAO TÁC',
                ].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider"
                    style={{ color: '#6F7B75' }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: '#F0EEE6' }}>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-sm text-gray-500">
                    <div className="flex justify-center items-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-800 border-t-transparent" />
                      <span>Đang tải danh sách đặt tour...</span>
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-sm text-red-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ShieldAlert className="h-8 w-8 text-red-500" />
                      <span>
                        Không thể tải danh sách đặt tour:{' '}
                        {error instanceof Error ? error.message : 'Lỗi không xác định'}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-sm text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <p className="text-base font-semibold" style={{ color: '#06261D' }}>
                        Không tìm thấy đơn đặt tour
                      </p>
                      <p className="text-xs text-gray-400">
                        Không có đơn đặt tour nào phù hợp với bộ lọc hiện tại.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <BookingTableRow
                    key={booking.bookingId}
                    booking={booking}
                    onConfirm={(b) => setSelectedBookingForConfirm(b)}
                    onConfirmPayment={(b) => setSelectedBookingForConfirmPayment(b)}
                    onConfirmRefund={(b) => setSelectedBookingForConfirmRefund(b)}
                    onReject={(b) => setSelectedBookingForReject(b)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Pagination */}
        {!isLoading && !isError && totalElements > 0 && (
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4"
            style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid #F0EEE6' }}
          >
            <p className="text-sm font-medium text-gray-500">
              Hiển thị{' '}
              <span className="font-bold text-gray-800">
                {Math.min((page - 1) * PAGE_SIZE + 1, totalElements)} -{' '}
                {Math.min(page * PAGE_SIZE, totalElements)}
              </span>{' '}
              trong <span className="font-bold text-gray-800">{totalElements}</span> đơn
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Trang trước"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                <button
                  key={pNum}
                  type="button"
                  onClick={() => setPage(pNum)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors"
                  style={
                    pNum === page
                      ? { backgroundColor: '#06261D', color: '#FFFFFF' }
                      : { backgroundColor: 'transparent', color: '#6F7B75' }
                  }
                >
                  {pNum}
                </button>
              ))}

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Trang sau"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Booking Modal */}
      <ConfirmBookingModal
        booking={selectedBookingForConfirm}
        isOpen={!!selectedBookingForConfirm}
        isPending={confirmBookingMutation.isPending}
        onClose={() => setSelectedBookingForConfirm(null)}
        onConfirm={handleConfirmSubmit}
      />

      {/* Confirm Payment Modal */}
      <ConfirmPaymentModal
        booking={selectedBookingForConfirmPayment}
        isOpen={!!selectedBookingForConfirmPayment}
        isPending={confirmPaymentMutation.isPending}
        onClose={() => setSelectedBookingForConfirmPayment(null)}
        onConfirm={handleConfirmPaymentSubmit}
      />

      {/* Confirm Refund Modal */}
      <ConfirmRefundModal
        booking={selectedBookingForConfirmRefund}
        isOpen={!!selectedBookingForConfirmRefund}
        isPending={confirmRefundMutation.isPending}
        onClose={() => setSelectedBookingForConfirmRefund(null)}
        onConfirm={handleConfirmRefundSubmit}
      />

      {/* Reject Booking Modal */}
      <RejectBookingModal
        booking={selectedBookingForReject}
        isOpen={!!selectedBookingForReject}
        isPending={rejectBookingMutation.isPending}
        onClose={() => setSelectedBookingForReject(null)}
        onConfirm={handleRejectSubmit}
      />
    </div>
  );
}
