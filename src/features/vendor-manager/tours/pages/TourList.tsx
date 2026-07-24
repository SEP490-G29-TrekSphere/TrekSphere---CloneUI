import { Filter } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVendorManagerTourEditPath, PATHS } from '@/constants';
import { DeleteTourConfirmDialog } from '@/features/vendor-tours/components/DeleteTourConfirmDialog';
import { TourPagination } from '@/features/vendor-tours/components/TourPagination';
import { TourTableRow } from '@/features/vendor-tours/components/TourTableRow';
import { useVendorTourList } from '@/features/vendor-tours/hooks/useVendorTourList';
import { useVendorTourMutations } from '@/features/vendor-tours/hooks/useVendorTourMutations';
import { useVendorTourStats } from '@/features/vendor-tours/hooks/useVendorTourStats';
import type { ApiDifficulty, ApiStatus, VendorTourListItem } from '@/features/vendor-tours/types';
import { useDebounce } from '@/shared/hooks';
import { toast } from '@/store/useToastStore';

const PAGE_SIZE = 10;
/**
 * `GET /vendor/tours` không hỗ trợ lọc theo difficulty/status phía server
 * (đã xác nhận qua Swagger). Khi 1 trong 2 filter này đang active, chuyển
 * sang tải 1 mẻ lớn rồi lọc + phân trang phía client.
 */
const CLIENT_FILTER_SAMPLE_SIZE = 200;

const DIFFICULTY_OPTIONS: Array<{ value: ApiDifficulty | ''; label: string }> = [
  { value: '', label: 'Tất cả' },
  { value: 'EASY', label: 'Dễ' },
  { value: 'MODERATE', label: 'Trung bình' },
  { value: 'HARD', label: 'Khó' },
];

const STATUS_OPTIONS: Array<{ value: ApiStatus | ''; label: string }> = [
  { value: '', label: 'Tất cả' },
  { value: 'DRAFT', label: 'Bản nháp' },
  { value: 'PENDING_APPROVAL', label: 'Đang chờ duyệt' },
  { value: 'APPROVED', label: 'Đã duyệt' },
  { value: 'REJECTED', label: 'Bị từ chối' },
  { value: 'HIDDEN', label: 'Đã ẩn' },
];

