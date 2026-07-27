import { Filter } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { getPrimaryRole, ROLES } from '@/constants';
import { useDebounce } from '@/shared/hooks';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';
import { DeleteEquipmentConfirmDialog } from '../components/DeleteEquipmentConfirmDialog';
import { EquipmentFormDialog } from '../components/EquipmentFormDialog';
import { EquipmentPagination } from '../components/EquipmentPagination';
import { EquipmentTableRow } from '../components/EquipmentTableRow';
import { useVendorEquipmentList } from '../hooks/useVendorEquipmentList';
import { useVendorEquipmentMutations } from '../hooks/useVendorEquipmentMutations';
import { useVendorEquipmentSummary } from '../hooks/useVendorEquipmentSummary';
import type { CreateVendorEquipmentPayload, VendorEquipmentItem } from '../types';

const PAGE_SIZE = 10;

/** Danh sách dụng cụ trong kho — dùng chung cho Vendor Manager và Vendor Staff. */
export default function EquipmentList() {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [formTarget, setFormTarget] = useState<VendorEquipmentItem | 'create' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VendorEquipmentItem | null>(null);
  const debouncedKeyword = useDebounce(keyword, 400);

  // Chỉ Vendor Manager được phép xóa dụng cụ khỏi kho — Vendor Staff không thấy nút Xóa.
  const user = useAppStore((state) => state.user);
  const canDelete = getPrimaryRole(user?.roles) === ROLES.VENDOR_MANAGER;

  // biome-ignore lint/correctness/useExhaustiveDependencies: debouncedKeyword chỉ dùng để trigger effect
  useEffect(() => {
    setPage(1);
  }, [debouncedKeyword]);

  const filter = useMemo(() => ({ search: debouncedKeyword || undefined }), [debouncedKeyword]);

  const { data, isLoading, isError, error } = useVendorEquipmentList(filter, page, PAGE_SIZE);
  const { data: summary } = useVendorEquipmentSummary();
  const { createEquipment, updateEquipment, deleteEquipment } = useVendorEquipmentMutations();

  const equipments = data?.equipments ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const isEditing = formTarget !== null && formTarget !== 'create';
  const isFormPending = createEquipment.isPending || updateEquipment.isPending;

  const handleFormSubmit = (payload: CreateVendorEquipmentPayload) => {
    if (isEditing) {
      updateEquipment.mutate(
        { id: formTarget.id, payload },
        {
          onSuccess: () => {
            setFormTarget(null);
            toast.success('Đã cập nhật dụng cụ.');
          },
          onError: (err) =>
            toast.error(err instanceof Error ? err.message : 'Không thể cập nhật dụng cụ.'),
        }
      );
    } else {
      createEquipment.mutate(payload, {
        onSuccess: () => {
          setFormTarget(null);
          toast.success('Đã thêm dụng cụ mới.');
        },
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : 'Không thể thêm dụng cụ.'),
      });
    }
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteEquipment.mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
        toast.success('Đã xóa dụng cụ khỏi kho.');
      },
      onError: (err) => toast.error(err instanceof Error ? err.message : 'Không thể xóa dụng cụ.'),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight" style={{ color: '#06261D' }}>
            Danh sách Dụng cụ
          </h2>
          <p className="text-sm font-medium mt-1" style={{ color: '#6F7B75' }}>
            Quản lý dụng cụ trekking và theo dõi số lượng tồn kho trong kho của bạn.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setFormTarget('create')}
          className="inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold text-white"
          style={{ backgroundColor: '#06261D' }}
        >
          + Thêm dụng cụ mới
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-3xl p-6" style={{ backgroundColor: '#06261D' }}>
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#A9B8B2' }}>
            Tổng số dụng cụ
          </p>
          <p className="mt-1 text-3xl font-extrabold text-white">{summary?.totalItems ?? total}</p>
          <p className="mt-1 text-sm font-medium" style={{ color: '#A2EBD2' }}>
            Loại dụng cụ đang quản lý trong kho
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6" style={{ border: '1px solid #E6E2D1' }}>
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#6F7B75' }}>
            Tổng số lượng tồn kho
          </p>
          <p className="mt-1 text-3xl font-extrabold" style={{ color: '#06261D' }}>
            {summary?.totalQuantity ?? '—'}
          </p>
          <p className="mt-1 text-sm font-medium" style={{ color: '#6F7B75' }}>
            Tổng số đơn vị dụng cụ hiện có trong kho
          </p>
        </div>
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
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm theo tên dụng cụ..."
            aria-label="Tìm theo tên dụng cụ"
            className="w-full rounded-full border-none py-2.5 pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-1"
            style={{ backgroundColor: '#FFFFFF', color: '#06261D' }}
          />
        </div>
      </div>

      <div
        className="overflow-hidden rounded-3xl bg-white shadow-sm"
        style={{ border: '1px solid #E6E2D1' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: '#F0EEE6' }}>
              <tr>
                {['Tên dụng cụ', 'Mô tả', 'Số lượng', 'Ngày tạo', 'Thao tác'].map((col, i) => (
                  <th
                    key={col}
                    className={`px-6 py-4 text-xs font-bold uppercase tracking-wider ${i === 4 ? 'text-right' : 'text-left'}`}
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
                    Đang tải danh sách dụng cụ...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-16 text-center text-sm"
                    style={{ color: '#DC2626' }}
                  >
                    Không thể tải danh sách dụng cụ:{' '}
                    {error instanceof Error ? error.message : 'Lỗi không xác định'}
                  </td>
                </tr>
              ) : equipments.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-16 text-center text-sm"
                    style={{ color: '#6F7B75' }}
                  >
                    Không có dụng cụ nào phù hợp với từ khóa tìm kiếm hiện tại.
                  </td>
                </tr>
              ) : (
                equipments.map((equipment) => (
                  <EquipmentTableRow
                    key={equipment.id}
                    equipment={equipment}
                    onEditClick={setFormTarget}
                    onDeleteClick={canDelete ? setDeleteTarget : undefined}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        <EquipmentPagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalCount={total}
          pageSize={PAGE_SIZE}
        />
      </div>

      <EquipmentFormDialog
        open={formTarget !== null}
        onOpenChange={(open) => !open && setFormTarget(null)}
        mode={isEditing ? 'edit' : 'create'}
        defaultValues={
          isEditing
            ? {
                equipmentName: formTarget.name,
                description: formTarget.description,
                totalQuantity: formTarget.totalQuantity,
              }
            : undefined
        }
        isPending={isFormPending}
        onSubmit={handleFormSubmit}
      />

      <DeleteEquipmentConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        equipmentName={deleteTarget?.name ?? ''}
        onConfirm={handleDeleteConfirm}
        isPending={deleteEquipment.isPending}
      />
    </div>
  );
}
