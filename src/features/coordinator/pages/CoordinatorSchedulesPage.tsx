import { useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  CalendarCheck,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Compass,
  Filter,
  Radio,
  Search,
  ShieldCheck,
  UserCheck,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCoordinatorSessionOperationsPath } from '@/constants';
import { formatDate, parseIsoDate, toIsoDate } from '@/lib';
import { AppDatePicker } from '@/shared/ui';
import { coordinatorKeys, useCoordinatorSchedules } from '../hooks/useCoordinatorSchedules';
import type { CoordinatorScheduleStatus } from '../types';

export default function CoordinatorSchedulesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<CoordinatorScheduleStatus | ''>('');
  const [isCancelled, setIsCancelled] = useState<boolean | undefined>(undefined);
  const [departureDateFrom, setDepartureDateFrom] = useState('');
  const [departureDateTo, setDepartureDateTo] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const sortBy = 'createdAt';
  const sortDir = 'desc';

  const { data, isLoading, isError, refetch } = useCoordinatorSchedules({
    keyword: keyword || undefined,
    status: status || undefined,
    isCancelled,
    departureDateFrom: departureDateFrom || undefined,
    departureDateTo: departureDateTo || undefined,
    page,
    size: pageSize,
    sortBy,
    sortDir,
  });

  /**
   * Đồng bộ lại lịch dẫn đoàn mà không cần F5.
   *
   * `queryClient` đặt `staleTime: 5 phút` và tắt `refetchOnWindowFocus` toàn
   * cục, nên khi Manager/Staff vừa phân công thêm phiên mới, Coordinator đang
   * mở sẵn trang sẽ vẫn thấy dữ liệu cache cũ cho tới khi reload. Effect này
   * invalidate cache mỗi lần vào trang và mỗi lần tab được focus lại.
   *
   * Dùng `invalidateQueries` (mặc định `cancelRefetch: false`) thay cho
   * `refetch()` để không hủy + bắn lại request mà `useQuery` đang gọi lúc mount
   * — tránh gọi API 2 lần.
   */
  useEffect(() => {
    const syncSchedules = () => {
      void queryClient.invalidateQueries({ queryKey: coordinatorKeys.schedulesRoot });
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') syncSchedules();
    };

    syncSchedules();
    window.addEventListener('focus', syncSchedules);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', syncSchedules);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [queryClient]);

  const handleResetFilters = () => {
    setKeyword('');
    setStatus('');
    setIsCancelled(undefined);
    setDepartureDateFrom('');
    setDepartureDateTo('');
    setPage(0);
  };

  const getStatusBadge = (sessionStatus: CoordinatorScheduleStatus, cancelled: boolean) => {
    if (cancelled || sessionStatus === 'CANCELLED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
          <XCircle className="h-3.5 w-3.5" />
          Đã hủy
        </span>
      );
    }

    switch (sessionStatus) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <CalendarClock className="h-3.5 w-3.5" />
            Sắp khởi hành
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 animate-pulse">
            <Compass className="h-3.5 w-3.5" />
            Đang diễn ra
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <CalendarCheck className="h-3.5 w-3.5" />
            Hoàn thành
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
            {sessionStatus}
          </span>
        );
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Page Header */}
      <div>
        <h1
          className="text-2xl sm:text-3xl font-extrabold tracking-tight"
          style={{ color: '#06261D' }}
        >
          Lịch Dẫn Đoàn Được Phân Công
        </h1>
      </div>

      {/* Filters Card */}
      <div className="rounded-2xl border bg-white p-5 shadow-sm" style={{ borderColor: '#E6E2D1' }}>
        <div
          className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b pb-3"
          style={{ borderColor: '#F0EEE6' }}
        >
          <div className="flex items-center gap-2 font-bold" style={{ color: '#06261D' }}>
            <Filter className="h-4 w-4" style={{ color: '#0E7C6B' }} />
            <span>Bộ Lọc Tìm Kiếm</span>
          </div>
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs font-semibold text-emerald-700 hover:underline"
          >
            Đặt lại mặc định
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Keyword */}
          <div>
            <label className="mb-1 block text-xs font-bold" style={{ color: '#06261D' }}>
              Từ khóa tìm kiếm
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4" style={{ color: '#6F7B75' }} />
              <input
                type="text"
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setPage(0);
                }}
                placeholder="Tên tour..."
                className="w-full rounded-xl border pl-9 pr-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                style={{ borderColor: '#E0DCD1', backgroundColor: '#FAF8F1' }}
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="mb-1 block text-xs font-bold" style={{ color: '#06261D' }}>
              Trạng thái tour
            </label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as CoordinatorScheduleStatus | '');
                setPage(0);
              }}
              className="w-full rounded-xl border px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
              style={{ borderColor: '#E0DCD1', backgroundColor: '#FAF8F1' }}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="PENDING">Sắp khởi hành (PENDING)</option>
              <option value="IN_PROGRESS">Đang diễn ra (IN_PROGRESS)</option>
              <option value="COMPLETED">Hoàn thành (COMPLETED)</option>
              <option value="CANCELLED">Đã hủy (CANCELLED)</option>
            </select>
          </div>

          {/* Date From */}
          <div>
            <label className="mb-1 block text-xs font-bold" style={{ color: '#06261D' }}>
              Khởi hành từ ngày
            </label>
            <AppDatePicker
              selected={parseIsoDate(departureDateFrom)}
              onChange={(date: Date | null) => {
                setDepartureDateFrom(toIsoDate(date));
                setPage(0);
              }}
              isClearable
              ariaLabel="Khởi hành từ ngày"
              placeholderText="Từ ngày..."
              maxDate={parseIsoDate(departureDateTo) ?? undefined}
              className="w-full cursor-pointer rounded-xl border px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
              style={{ borderColor: '#E0DCD1', backgroundColor: '#FAF8F1' }}
            />
          </div>

          {/* Date To */}
          <div>
            <label className="mb-1 block text-xs font-bold" style={{ color: '#06261D' }}>
              Đến ngày
            </label>
            <AppDatePicker
              selected={parseIsoDate(departureDateTo)}
              onChange={(date: Date | null) => {
                setDepartureDateTo(toIsoDate(date));
                setPage(0);
              }}
              isClearable
              ariaLabel="Đến ngày"
              placeholderText="Đến ngày..."
              minDate={parseIsoDate(departureDateFrom) ?? undefined}
              className="w-full cursor-pointer rounded-xl border px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
              style={{ borderColor: '#E0DCD1', backgroundColor: '#FAF8F1' }}
            />
          </div>
        </div>
      </div>

      {/* Content Table */}
      <div
        className="overflow-hidden rounded-2xl border bg-white shadow-sm"
        style={{ borderColor: '#E6E2D1' }}
      >
        {isLoading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
            <p className="text-sm font-medium" style={{ color: '#6F7B75' }}>
              Đang tải lịch dẫn đoàn...
            </p>
          </div>
        ) : isError ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 text-red-600">
            <XCircle className="h-10 w-10" />
            <p className="text-sm font-semibold">
              Tải lịch dẫn đoàn thất bại. Vui lòng thử lại sau.
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-lg bg-red-50 px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-100"
            >
              Thử lại
            </button>
          </div>
        ) : !data || data.content.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
            <Compass className="h-12 w-12" style={{ color: '#6F7B75' }} />
            <p className="text-base font-bold" style={{ color: '#06261D' }}>
              Không tìm thấy lịch dẫn đoàn nào
            </p>
            <p className="max-w-md text-xs font-medium" style={{ color: '#6F7B75' }}>
              Bạn hiện chưa có lịch dẫn đoàn phù hợp với điều kiện tìm kiếm. Hãy thử thay đổi bộ
              lọc.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead
                  className="border-b text-xs font-bold uppercase"
                  style={{ backgroundColor: '#F9F8F3', borderColor: '#E6E2D1', color: '#06261D' }}
                >
                  <tr>
                    <th className="px-6 py-4">Tên Tour</th>
                    <th className="px-6 py-4">Vai Trò</th>
                    <th className="px-6 py-4">Ngày Khởi Hành</th>
                    <th className="px-6 py-4">Ngày Kết Thúc</th>
                    <th className="px-6 py-4">Trạng Thái</th>
                    <th className="px-6 py-4">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: '#F0EEE6' }}>
                  {data.content.map((item) => (
                    <tr
                      key={item.coordinatorScheduleId}
                      className="transition-colors hover:bg-emerald-50/40"
                    >
                      <td className="px-6 py-4 font-semibold" style={{ color: '#06261D' }}>
                        <div className="flex items-center gap-2">
                          <Compass className="h-4 w-4 shrink-0 text-emerald-700" />
                          <span>{item.tourName}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {item.isLead ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300">
                            <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
                            Trưởng Đoàn (Lead)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-gray-100 text-gray-700">
                            <UserCheck className="h-3.5 w-3.5 text-gray-500" />
                            Đội Viên (Member)
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 font-medium" style={{ color: '#06261D' }}>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" style={{ color: '#6F7B75' }} />
                          <span>{formatDate(item.departureDate)}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-medium" style={{ color: '#06261D' }}>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" style={{ color: '#6F7B75' }} />
                          <span>{formatDate(item.returnDate)}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {getStatusBadge(item.sessionStatus, item.isCancelled)}
                      </td>

                      <td className="px-6 py-4">
                        {(() => {
                          const canOperate =
                            !item.isCancelled &&
                            (item.sessionStatus === 'PENDING' ||
                              item.sessionStatus === 'IN_PROGRESS');
                          return (
                            <button
                              type="button"
                              disabled={!canOperate}
                              onClick={() =>
                                navigate(getCoordinatorSessionOperationsPath(item.tourSessionId))
                              }
                              title={
                                canOperate
                                  ? 'Mở trang điều hành tour thực địa'
                                  : 'Chỉ khả dụng khi tour sắp hoặc đang diễn ra'
                              }
                              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-white transition-all disabled:cursor-not-allowed disabled:opacity-30 hover:opacity-90"
                              style={{ backgroundColor: '#06261D' }}
                            >
                              <Radio className="h-3.5 w-3.5" />
                              Điều hành
                            </button>
                          );
                        })()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div
              className="flex flex-col gap-3 border-t p-4 sm:flex-row sm:items-center sm:justify-between"
              style={{ borderColor: '#E6E2D1', backgroundColor: '#FAF8F1' }}
            >
              <div className="text-xs font-semibold" style={{ color: '#6F7B75' }}>
                Hiển thị <span className="font-bold text-emerald-800">{data.content.length}</span>{' '}
                trên tổng số{' '}
                <span className="font-bold text-emerald-800">{data.totalElements}</span> bản ghi
                (Trang {data.pageNumber + 1} / {data.totalPages || 1})
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={data.pageNumber <= 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all disabled:opacity-40 hover:bg-white"
                  style={{ borderColor: '#E0DCD1', color: '#06261D' }}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Trang trước
                </button>
                <button
                  type="button"
                  disabled={data.last}
                  onClick={() => setPage((p) => p + 1)}
                  className="inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all disabled:opacity-40 hover:bg-white"
                  style={{ borderColor: '#E0DCD1', color: '#06261D' }}
                >
                  Trang sau
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
