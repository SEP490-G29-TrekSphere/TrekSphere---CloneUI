import {
  AlertCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MapPin,
  RotateCcw,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTrekkerGroupDetailPath, PATHS } from '@/constants';
import { cn } from '@/lib/utils';
import { AppButton } from '@/shared/ui';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';
import { formatDate } from '@/utils/format';
import { useCancelJoinRequest } from '../hooks/useCancelJoinRequest';
import { useMyJoinRequests } from '../hooks/useMyJoinRequests';

const PAGE_SIZE = 10;

const joinStatusOptions = [
  { value: 'ALL', label: 'Tất cả trạng thái' },
  { value: 'PENDING', label: 'Đang chờ duyệt' },
  { value: 'ACCEPTED', label: 'Đã chấp nhận' },
  { value: 'REJECTED', label: 'Bị từ chối' },
  { value: 'CANCELLED', label: 'Đã hủy' },
  { value: 'LEFT', label: 'Đã rời nhóm' },
];

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  PENDING: {
    bg: 'bg-amber-100 text-amber-800 border-amber-200',
    text: 'text-amber-600',
    label: 'Đang chờ duyệt',
  },
  ACCEPTED: {
    bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    text: 'text-emerald-600',
    label: 'Đã chấp nhận',
  },
  REJECTED: {
    bg: 'bg-rose-100 text-rose-800 border-rose-200',
    text: 'text-rose-600',
    label: 'Bị từ chối',
  },
  CANCELLED: {
    bg: 'bg-slate-100 text-slate-800 border-slate-200',
    text: 'text-slate-600',
    label: 'Đã hủy',
  },
  LEFT: {
    bg: 'bg-neutral-100 text-neutral-800 border-neutral-200',
    text: 'text-neutral-600',
    label: 'Đã rời nhóm',
  },
};

