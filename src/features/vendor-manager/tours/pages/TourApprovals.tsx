import { X } from 'lucide-react';
import { useState } from 'react';
import { ApproveTourConfirmDialog } from '@/features/vendor-tours/components/ApproveTourConfirmDialog';
import { TourApprovalTableRow } from '@/features/vendor-tours/components/TourApprovalTableRow';
import { TourPagination } from '@/features/vendor-tours/components/TourPagination';
import { TourReasonDialog } from '@/features/vendor-tours/components/TourReasonDialog';
import { useVendorTourList } from '@/features/vendor-tours/hooks/useVendorTourList';
import { useVendorTourMutations } from '@/features/vendor-tours/hooks/useVendorTourMutations';
import { useVendorTourStats } from '@/features/vendor-tours/hooks/useVendorTourStats';
import type { VendorTourListItem } from '@/features/vendor-tours/types';
import { toast } from '@/store/useToastStore';

const PAGE_SIZE = 10;
/**
 * `GET /vendor/tours` không hỗ trợ lọc theo status phía server (đã xác nhận qua OpenAPI
 * spec) — tải 1 mẻ lớn rồi lọc + phân trang phía client, cùng cách `TourList.tsx` đang làm.
 */
const SAMPLE_SIZE = 200;

/**
 * Duyệt tour đang PENDING_APPROVAL — chỉ còn 1 danh sách (đã bỏ tab "Đã duyệt"; Ẩn tour giờ
 * nằm trực tiếp trên Danh sách Tour, xem `vendor-manager/tours/pages/TourList.tsx`).
 */
export default function TourApprovals() {
  const [page, setPage] = useState(1);
  const [approveTarget, setApproveTarget] = useState<VendorTourListItem | null>(null);
  const [rejectTarget, setRejectTarget] = useState<VendorTourListItem | null>(null);

  const { data, isLoading, isError, error } = useVendorTourList({}, 1, SAMPLE_SIZE);
  const { data: stats } = useVendorTourStats();
  const { approveTour, rejectTour } = useVendorTourMutations();

  const allTours = data?.tours ?? [];
  const pendingTours = allTours.filter((tour) => tour.status === 'PENDING_APPROVAL');
  const total = pendingTours.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const tours = pendingTours.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleApproveConfirm = () => {
    if (!approveTarget) return;
    approveTour.mutate(approveTarget.id, {
      onSuccess: () => {
        setApproveTarget(null);
        toast.success('Đã duyệt tour.');
      },
      onError: (err) => toast.error(err instanceof Error ? err.message : 'Không thể duyệt tour.'),
    });
  };

  const handleRejectConfirm = (reason: string) => {
    if (!rejectTarget) return;
    rejectTour.mutate(
      { tourId: rejectTarget.id, reason },
      {
        onSuccess: () => {
          setRejectTarget(null);
          toast.success('Đã từ chối tour.');
        },
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : 'Không thể từ chối tour.'),
      }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-2xl sm:text-3xl font-extrabold tracking-tight"
          style={{ color: '#06261D' }}
        >
          Duyệt tour
        </h2>
        <p className="text-sm font-medium mt-1" style={{ color: '#6F7B75' }}>
          Xét duyệt tour do nhân viên gửi lên.
        </p>
      </div>

      <div
        className="overflow-hidden rounded-3xl bg-white shadow-sm"
        style={{ border: '1px solid #E6E2D1' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead style={{ backgroundColor: '#F0EEE6' }}>
              <tr>
                {['Tên tour', 'Giá', 'Độ khó', 'Ngày tạo', 'Thao tác'].map((col) => (
                  <th
                    key={col}
                    className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider"
                    style={{ color: '#06261D' }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-16 text-center text-sm"
                    style={{ color: '#6F7B75' }}
                  >
                    Đang tải danh sách tour...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-16 text-center text-sm"
                    style={{ color: '#DC2626' }}
                  >
                    Không thể tải danh sách tour:{' '}
                    {error instanceof Error ? error.message : 'Lỗi không xác định'}
                  </td>
                </tr>
              ) : tours.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-16 text-center text-sm"
                    style={{ color: '#6F7B75' }}
                  >
                    Không có tour nào đang chờ duyệt.
                  </td>
                </tr>
              ) : (
                tours.map((tour) => (
                  <TourApprovalTableRow
                    key={tour.id}
                    tour={tour}
                    onApproveClick={setApproveTarget}
                    onRejectClick={setRejectTarget}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        <TourPagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalCount={total}
          pageSize={PAGE_SIZE}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-3xl p-6" style={{ backgroundColor: '#06261D' }}>
          <p className="text-xs font-bold uppercase" style={{ color: '#A9B8B2' }}>
            Đang chờ duyệt
          </p>
          <p className="mt-1 text-3xl font-extrabold text-white">{stats?.pendingApproval ?? '—'}</p>
          <p className="mt-1 text-sm font-medium" style={{ color: '#A2EBD2' }}>
            Cần xử lý ngay
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6" style={{ border: '1px solid #E6E2D1' }}>
          <p className="text-xs font-bold uppercase" style={{ color: '#6F7B75' }}>
            Đã duyệt
          </p>
          <p className="mt-1 text-3xl font-extrabold" style={{ color: '#06261D' }}>
            {stats?.approved ?? '—'}
          </p>
          <p className="mt-1 text-sm font-medium" style={{ color: '#16A34A' }}>
            Đang nhận khách
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6" style={{ border: '1px solid #E6E2D1' }}>
          <p className="text-xs font-bold uppercase" style={{ color: '#6F7B75' }}>
            Bị từ chối
          </p>
          <p className="mt-1 text-3xl font-extrabold" style={{ color: '#06261D' }}>
            {stats?.rejected ?? '—'}
          </p>
          <p className="mt-1 text-sm font-medium" style={{ color: '#DC2626' }}>
            Cần nhân viên chỉnh sửa lại
          </p>
        </div>
      </div>

      <ApproveTourConfirmDialog
        open={approveTarget !== null}
        onOpenChange={(open) => !open && setApproveTarget(null)}
        tourName={approveTarget?.name ?? ''}
        onConfirm={handleApproveConfirm}
        isPending={approveTour.isPending}
      />

      <TourReasonDialog
        open={rejectTarget !== null}
        onOpenChange={(open) => !open && setRejectTarget(null)}
        icon={X}
        iconColor="#DC2626"
        iconBgColor="rgba(220, 38, 38, 0.1)"
        title="Từ chối tour"
        description={`Từ chối tour "${rejectTarget?.name ?? ''}"? Vui lòng nhập lý do để nhân viên biết cách chỉnh sửa lại.`}
        placeholder="Vd: Lịch trình chưa rõ ràng, thiếu ảnh minh họa..."
        confirmLabel="Từ chối"
        confirmPendingLabel="Đang từ chối..."
        onConfirm={handleRejectConfirm}
        isPending={rejectTour.isPending}
      />
    </div>
  );
}
