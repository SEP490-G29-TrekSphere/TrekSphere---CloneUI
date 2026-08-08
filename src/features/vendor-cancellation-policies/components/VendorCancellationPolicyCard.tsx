import { Pencil, ReceiptText, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ConfirmActionDialog } from '@/shared/ui';
import { toast } from '@/store/useToastStore';
import { useCancellationPolicies } from '../hooks/useCancellationPolicies';
import { useCancellationPolicyMutations } from '../hooks/useCancellationPolicyMutations';
import {
  type CancellationPolicy,
  type CancellationPolicyPayload,
  sortPoliciesByDaysDesc,
} from '../types';
import { CancellationPolicyFormDialog } from './CancellationPolicyFormDialog';

interface VendorCancellationPolicyCardProps {
  /** Chỉ Vendor Manager được thêm/sửa/xóa — Staff chỉ xem. */
  canManage: boolean;
}

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

/**
 * Khối "Chính sách hủy tour & Hoàn tiền" trên trang Tổng quan hồ sơ Vendor.
 * Tự quản lý dữ liệu qua `GET/POST/PUT/DELETE /vendor/cancellation-policies`.
 */
export function VendorCancellationPolicyCard({ canManage }: VendorCancellationPolicyCardProps) {
  const { data: policies = [], isLoading, isError, error } = useCancellationPolicies();
  const { createPolicy, updatePolicy, deletePolicy } = useCancellationPolicyMutations();

  const [isFormOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CancellationPolicy | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CancellationPolicy | null>(null);

  const sortedPolicies = sortPoliciesByDaysDesc(policies);
  // Mốc ngày đã dùng, trừ bản ghi đang sửa (giữ nguyên mốc của chính nó là hợp lệ).
  const existingDays = policies
    .filter((p) => p.cancellationPolicyId !== editTarget?.cancellationPolicyId)
    .map((p) => p.cancelBeforeDays);

  const openCreate = () => {
    setEditTarget(null);
    setFormOpen(true);
  };

  const openEdit = (policy: CancellationPolicy) => {
    setEditTarget(policy);
    setFormOpen(true);
  };

  const handleSubmit = (payload: CancellationPolicyPayload) => {
    if (editTarget) {
      updatePolicy.mutate(
        { id: editTarget.cancellationPolicyId, payload },
        {
          onSuccess: () => {
            setFormOpen(false);
            setEditTarget(null);
            toast.success('Cập nhật chính sách hủy thành công.');
          },
          onError: (err) => toast.error(errorMessage(err, 'Không thể cập nhật chính sách hủy.')),
        }
      );
      return;
    }

    createPolicy.mutate(payload, {
      onSuccess: () => {
        setFormOpen(false);
        toast.success('Tạo chính sách hủy thành công.');
      },
      onError: (err) => toast.error(errorMessage(err, 'Không thể tạo chính sách hủy.')),
    });
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deletePolicy.mutate(deleteTarget.cancellationPolicyId, {
      onSuccess: () => {
        setDeleteTarget(null);
        toast.success('Xóa chính sách hủy thành công.');
      },
      onError: (err) => toast.error(errorMessage(err, 'Không thể xóa chính sách hủy.')),
    });
  };

  return (
    <div className="rounded-[32px] p-6 sm:p-8" style={{ backgroundColor: '#F6F4EB' }}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-full"
            style={{ backgroundColor: '#E6E2D1', color: '#06261D' }}
          >
            <ReceiptText className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold" style={{ color: '#06261D' }}>
              Chính sách hủy tour &amp; Hoàn tiền
            </h3>
            <p className="text-xs font-medium" style={{ color: '#6F7B75' }}>
              Hủy càng sớm hoàn càng nhiều — hệ thống tự áp mốc khớp nhất khi khách hủy tour.
            </p>
          </div>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold text-white whitespace-nowrap"
            style={{ backgroundColor: '#06261D' }}
          >
            + Thêm chính sách
          </button>
        )}
      </div>

      <div className="mt-5">
        {isLoading ? (
          <p className="text-sm" style={{ color: '#6F7B75' }}>
            Đang tải chính sách hủy tour...
          </p>
        ) : isError ? (
          <p className="text-sm" style={{ color: '#DC2626' }}>
            Không thể tải chính sách hủy tour: {errorMessage(error, 'Lỗi không xác định')}
          </p>
        ) : sortedPolicies.length === 0 ? (
          <p className="text-sm" style={{ color: '#6F7B75' }}>
            {canManage
              ? 'Chưa có chính sách hủy nào. Thêm ít nhất 1 mốc để hệ thống tính được tiền hoàn khi khách hủy tour.'
              : 'Công ty chưa cấu hình chính sách hủy tour.'}
          </p>
        ) : (
          <ul className="space-y-3">
            {sortedPolicies.map((policy) => (
              <li
                key={policy.cancellationPolicyId}
                className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4"
                style={{ border: '1px solid #E6E2D1' }}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold" style={{ color: '#06261D' }}>
                      Hủy trước {policy.cancelBeforeDays} ngày
                    </span>
                    <span
                      className="rounded-full px-2.5 py-0.5 text-xs font-bold"
                      style={{ backgroundColor: '#E7F5EC', color: '#166534' }}
                    >
                      Hoàn {policy.refundPercentage}%
                    </span>
                    {!policy.isActive && (
                      <span
                        className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                        style={{ backgroundColor: '#F0EEE6', color: '#6F7B75' }}
                      >
                        Ngừng áp dụng
                      </span>
                    )}
                  </div>
                  {policy.description && (
                    <p className="mt-1 text-xs font-medium" style={{ color: '#6F7B75' }}>
                      {policy.description}
                    </p>
                  )}
                </div>

                {canManage && (
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(policy)}
                      aria-label={`Sửa chính sách hủy trước ${policy.cancelBeforeDays} ngày`}
                      className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-opacity hover:opacity-80"
                      style={{ backgroundColor: '#F0EEE6', color: '#06261D' }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Sửa
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(policy)}
                      aria-label={`Xóa chính sách hủy trước ${policy.cancelBeforeDays} ngày`}
                      className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-opacity hover:opacity-80"
                      style={{
                        backgroundColor: '#FFFFFF',
                        color: '#DC2626',
                        border: '1px solid #DC2626',
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Xóa
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {canManage && (
        <CancellationPolicyFormDialog
          open={isFormOpen}
          onOpenChange={(open) => {
            setFormOpen(open);
            if (!open) setEditTarget(null);
          }}
          policy={editTarget}
          existingDays={existingDays}
          isPending={createPolicy.isPending || updatePolicy.isPending}
          onSubmit={handleSubmit}
        />
      )}

      {deleteTarget && (
        <ConfirmActionDialog
          title="Xóa chính sách hủy"
          description="Các đơn hủy sau thời điểm này sẽ không còn áp dụng điều khoản trên khi tính tiền hoàn."
          detail={`Hủy trước ${deleteTarget.cancelBeforeDays} ngày — hoàn ${deleteTarget.refundPercentage}%`}
          confirmLabel="Xóa chính sách"
          variant="destructive"
          isPending={deletePolicy.isPending}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
