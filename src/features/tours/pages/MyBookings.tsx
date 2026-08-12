import { Calendar, ChevronDown, Search, ShieldAlert, Users } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBookingDetailPath, getTrekkerBookingDetailPath } from '@/constants';
import { tourService } from '@/features/tours/services/tourService';
import type { BookingItemFromApi, BookingStatus } from '@/features/tours/types';
import { AppCard } from '@/shared/ui';
import { toast } from '@/store/useToastStore';
import { formatDate, formatPrice } from '@/utils/format';

type TabType = 'ALL' | BookingStatus;

const TAB_OPTIONS: Array<{ label: string; value: TabType }> = [
  { label: 'Tất cả', value: 'ALL' },
  { label: 'Chờ thanh toán', value: 'PAYMENT_PENDING' },
  { label: 'Chờ xác nhận', value: 'PENDING_CONFIRMATION' },
  { label: 'Đã xác nhận', value: 'CONFIRMED' },
  { label: 'Đã hoàn thành', value: 'COMPLETED' },
  { label: 'Đã hủy', value: 'CANCELLED' },
];

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80';

export default function MyBookings({ useTrekkerPaths = false }: { useTrekkerPaths?: boolean }) {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingItemFromApi[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const saved = sessionStorage.getItem('myBookingsActiveTab');
    const validTabs: TabType[] = [
      'ALL',
      'PAYMENT_PENDING',
      'PENDING_CONFIRMATION',
      'CONFIRMED',
      'COMPLETED',
      'CANCELLED',
    ];
    if (saved && validTabs.includes(saved as TabType)) {
      return saved as TabType;
    }
    return 'ALL';
  });
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [isLast, setIsLast] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchBookings = useCallback(
    async (pageNum: number, currentTab: TabType, searchKeyword: string, isAppend = false) => {
      if (isAppend) {
        setIsLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const statusParam = currentTab === 'ALL' ? undefined : currentTab;
        const response = await tourService.getMyBookings({
          page: pageNum,
          size: 10,
          status: statusParam,
          keyword: searchKeyword.trim() || undefined,
          sortBy: 'createdAt',
          sortDir: 'desc',
        });

        if (isAppend) {
          setBookings((prev) => [...prev, ...response.content]);
        } else {
          setBookings(response.content);
        }

        setIsLast(response.last);
        setPage(response.pageNumber);
      } catch {
        toast.error('Không thể tải lịch sử đặt tour');
      } finally {
        setLoading(false);
        setIsLoadingMore(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchBookings(0, activeTab, keyword);
  }, [activeTab, keyword, fetchBookings]);

  // Restore scroll position after loading completes
  useEffect(() => {
    if (!loading) {
      const savedScroll = sessionStorage.getItem('myBookingsScrollTop');
      if (savedScroll) {
        const timer = setTimeout(() => {
          const mainEl = document.querySelector('main');
          if (mainEl) {
            mainEl.scrollTop = Number.parseInt(savedScroll, 10);
          }
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [loading]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    sessionStorage.setItem('myBookingsActiveTab', tab);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setKeyword(searchInput);
  };

  const handleViewDetails = (bookingId: string) => {
    const mainEl = document.querySelector('main');
    if (mainEl) {
      sessionStorage.setItem('myBookingsScrollTop', String(mainEl.scrollTop));
    }
    const path = useTrekkerPaths
      ? getTrekkerBookingDetailPath(bookingId)
      : getBookingDetailPath(bookingId);
    navigate(path);
  };

  const handleLoadMore = () => {
    if (isLoadingMore || isLast) return;
    fetchBookings(page + 1, activeTab, keyword, true);
  };

  return (
    <div className="mx-auto max-w-[1400px] w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#0B3025]">
            Lịch sử Đặt Tour
          </h1>
          <p className="text-xs md:text-sm font-medium text-zinc-500 mt-1">
            Quản lý và theo dõi danh sách tất cả các chuyến đi bạn đã đặt.
          </p>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="relative max-w-md w-full">
          <input
            type="text"
            placeholder="Tìm theo tên tour hoặc mã đơn..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-white border border-[#E5E4DE] rounded-full py-2.5 pl-4 pr-10 text-xs font-semibold text-zinc-700 placeholder-zinc-400 focus:outline-none focus:border-[#0B3025] transition-colors"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-[#0B3025] cursor-pointer"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E5E4DE] mb-8 overflow-x-auto no-scrollbar">
        {TAB_OPTIONS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => handleTabChange(tab.value)}
            className={`pb-4 px-5 font-bold text-sm transition-all cursor-pointer whitespace-nowrap relative ${
              activeTab === tab.value ? 'text-[#0B3025]' : 'text-zinc-400 hover:text-zinc-600'
            }`}
          >
            {tab.label}
            {activeTab === tab.value && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0B3025]" />
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0B3025] border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.length > 0 ? (
            bookings.map((booking) => (
              <AppCard
                key={booking.bookingId}
                className="p-5 border-[#E5E4DE] rounded-3xl bg-white hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div className="flex gap-4 items-start md:items-center">
                  <img
                    src={booking.coverImageUrl || FALLBACK_IMAGE}
                    alt={booking.tourName}
                    onError={(e) => {
                      if (e.currentTarget.src !== FALLBACK_IMAGE) {
                        e.currentTarget.src = FALLBACK_IMAGE;
                      }
                    }}
                    className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover shrink-0"
                  />

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Booking Status badge */}
                      {booking.bookingStatus === 'PAYMENT_PENDING' && (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                          Chờ thanh toán
                        </span>
                      )}
                      {booking.bookingStatus === 'PENDING_CONFIRMATION' && (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                          Chờ xác nhận
                        </span>
                      )}
                      {booking.bookingStatus === 'CONFIRMED' && (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                          Đã xác nhận
                        </span>
                      )}
                      {booking.bookingStatus === 'COMPLETED' && (
                        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                          Đã hoàn thành
                        </span>
                      )}
                      {booking.bookingStatus === 'CANCELLED' && (
                        <span className="inline-flex items-center gap-1 bg-red-50 text-red-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                          Đã hủy
                        </span>
                      )}
                      {booking.bookingStatus === 'IN_PROGRESS' && (
                        <span className="inline-flex items-center gap-1 bg-sky-50 text-sky-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                          Đang diễn ra
                        </span>
                      )}
                      {['EXPIRED', 'REJECTED'].includes(booking.bookingStatus) && (
                        <span className="inline-flex items-center gap-1 bg-red-50 text-red-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                          {booking.bookingStatus === 'EXPIRED' ? 'Hết hạn' : 'Bị từ chối'}
                        </span>
                      )}

                      {/* Payment Status badge */}
                      {booking.paymentStatus === 'PAID' && (
                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                          Đã thanh toán
                        </span>
                      )}
                      {booking.paymentStatus === 'UNPAID' && (
                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                          Chưa thanh toán
                        </span>
                      )}
                      {booking.paymentStatus === 'PARTIALLY_PAID' && (
                        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                          Đã đặt cọc
                        </span>
                      )}
                      {booking.paymentStatus === 'REFUND_PENDING' && (
                        <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                          Chờ hoàn tiền
                        </span>
                      )}
                      {booking.paymentStatus === 'REFUNDED' && (
                        <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                          Đã hoàn tiền
                        </span>
                      )}
                      {booking.paymentStatus === 'PARTIALLY_REFUNDED' && (
                        <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                          Hoàn tiền 1 phần
                        </span>
                      )}

                      <span className="text-[10px] font-extrabold text-zinc-400">
                        Mã: {booking.bookingCode || booking.bookingId}
                      </span>
                    </div>

                    <h3 className="text-base md:text-lg font-extrabold text-zinc-800 tracking-tight leading-snug">
                      {booking.tourName}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-zinc-500 font-semibold text-xs">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                        <span>
                          {formatDate(booking.departureDate)}
                          {booking.returnDate ? ` - ${formatDate(booking.returnDate)}` : ''}
                        </span>
                      </div>
                      {booking.numberOfParticipants ? (
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{booking.numberOfParticipants} người</span>
                        </div>
                      ) : null}
                    </div>

                    {booking.totalPrice !== undefined && booking.totalPrice > 0 ? (
                      <p className="text-xs font-bold text-[#0B3025]">
                        Tổng tiền:{' '}
                        <span className="text-sm font-extrabold">
                          {formatPrice(booking.totalPrice)}
                        </span>
                      </p>
                    ) : null}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleViewDetails(booking.bookingId)}
                  className="bg-white border border-[#E5E4DE] text-[#0B3025] hover:bg-[#FAF9F5] font-bold px-5 py-2.5 rounded-2xl text-xs transition-colors shrink-0 cursor-pointer self-start md:self-center"
                >
                  Xem chi tiết
                </button>
              </AppCard>
            ))
          ) : (
            <div className="py-20 text-center bg-white border border-[#E5E4DE] rounded-3xl">
              <ShieldAlert className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
              <h3 className="text-zinc-600 font-bold text-sm">Không có đơn đặt chỗ nào</h3>
              <p className="text-zinc-400 text-xs mt-1">
                Lịch sử đặt tour của bạn sẽ hiển thị ở đây.
              </p>
            </div>
          )}

          {/* Load more button */}
          {!isLast && (
            <div className="pt-6 flex justify-center">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-700 font-bold text-xs cursor-pointer py-2 px-4 rounded-xl hover:bg-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{isLoadingMore ? 'Đang tải...' : 'Xem thêm các tour cũ'}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
