import { Search, UserRoundCheck, UserRoundX, UsersRound } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPrimaryRole, PATHS, ROLES } from '@/constants';
import { useDebounce } from '@/shared/hooks';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';
import { DeletePorterConfirmDialog } from '../components/DeletePorterConfirmDialog';
import { PorterPagination } from '../components/PorterPagination';
import { PorterTableRow } from '../components/PorterTableRow';
import { useVendorPorterList } from '../hooks/useVendorPorterList';
import { useVendorPorterMutations } from '../hooks/useVendorPorterMutations';
import { useVendorPorterSummary } from '../hooks/useVendorPorterSummary';
import type { VendorPorterItem } from '../types';

const PAGE_SIZE = 10;

/** Danh sách hồ sơ porter — dùng chung cho Vendor Manager và Vendor Staff. */
export default function PorterList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<VendorPorterItem | null>(null);
  const debouncedKeyword = useDebounce(keyword, 400);

  const user = useAppStore((state) => state.user);
  const isManager = getPrimaryRole(user?.roles) === ROLES.VENDOR_MANAGER;
  const createPath = isManager ? PATHS.VENDOR_MANAGER_PORTER_CREATE : PATHS.PARTNER_PORTER_CREATE;
  const editPathTemplate = isManager ? PATHS.VENDOR_MANAGER_PORTER_EDIT : PATHS.PARTNER_PORTER_EDIT;

  // biome-ignore lint/correctness/useExhaustiveDependencies: debouncedKeyword chỉ dùng để trigger effect
  useEffect(() => {
    setPage(1);
  }, [debouncedKeyword]);

  const filter = useMemo(() => ({ search: debouncedKeyword || undefined }), [debouncedKeyword]);

  const { data, isLoading, isError, error } = useVendorPorterList(filter, page, PAGE_SIZE);
  const { data: summary } = useVendorPorterSummary();
  const { deletePorter } = useVendorPorterMutations();

  const porters = data?.porters ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleEditClick = (porter: VendorPorterItem) => {
    navigate(editPathTemplate.replace(':id', porter.id), { state: { porter } });
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deletePorter.mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
        toast.success('Đã xóa hồ sơ porter.');
      },
      onError: (err) => toast.error(err instanceof Error ? err.message : 'Không thể xóa porter.'),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h2
            className="text-2xl sm:text-3xl font-extrabold tracking-tight"
            style={{ color: '#06261D' }}
          >
            Quản lý Porter
          </h2>
          <p className="text-sm font-medium mt-1" style={{ color: '#6F7B75' }}>
            Theo dõi và quản lý nhân sự dẫn đường tại các điểm tour.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate(createPath)}
          className="inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold text-white"
          style={{ backgroundColor: '#06261D' }}
        >
          + Thêm Porter mới
        </button>
      </div>

      <div className="relative">
        <span className="absolute inset-y-0 left-5 flex items-center" style={{ color: '#6F7B75' }}>
          <Search className="h-4 w-4" />
        </span>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Tìm kiếm porter, khu vực..."
          aria-label="Tìm kiếm porter"
          className="w-full rounded-full border-none py-3 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-1"
          style={{ backgroundColor: '#F0EEE6', color: '#06261D' }}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div
          className="flex items-center gap-4 rounded-3xl p-6"
          style={{ backgroundColor: '#F0EEE6' }}
        >
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: '#E6E2D1' }}
          >
            <UsersRound className="h-5 w-5" style={{ color: '#06261D' }} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#6F7B75' }}>
              Tổng số Porter
            </p>
            <p className="mt-1 text-2xl font-extrabold" style={{ color: '#06261D' }}>
              {summary?.total ?? total}
            </p>
          </div>
        </div>

        <div
          className="flex items-center gap-4 rounded-3xl p-6"
          style={{ backgroundColor: '#F0EEE6' }}
        >
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: 'rgba(22, 163, 74, 0.15)' }}
          >
            <UserRoundCheck className="h-5 w-5" style={{ color: '#16A34A' }} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#6F7B75' }}>
              Đang hoạt động
            </p>
            <p className="mt-1 text-2xl font-extrabold" style={{ color: '#06261D' }}>
              {summary?.active ?? '—'}
            </p>
          </div>
        </div>

        <div
          className="flex items-center gap-4 rounded-3xl p-6"
          style={{ backgroundColor: '#F0EEE6' }}
        >
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: '#E6E2D1' }}
          >
            <UserRoundX className="h-5 w-5" style={{ color: '#6F7B75' }} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#6F7B75' }}>
              Ngừng hoạt động
            </p>
            <p className="mt-1 text-2xl font-extrabold" style={{ color: '#06261D' }}>
              {summary?.inactive ?? '—'}
            </p>
          </div>
        </div>
      </div>

      <div
        className="overflow-hidden rounded-3xl bg-white shadow-sm"
        style={{ border: '1px solid #E6E2D1' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead style={{ backgroundColor: '#F0EEE6' }}>
              <tr>
                {['Porter', 'Số điện thoại', 'Trạng thái', 'Thao tác'].map((col, i) => (
                  <th
                    key={col}
                    className={`px-6 py-4 text-xs font-bold uppercase tracking-wider ${i === 3 ? 'text-right' : 'text-left'}`}
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
                    colSpan={4}
                    className="px-6 py-16 text-center text-sm"
                    style={{ color: '#6F7B75' }}
                  >
                    Đang tải danh sách porter...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-16 text-center text-sm"
                    style={{ color: '#DC2626' }}
                  >
                    Không thể tải danh sách porter:{' '}
                    {error instanceof Error ? error.message : 'Lỗi không xác định'}
                  </td>
                </tr>
              ) : porters.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-16 text-center text-sm"
                    style={{ color: '#6F7B75' }}
                  >
                    Không có porter nào phù hợp với từ khóa tìm kiếm hiện tại.
                  </td>
                </tr>
              ) : (
                porters.map((porter) => (
                  <PorterTableRow
                    key={porter.id}
                    porter={porter}
                    onEditClick={handleEditClick}
                    onDeleteClick={isManager ? setDeleteTarget : undefined}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        <PorterPagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalCount={total}
          pageSize={PAGE_SIZE}
        />
      </div>

      <DeletePorterConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        porterName={deleteTarget?.fullName ?? ''}
        onConfirm={handleDeleteConfirm}
        isPending={deletePorter.isPending}
      />
    </div>
  );
}
