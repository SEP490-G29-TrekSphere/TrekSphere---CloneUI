import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useDebounce } from '@/shared/hooks';
import { toast } from '@/store/useToastStore';
import { AddStaffDialog } from '../components/AddStaffDialog';
import { LockStaffConfirmDialog } from '../components/LockStaffConfirmDialog';
import { StaffPagination } from '../components/StaffPagination';
import { StaffTableRow } from '../components/StaffTableRow';
import { useVendorStaffList } from '../hooks/useVendorStaffList';
import { useVendorStaffLockedCount } from '../hooks/useVendorStaffLockedCount';
import { useVendorStaffMutations } from '../hooks/useVendorStaffMutations';
import type { VendorManagerLayoutContext, VendorStaffMember } from '../types';

const PAGE_SIZE = 10;

export default function StaffList() {
  const [page, setPage] = useState(1);
  const [isAddOpen, setAddOpen] = useState(false);
  const [lockTarget, setLockTarget] = useState<VendorStaffMember | null>(null);

  const { searchValue } = useOutletContext<VendorManagerLayoutContext>();
  const debouncedSearch = useDebounce(searchValue, 400);

  // biome-ignore lint/correctness/useExhaustiveDependencies: debouncedSearch chỉ dùng để trigger effect
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const filter = useMemo(() => ({ search: debouncedSearch }), [debouncedSearch]);

  const { data, isLoading, isError, error } = useVendorStaffList(filter, page, PAGE_SIZE);
  const { data: lockedCount } = useVendorStaffLockedCount();
  const { addStaff, setStatus } = useVendorStaffMutations();

  const staff = data?.staff ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleAddSubmit = (payload: { email: string; fullName?: string }) => {
    addStaff.mutate(payload, {
      onSuccess: () => {
        setAddOpen(false);
        toast.success('Đã thêm nhân viên.');
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : 'Không thể thêm nhân viên.');
      },
    });
  };

  const handleUnlock = (member: VendorStaffMember) => {
    setStatus.mutate(
      { staffId: member.id, isActive: true },
      {
        onSuccess: () => toast.success('Đã mở khóa nhân viên.'),
        onError: (err) => toast.error(err instanceof Error ? err.message : 'Không thể mở khóa.'),
      }
    );
  };

  const handleLockConfirm = () => {
    if (!lockTarget) return;
    setStatus.mutate(
      { staffId: lockTarget.id, isActive: false },
      {
        onSuccess: () => {
          setLockTarget(null);
          toast.success('Đã khóa nhân viên.');
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : 'Không thể khóa.'),
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-[#06261D] tracking-tight">
            Danh sách Nhân viên
          </h2>
          <p className="text-sm font-medium mt-1" style={{ color: '#6F7B75' }}>
            Hiện có {total} nhân viên đang trực thuộc hệ thống
          </p>
        </div>

        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold text-white"
          style={{ backgroundColor: '#06261D' }}
        >
          + Thêm nhân viên
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-[20px] bg-white p-6" style={{ border: '1px solid #E6E2D1' }}>
          <p className="text-xs font-bold uppercase" style={{ color: '#6F7B75' }}>
            Tổng nhân viên
          </p>
          <p className="text-2xl font-extrabold mt-1" style={{ color: '#06261D' }}>
            {total}
          </p>
        </div>
        <div className="rounded-[20px] bg-white p-6" style={{ border: '1px solid #E6E2D1' }}>
          <p className="text-xs font-bold uppercase" style={{ color: '#6F7B75' }}>
            Đã khóa
          </p>
          <p className="text-2xl font-extrabold mt-1" style={{ color: '#DC2626' }}>
            {lockedCount ?? 0}
          </p>
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
                {['Họ và tên', 'Email', 'Trạng thái', 'Thao tác'].map((col, i) => (
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
                    Đang tải danh sách nhân viên...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-16 text-center text-sm"
                    style={{ color: '#DC2626' }}
                  >
                    Không thể tải danh sách nhân viên:{' '}
                    {error instanceof Error ? error.message : 'Lỗi không xác định'}
                  </td>
                </tr>
              ) : staff.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-16 text-center text-sm"
                    style={{ color: '#6F7B75' }}
                  >
                    Không có nhân viên nào phù hợp với từ khóa tìm kiếm hiện tại.
                  </td>
                </tr>
              ) : (
                staff.map((member) => (
                  <StaffTableRow
                    key={member.id}
                    staff={member}
                    onLockClick={setLockTarget}
                    onUnlock={handleUnlock}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        <StaffPagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalCount={total}
          pageSize={PAGE_SIZE}
        />
      </div>

      <AddStaffDialog
        open={isAddOpen}
        onOpenChange={setAddOpen}
        onSubmit={handleAddSubmit}
        isPending={addStaff.isPending}
      />

      <LockStaffConfirmDialog
        open={lockTarget !== null}
        onOpenChange={(open) => !open && setLockTarget(null)}
        staffName={lockTarget?.fullName ?? ''}
        onConfirm={handleLockConfirm}
        isPending={setStatus.isPending}
      />
    </div>
  );
}