export default function MyJoinRequestsPage() {
  const navigate = useNavigate();
  const user = useAppStore((s) => s.user);
  const isGuest = !user;

  // Protect route
  useEffect(() => {
    if (isGuest) {
      navigate(PATHS.LOGIN);
    }
  }, [isGuest, navigate]);

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(0);

  // Fetch join requests
  const {
    data: joinRequestsData,
    isLoading,
    isError,
    refetch,
  } = useMyJoinRequests({
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    page,
    size: PAGE_SIZE,
  });

  const cancelMutation = useCancelJoinRequest();

  // Reset page when status filter changes
  useEffect(() => {
    setPage(0);
  }, []);

  const handleCancelRequest = (matchingGroupId: string) => {
    if (!matchingGroupId) return;
    if (confirm('Bạn có chắc chắn muốn hủy yêu cầu tham gia nhóm ghép này?')) {
      cancelMutation.mutate(matchingGroupId, {
        onSuccess: () => {
          toast.success('Hủy yêu cầu tham gia thành công.');
          refetch();
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : 'Có lỗi xảy ra khi hủy yêu cầu.');
        },
      });
    }
  };

  const handleViewDetail = (matchingGroupId: string) => {
    navigate(getTrekkerGroupDetailPath(matchingGroupId));
  };

  if (isGuest) return null;

  const requests = joinRequestsData?.content ?? [];
  const totalPages = joinRequestsData?.totalPages ?? 0;
  const totalElements = joinRequestsData?.totalElements ?? 0;

  return (
    <div className="flex flex-col min-h-screen pt-16 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="pb-8">
        <h1 className="text-3xl font-black text-[#06261D] tracking-tight">Yêu Cầu Của Tôi</h1>
        <p className="mt-2 text-sm text-[#6F7B75]">
          Xem và quản lý các yêu cầu gia nhập nhóm ghép của bạn.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* LEFT: Filters */}
        <aside className="lg:col-span-3">
          <div className="rounded-2xl border border-[#E0DCD1] bg-white p-5 shadow-xs">
            <h3 className="mb-5 text-base font-bold text-[#06261D]">Lọc trạng thái</h3>
            <div className="flex flex-col gap-2.5">
              {joinStatusOptions.map((opt) => {
                const isActive = statusFilter === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setStatusFilter(opt.value)}
                    className="flex items-center gap-3 text-left transition-colors hover:text-[#06261D] cursor-pointer w-full"
                  >
                    <span
                      className={cn(
                        'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all',
                        isActive
                          ? 'border-[#06261D] bg-[#06261D]'
                          : 'border-[#E0DCD1] bg-transparent'
                      )}
                    >
                      {isActive && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </span>
                    <span
                      className={cn(
                        'text-xs transition-all',
                        isActive ? 'font-semibold text-[#06261D]' : 'text-[#6F7B75]'
                      )}
                    >
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* RIGHT: List */}
        <main className="lg:col-span-9 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E0DCD1] pb-4">
            <h2 className="text-xl font-bold text-[#06261D]">
              Danh sách yêu cầu ({totalElements})
            </h2>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-10 h-10 text-emerald-800 animate-spin mb-4" />
              <p className="text-sm font-semibold text-slate-500">Đang tải danh sách yêu cầu...</p>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <RotateCcw className="h-8 w-8 text-red-500 mb-4" />
              <h3 className="text-base font-bold text-[#06261D]">Không thể tải yêu cầu</h3>
              <p className="mb-6 max-w-sm text-xs text-[#6F7B75]">
                Đã xảy ra lỗi kết nối với máy chủ.
              </p>
              <AppButton onClick={() => refetch()}>Thử lại</AppButton>
            </div>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-white border border-[#E0DCD1] rounded-2xl">
              <AlertCircle className="h-10 w-10 text-[#6F7B75] mb-3" />
              <h3 className="text-base font-bold text-[#06261D]">Không tìm thấy yêu cầu nào</h3>
              <p className="text-xs text-[#6F7B75] max-w-xs mt-1">
                {statusFilter === 'ALL'
                  ? 'Bạn chưa gửi yêu cầu tham gia bất kỳ nhóm ghép nào.'
                  : 'Không có yêu cầu nào có trạng thái được chọn.'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {requests.map((req) => {
                const style = statusStyles[req.status] || statusStyles.PENDING;
                return (
                  <div
                    key={req.matchingMemberId}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-white border border-[#E0DCD1] rounded-2xl shadow-2xs hover:shadow-xs transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      {req.ownerAvatarUrl ? (
                        <img
                          src={req.ownerAvatarUrl}
                          alt={req.ownerName}
                          className="h-11 w-11 rounded-full object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="h-11 w-11 rounded-full bg-emerald-50 text-emerald-950 font-bold flex items-center justify-center text-xs shrink-0 border border-stone-200">
                          {req.ownerName.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleViewDetail(req.matchingGroupId)}
                            className="text-left text-sm font-bold text-[#06261D] hover:underline cursor-pointer"
                          >
                            {req.groupName}
                          </button>
                          <span
                            className={cn(
                              'px-2.5 py-0.5 rounded-full text-[10px] font-bold border',
                              style.bg
                            )}
                          >
                            {style.label}
                          </span>
                        </div>
                        <p className="text-xs text-[#6F7B75] flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>Tour: {req.tourName}</span>
                        </p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#6F7B75]">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            Khởi hành: {formatDate(req.targetDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            Sĩ số: {req.currentSize}/{req.maxSize} thành viên
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                      {req.status === 'PENDING' && req.canCancel && (
                        <AppButton
                          variant="outline"
                          disabled={cancelMutation.isPending}
                          onClick={() => handleCancelRequest(req.matchingGroupId)}
                          className="rounded-full text-xs font-semibold px-4 py-1 border-destructive text-destructive hover:bg-destructive/5 shrink-0"
                        >
                          Hủy yêu cầu
                        </AppButton>
                      )}
                      <AppButton
                        onClick={() => handleViewDetail(req.matchingGroupId)}
                        className="rounded-full text-xs font-semibold px-4 py-1 bg-[#06261D] hover:bg-[#0B3025] text-white shrink-0"
                      >
                        Chi tiết nhóm
                      </AppButton>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <span className="text-xs text-[#6F7B75]">
                Trang {page + 1} / {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E0DCD1] bg-white text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={page === totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E0DCD1] bg-white text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