export default function TourList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [nameFilter, setNameFilter] = useState('');
  const [difficulty, setDifficulty] = useState<ApiDifficulty | ''>('');
  const [status, setStatus] = useState<ApiStatus | ''>('');
  const [deleteTarget, setDeleteTarget] = useState<VendorTourListItem | null>(null);

  const debouncedName = useDebounce(nameFilter, 400);
  const hasClientFilter = Boolean(difficulty || status);

  // biome-ignore lint/correctness/useExhaustiveDependencies: chỉ cần trigger reset khi filter đổi
  useEffect(() => {
    setPage(1);
  }, [debouncedName, difficulty, status]);

  const filter = useMemo(() => ({ search: debouncedName || undefined }), [debouncedName]);
  const fetchPage = hasClientFilter ? 1 : page;
  const fetchSize = hasClientFilter ? CLIENT_FILTER_SAMPLE_SIZE : PAGE_SIZE;

  const { data, isLoading, isError, error } = useVendorTourList(filter, fetchPage, fetchSize);
  const { data: stats } = useVendorTourStats();
  const { deleteTour } = useVendorTourMutations();

  const fetchedTours = data?.tours ?? [];
  const filteredTours = hasClientFilter
    ? fetchedTours.filter(
        (tour) =>
          (!difficulty || tour.difficulty === difficulty) && (!status || tour.status === status)
      )
    : fetchedTours;

  const total = hasClientFilter ? filteredTours.length : (data?.total ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const tours = hasClientFilter
    ? filteredTours.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    : filteredTours;

  // BE chưa có API duyệt/từ chối tour — 2 nút này tạm thời chỉ là placeholder,
  // giống cách nút Sửa từng làm trước khi có API thật.
  const handleApprovePlaceholder = () => {
    toast.info('Chức năng duyệt tour đang phát triển.');
  };
  const handleRejectPlaceholder = () => {
    toast.info('Chức năng từ chối tour đang phát triển.');
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteTour.mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
        toast.success('Đã xóa tour.');
      },
      onError: (err) => toast.error(err instanceof Error ? err.message : 'Không thể xóa tour.'),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight" style={{ color: '#06261D' }}>
            Danh sách Tour
          </h2>
          <p className="text-sm font-medium mt-1" style={{ color: '#6F7B75' }}>
            Quản lý các chương trình tour và hành trình của bạn.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate(PATHS.VENDOR_MANAGER_TOUR_CREATE)}
          className="inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold text-white"
          style={{ backgroundColor: '#06261D' }}
        >
          + Thêm tour mới
        </button>
      </div>

      <div
        className="flex flex-col md:flex-row md:items-center gap-4 rounded-3xl px-6 py-4"
        style={{ backgroundColor: '#F0EEE6' }}
      >
        <div className="relative flex-1">
          <span
            className="absolute inset-y-0 left-4 flex items-center"
            style={{ color: '#6F7B75' }}
          >
            <Filter className="h-4 w-4" />
          </span>
          <input
            type="text"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            placeholder="Lọc theo tên tour..."
            aria-label="Lọc theo tên tour"
            className="w-full rounded-full border-none py-2.5 pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-1"
            style={{ backgroundColor: '#FFFFFF', color: '#06261D' }}
          />
        </div>

        <label
          className="flex items-center gap-2 text-xs font-bold uppercase"
          style={{ color: '#6F7B75' }}
        >
          Độ khó:
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as ApiDifficulty | '')}
            className="rounded-full border-none px-4 py-2 text-sm font-semibold focus:outline-none"
            style={{ backgroundColor: '#FFFFFF', color: '#06261D' }}
          >
            {DIFFICULTY_OPTIONS.map((opt) => (
              <option key={opt.value || 'all'} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label
          className="flex items-center gap-2 text-xs font-bold uppercase"
          style={{ color: '#6F7B75' }}
        >
          Trạng thái:
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ApiStatus | '')}
            className="rounded-full border-none px-4 py-2 text-sm font-semibold focus:outline-none"
            style={{ backgroundColor: '#FFFFFF', color: '#06261D' }}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value || 'all'} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div
        className="overflow-hidden rounded-3xl bg-white shadow-sm"
        style={{ border: '1px solid #E6E2D1' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: '#F0EEE6' }}>
              <tr>
                {['Tên tour', 'Giá', 'Độ khó', 'Trạng thái', 'Thao tác'].map((col) => (
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
                    Không có tour nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                tours.map((tour) => (
                  <TourTableRow
                    key={tour.id}
                    tour={tour}
                    editPath={getVendorManagerTourEditPath(tour.id)}
                    onDeleteClick={setDeleteTarget}
                    onApproveClick={handleApprovePlaceholder}
                    onRejectClick={handleRejectPlaceholder}
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
            Tổng số tour
          </p>
          <p className="mt-1 text-3xl font-extrabold text-white">{stats?.total ?? '—'}</p>
          <p className="mt-1 text-sm font-medium" style={{ color: '#A2EBD2' }}>
            Tất cả tour bạn quản lý
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6" style={{ border: '1px solid #E6E2D1' }}>
          <p className="text-xs font-bold uppercase" style={{ color: '#6F7B75' }}>
            Đang chờ duyệt
          </p>
          <p className="mt-1 text-3xl font-extrabold" style={{ color: '#06261D' }}>
            {stats?.pendingApproval ?? '—'}
          </p>
          <p className="mt-1 text-sm font-medium" style={{ color: '#DC2626' }}>
            Cần xử lý ngay
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6" style={{ border: '1px solid #E6E2D1' }}>
          <p className="text-xs font-bold uppercase" style={{ color: '#6F7B75' }}>
            Tour hoạt động
          </p>
          <p className="mt-1 text-3xl font-extrabold" style={{ color: '#06261D' }}>
            {stats?.approved ?? '—'}
          </p>
          <p className="mt-1 text-sm font-medium" style={{ color: '#16A34A' }}>
            Đang nhận khách
          </p>
        </div>
      </div>

      <DeleteTourConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        tourName={deleteTarget?.name ?? ''}
        onConfirm={handleDeleteConfirm}
        isPending={deleteTour.isPending}
      />
    </div>
  );
}
