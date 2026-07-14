import { Calendar, ChevronDown, ShieldAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tourService } from '@/features/tours/services/tourService';
import { AppCard } from '@/shared/ui';
import { toast } from '@/store/useToastStore';
import { formatDate } from '@/utils/format';

type BookingListItem = Awaited<ReturnType<typeof tourService.getMyBookings>>['content'][number];

type TabType = 'UPCOMING' | 'COMPLETED' | 'CANCELLED';

export default function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingListItem[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const saved = sessionStorage.getItem('myBookingsActiveTab');
    const validTabs: TabType[] = ['UPCOMING', 'COMPLETED', 'CANCELLED'];
    if (saved && validTabs.includes(saved as TabType)) {
      return saved as TabType;
    }
    return 'UPCOMING';
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    async function fetchBookings() {
      try {
        const result = await tourService.getMyBookings(1, 5);
        setBookings(result.content);
        setHasMore(result.hasMore);
        setPage(1);
      } catch {
        toast.error('Không thể tải lịch sử đặt tour');
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, []);

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

  const handleViewDetails = (bookingId: string) => {
    const mainEl = document.querySelector('main');
    if (mainEl) {
      sessionStorage.setItem('myBookingsScrollTop', String(mainEl.scrollTop));
    }
    navigate(`/my-tours/${bookingId}`);
  };

  const handleLoadMore = async () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const result = await tourService.getMyBookings(nextPage, 5);
      setBookings((prev) => [...prev, ...result.content]);
      setHasMore(result.hasMore);
      setPage(nextPage);
    } catch {
      toast.error('Không thể tải thêm đặt tour');
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Filter bookings based on activeTab
  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'UPCOMING') {
      return (
        b.status === 'PENDING' ||
        b.status === 'CONFIRMED' ||
        b.status === 'AWAITING_CONFIRMATION' ||
        b.status === 'PENDING_CANCEL'
      );
    }
    if (activeTab === 'COMPLETED') {
      return b.status === 'COMPLETED';
    }
    if (activeTab === 'CANCELLED') {
      return b.status === 'CANCELLED';
    }
    return false;
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:py-12 bg-[#FAF9F5] min-h-screen">
      <h1 className="text-3xl font-extrabold text-[#0B3025] mb-6">Lịch sử Đặt Tour</h1>

      {/* Tabs */}
      <div className="flex border-b border-[#E5E4DE] mb-8">
        <button
          type="button"
          onClick={() => handleTabChange('UPCOMING')}
          className={`pb-4 px-6 font-bold text-sm transition-all cursor-pointer relative ${
            activeTab === 'UPCOMING' ? 'text-[#0B3025]' : 'text-zinc-400 hover:text-zinc-600'
          }`}
        >
          Sắp diễn ra
          {activeTab === 'UPCOMING' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0B3025]" />
          )}
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('COMPLETED')}
          className={`pb-4 px-6 font-bold text-sm transition-all cursor-pointer relative ${
            activeTab === 'COMPLETED' ? 'text-[#0B3025]' : 'text-zinc-400 hover:text-zinc-600'
          }`}
        >
          Đã hoàn thành
          {activeTab === 'COMPLETED' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0B3025]" />
          )}
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('CANCELLED')}
          className={`pb-4 px-6 font-bold text-sm transition-all cursor-pointer relative ${
            activeTab === 'CANCELLED' ? 'text-[#0B3025]' : 'text-zinc-400 hover:text-zinc-600'
          }`}
        >
          Đã hủy
          {activeTab === 'CANCELLED' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0B3025]" />
          )}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0B3025] border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => (
              <AppCard
                key={booking.bookingId}
                className="p-5 border-[#E5E4DE] rounded-3xl bg-white hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Status badge */}
                    {booking.status === 'PENDING' && (
                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                        Chờ thanh toán
                      </span>
                    )}
                    {booking.status === 'AWAITING_CONFIRMATION' && (
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                        Chờ duyệt thanh toán
                      </span>
                    )}
                    {booking.status === 'PENDING_CANCEL' && (
                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                        Chờ duyệt hủy
                      </span>
                    )}
                    {booking.status === 'CONFIRMED' && (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                        Đã xác nhận
                      </span>
                    )}
                    {booking.status === 'COMPLETED' && (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                        Đã hoàn thành
                      </span>
                    )}
                    {booking.status === 'CANCELLED' && (
                      <span className="inline-flex items-center gap-1 bg-red-50 text-red-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                        Đã hủy
                      </span>
                    )}

                    <span className="text-[10px] font-extrabold text-zinc-400">
                      Mã: {booking.bookingId}
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-zinc-800 tracking-tight leading-snug">
                    {booking.tourName}
                  </h3>

                  <div className="flex items-center gap-1.5 text-zinc-500 font-semibold text-xs">
                    <Calendar className="w-4 h-4 text-zinc-400" />
                    <span>Ngày đi: {formatDate(booking.departureDate)}</span>
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
          {hasMore && (
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
