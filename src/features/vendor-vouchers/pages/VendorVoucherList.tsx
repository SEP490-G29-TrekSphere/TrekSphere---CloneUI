import {
  Activity,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Calendar,
  ChevronLeft,
  ChevronRight,
  FilterX,
  Layers,
  Pencil,
  Search,
  Ticket,
  Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useDebounce } from '@/shared/hooks';
import { AppBadge, AppDatePicker, AppEmptyState, AppSpinner } from '@/shared/ui';
import { toast } from '@/store/useToastStore';
import { formatDate, formatPrice } from '@/utils/format';
import { ConfirmDeleteDialog } from '../components/ConfirmDeleteDialog';
import { CreateVoucherDialog } from '../components/CreateVoucherDialog';
import { EditVoucherDialog } from '../components/EditVoucherDialog';
import { useCreateVoucher } from '../hooks/useCreateVoucher';
import { useDeleteVoucher } from '../hooks/useDeleteVoucher';
import { useUpdateVoucher } from '../hooks/useUpdateVoucher';
import { useVendorVouchers } from '../hooks/useVendorVouchers';
import type {
  CreateVoucherRequest,
  UpdateVoucherRequest,
  VendorVoucherFilter,
  VoucherDiscountType,
  VoucherResponse,
  VoucherStatus,
} from '../types';

const PAGE_SIZE = 10;

export default function VendorVoucherList() {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [discountType, setDiscountType] = useState<VoucherDiscountType | 'ALL'>('ALL');
  const [status, setStatus] = useState<VoucherStatus | 'ALL'>('ALL');
  const [validUntil, setValidUntil] = useState('');
  const [maxUsage, setMaxUsage] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<VoucherResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VoucherResponse | null>(null);

  const debouncedKeyword = useDebounce(keyword, 400);

  const createVoucherMutation = useCreateVoucher();
  const updateVoucherMutation = useUpdateVoucher();
  const deleteVoucherMutation = useDeleteVoucher();

  // Reset to page 1 when any filter changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: Reset page on filter changes
  useEffect(() => {
    setPage(1);
  }, [debouncedKeyword, discountType, status, validUntil, maxUsage]);

  const activeFilter: VendorVoucherFilter = useMemo(() => {
    const f: VendorVoucherFilter = {
      page: page - 1, // API is 0-indexed
      size: PAGE_SIZE,
      sortBy,
      sortDir,
    };

    if (debouncedKeyword.trim()) {
      f.keyword = debouncedKeyword.trim();
    }
    if (discountType !== 'ALL') {
      f.discountType = discountType;
    }
    if (status !== 'ALL') {
      f.status = status;
    }
    if (validUntil) {
      f.validUntil = validUntil;
    }
    if (maxUsage && !Number.isNaN(Number(maxUsage))) {
      f.maxUsage = Number(maxUsage);
    }

    return f;
  }, [page, debouncedKeyword, discountType, status, validUntil, maxUsage, sortBy, sortDir]);

  const { data, isLoading, isError, error } = useVendorVouchers(activeFilter);

  const vouchers = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDir('desc');
    }
    setPage(1);
  };

  const handleResetFilters = () => {
    setKeyword('');
    setDiscountType('ALL');
    setStatus('ALL');
    setValidUntil('');
    setMaxUsage('');
    setSortBy('createdAt');
    setSortDir('desc');
    setPage(1);
  };

  const renderSortIcon = (field: string) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="ml-1 h-3.5 w-3.5 opacity-50 inline" />;
    }
    return sortDir === 'asc' ? (
      <ArrowUp className="ml-1 h-3.5 w-3.5 text-primary inline" />
    ) : (
      <ArrowDown className="ml-1 h-3.5 w-3.5 text-primary inline" />
    );
  };

  const getStatusBadge = (voucherStatus: VoucherStatus) => {
    switch (voucherStatus) {
      case 'ACTIVE':
        return (
          <AppBadge className="bg-emerald-50 text-emerald-700 border-emerald-200">
            Hoạt động
          </AppBadge>
        );
      case 'INACTIVE':
        return <AppBadge variant="secondary">Tạm dừng</AppBadge>;
      case 'EXPIRED':
        return <AppBadge variant="destructive">Hết hạn</AppBadge>;
      default:
        return <AppBadge variant="outline">{voucherStatus}</AppBadge>;
    }
  };

  const handleCreateSubmit = (payload: CreateVoucherRequest) => {
    createVoucherMutation.mutate(payload, {
      onSuccess: () => {
        setCreateOpen(false);
        toast.success('Đã tạo mã giảm giá mới.');
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : 'Không thể tạo mã giảm giá.');
      },
    });
  };

  const handleEditSubmit = (payload: UpdateVoucherRequest) => {
    if (!editTarget) return;
    updateVoucherMutation.mutate(
      { id: editTarget.voucherId, data: payload },
      {
        onSuccess: () => {
          setEditTarget(null);
          toast.success('Đã cập nhật thông tin voucher.');
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : 'Không thể cập nhật voucher.');
        },
      }
    );
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteVoucherMutation.mutate(deleteTarget.voucherId, {
      onSuccess: () => {
        setDeleteTarget(null);
        toast.success('Đã xóa mã giảm giá.');
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : 'Không thể xóa mã giảm giá.');
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight" style={{ color: '#06261D' }}>
            Quản lý Voucher
          </h2>
          <p className="text-sm font-medium mt-1" style={{ color: '#6F7B75' }}>
            Xem, tìm kiếm và lọc danh sách các mã giảm giá của doanh nghiệp.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ backgroundColor: '#06261D' }}
        >
          + Tạo Voucher mới
        </button>
      </div>

      {/* Filter Bar */}
      <div
        className="bg-white rounded-3xl p-6 shadow-sm border space-y-4"
        style={{ borderColor: '#E6E2D1' }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Keyword Search */}
          <div className="lg:col-span-2 relative">
            <span
              className="absolute inset-y-0 left-4 flex items-center"
              style={{ color: '#6F7B75' }}
            >
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm theo mã voucher..."
              aria-label="Tìm kiếm voucher"
              className="w-full rounded-full border-none py-2.5 pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-1"
              style={{ backgroundColor: '#F0EEE6', color: '#06261D' }}
            />
          </div>

          {/* Discount Type */}
          <div className="relative">
            <span
              className="absolute inset-y-0 left-4 flex items-center"
              style={{ color: '#6F7B75' }}
            >
              <Layers className="h-4 w-4" />
            </span>
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as VoucherDiscountType | 'ALL')}
              aria-label="Loại giảm giá"
              className="w-full rounded-full border-none py-2.5 pl-10 pr-8 text-sm font-medium appearance-none focus:outline-none focus:ring-1"
              style={{ backgroundColor: '#F0EEE6', color: '#06261D' }}
            >
              <option value="ALL">Tất cả loại</option>
              <option value="PERCENTAGE">Phần trăm (%)</option>
              <option value="FIXED_AMOUNT">Số tiền cố định</option>
            </select>
          </div>

          {/* Status */}
          <div className="relative">
            <span
              className="absolute inset-y-0 left-4 flex items-center"
              style={{ color: '#6F7B75' }}
            >
              <Activity className="h-4 w-4" />
            </span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as VoucherStatus | 'ALL')}
              aria-label="Trạng thái"
              className="w-full rounded-full border-none py-2.5 pl-10 pr-8 text-sm font-medium appearance-none focus:outline-none focus:ring-1"
              style={{ backgroundColor: '#F0EEE6', color: '#06261D' }}
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Hoạt động</option>
              <option value="INACTIVE">Tạm dừng</option>
              <option value="EXPIRED">Hết hạn</option>
            </select>
          </div>

          {/* Valid Until */}
          <div className="relative">
            <span
              className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10"
              style={{ color: '#6F7B75' }}
            >
              <Calendar className="h-4 w-4" />
            </span>
            <AppDatePicker
              selected={validUntil ? new Date(validUntil) : null}
              onChange={(date: Date | null) => {
                if (!date) {
                  setValidUntil('');
                  return;
                }
                const offset = date.getTimezoneOffset();
                const localDate = new Date(date.getTime() - offset * 60 * 1000);
                setValidUntil(localDate.toISOString().split('T')[0]);
              }}
              placeholderText="Hạn dùng trước ngày"
              className="w-full rounded-full !border-none !h-auto !bg-[#F0EEE6] py-2.5 pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-1 cursor-pointer"
            />
          </div>

          {/* Max Usage Limit */}
          <div>
            <input
              type="number"
              value={maxUsage}
              onChange={(e) => setMaxUsage(e.target.value)}
              placeholder="Lượt dùng tối đa..."
              aria-label="Số lượt dùng tối đa"
              min="0"
              className="w-full rounded-full border-none py-2.5 px-4 text-sm font-medium focus:outline-none focus:ring-1"
              style={{ backgroundColor: '#F0EEE6', color: '#06261D' }}
            />
          </div>
        </div>

        {/* Clear filter and sort visual indicator */}
        {(keyword ||
          discountType !== 'ALL' ||
          status !== 'ALL' ||
          validUntil ||
          maxUsage ||
          sortBy !== 'createdAt' ||
          sortDir !== 'desc') && (
          <div
            className="flex items-center justify-between border-t pt-3"
            style={{ borderColor: '#E6E2D1' }}
          >
            <span className="text-xs font-semibold" style={{ color: '#6F7B75' }}>
              Đang áp dụng bộ lọc/sắp xếp tùy chỉnh
            </span>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 text-xs font-bold transition-all hover:opacity-80"
              style={{ color: '#06261D' }}
            >
              <FilterX className="h-3.5 w-3.5" />
              Xóa bộ lọc
            </button>
          </div>
        )}
      </div>

      {/* Main Table */}
      <div
        className="overflow-hidden rounded-3xl bg-white shadow-sm"
        style={{ border: '1px solid #E6E2D1' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: '#F0EEE6' }}>
              <tr>
                <th
                  onClick={() => handleSort('code')}
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-left cursor-pointer hover:bg-[#E6E2D1] transition-colors"
                  style={{ color: '#06261D' }}
                >
                  Mã Voucher {renderSortIcon('code')}
                </th>
                <th
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-left"
                  style={{ color: '#06261D' }}
                >
                  Loại giảm giá
                </th>
                <th
                  onClick={() => handleSort('discountValue')}
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-left cursor-pointer hover:bg-[#E6E2D1] transition-colors"
                  style={{ color: '#06261D' }}
                >
                  Mức giảm {renderSortIcon('discountValue')}
                </th>
                <th
                  onClick={() => handleSort('minOrderValue')}
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-left cursor-pointer hover:bg-[#E6E2D1] transition-colors"
                  style={{ color: '#06261D' }}
                >
                  Đơn tối thiểu {renderSortIcon('minOrderValue')}
                </th>
                <th
                  onClick={() => handleSort('validUntil')}
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-left cursor-pointer hover:bg-[#E6E2D1] transition-colors"
                  style={{ color: '#06261D' }}
                >
                  Hạn sử dụng {renderSortIcon('validUntil')}
                </th>
                <th
                  onClick={() => handleSort('usedCount')}
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-left cursor-pointer hover:bg-[#E6E2D1] transition-colors"
                  style={{ color: '#06261D' }}
                >
                  Đã dùng / Giới hạn {renderSortIcon('usedCount')}
                </th>
                <th
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center"
                  style={{ color: '#06261D' }}
                >
                  Trạng thái
                </th>
                <th
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right"
                  style={{ color: '#06261D' }}
                >
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E2D1]">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-16 text-center text-sm"
                    style={{ color: '#6F7B75' }}
                  >
                    <div className="flex flex-col items-center justify-center gap-3">
                      <AppSpinner size="lg" />
                      <span>Đang tải danh sách mã giảm giá...</span>
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-sm text-red-600">
                    Không thể tải danh sách mã giảm giá:{' '}
                    {error instanceof Error ? error.message : 'Lỗi không xác định'}
                  </td>
                </tr>
              ) : vouchers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16">
                    <AppEmptyState
                      title="Không tìm thấy voucher nào"
                      description="Hãy thử thay đổi từ khóa hoặc bộ lọc để hiển thị kết quả mong muốn."
                    />
                  </td>
                </tr>
              ) : (
                vouchers.map((voucher) => {
                  const percentUsed =
                    voucher.maxUsage > 0 ? (voucher.usedCount / voucher.maxUsage) * 100 : 0;
                  return (
                    <tr key={voucher.voucherId} className="transition-colors hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Ticket className="h-4 w-4 text-primary shrink-0" />
                          <span
                            className="font-mono font-bold text-sm tracking-wide"
                            style={{ color: '#06261D' }}
                          >
                            {voucher.code}
                          </span>
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm"
                        style={{ color: '#6F7B75' }}
                      >
                        {voucher.discountType === 'PERCENTAGE' ? 'Giảm theo %' : 'Giảm trực tiếp'}
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm font-semibold"
                        style={{ color: '#06261D' }}
                      >
                        {voucher.discountType === 'PERCENTAGE'
                          ? `${voucher.discountValue}%`
                          : `${formatPrice(voucher.discountValue)}đ`}
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm"
                        style={{ color: '#6F7B75' }}
                      >
                        {formatPrice(voucher.minOrderValue)}đ
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm"
                        style={{ color: '#6F7B75' }}
                      >
                        <div className="flex flex-col text-xs">
                          <span>Từ: {formatDate(voucher.validFrom)}</span>
                          <span className="font-medium text-emerald-800">
                            Đến: {formatDate(voucher.validUntil)}
                          </span>
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm"
                        style={{ color: '#6F7B75' }}
                      >
                        <div className="flex flex-col w-32 gap-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="font-semibold text-primary">{voucher.usedCount}</span>
                            <span>/ {voucher.maxUsage} lượt</span>
                          </div>
                          {voucher.maxUsage > 0 && (
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="h-1.5 rounded-full transition-all duration-500"
                                style={{
                                  width: `${Math.min(100, percentUsed)}%`,
                                  backgroundColor:
                                    percentUsed >= 90
                                      ? '#DC2626'
                                      : percentUsed >= 70
                                        ? '#D97706'
                                        : '#16A34A',
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                        {getStatusBadge(voucher.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button
                          type="button"
                          onClick={() => setEditTarget(voucher)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
                          title="Sửa thông tin"
                        >
                          <Pencil className="h-4 w-4 text-slate-500" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(voucher)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-red-50 transition-colors ml-1"
                          title="Xóa voucher"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!isLoading && !isError && vouchers.length > 0 && (
          <div
            className="flex items-center justify-between px-6 py-5 border-t"
            style={{ borderColor: '#E6E2D1' }}
          >
            <p className="text-sm" style={{ color: '#6F7B75' }}>
              Hiển thị{' '}
              <span className="font-semibold" style={{ color: '#06261D' }}>
                {Math.min(totalElements, (page - 1) * PAGE_SIZE + 1)}
              </span>{' '}
              -{' '}
              <span className="font-semibold" style={{ color: '#06261D' }}>
                {Math.min(page * PAGE_SIZE, totalElements)}
              </span>{' '}
              trên tổng số{' '}
              <span className="font-semibold" style={{ color: '#06261D' }}>
                {totalElements}
              </span>{' '}
              voucher
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Trang trước"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="flex h-9 w-9 items-center justify-center rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed border"
                style={{ backgroundColor: '#FFFFFF', borderColor: '#E6E2D1', color: '#06261D' }}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                const isActive = p === page;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all"
                    style={
                      isActive
                        ? { backgroundColor: '#06261D', color: '#FFFFFF' }
                        : { backgroundColor: 'transparent', color: '#6F7B75' }
                    }
                  >
                    {p}
                  </button>
                );
              })}

              <button
                type="button"
                aria-label="Trang sau"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="flex h-9 w-9 items-center justify-center rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed border"
                style={{ backgroundColor: '#FFFFFF', borderColor: '#E6E2D1', color: '#06261D' }}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <CreateVoucherDialog
        open={isCreateOpen}
        onOpenChange={setCreateOpen}
        isPending={createVoucherMutation.isPending}
        onSubmit={handleCreateSubmit}
      />

      <EditVoucherDialog
        open={editTarget !== null}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
        voucher={editTarget}
        isPending={updateVoucherMutation.isPending}
        onSubmit={handleEditSubmit}
      />

      <ConfirmDeleteDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        voucher={deleteTarget}
        isPending={deleteVoucherMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
