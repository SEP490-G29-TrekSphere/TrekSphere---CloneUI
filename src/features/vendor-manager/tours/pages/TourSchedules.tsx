import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PATHS } from '@/constants';
import { DeleteScheduleConfirmDialog } from '@/features/vendor-tours/components/DeleteScheduleConfirmDialog';
import { ScheduleFormDialog } from '@/features/vendor-tours/components/ScheduleFormDialog';
import { ScheduleTableRow } from '@/features/vendor-tours/components/ScheduleTableRow';
import {
  NOT_SCHEDULABLE_REASON,
  SCHEDULABLE_STATUSES,
} from '@/features/vendor-tours/components/TourTableRow';
import { useVendorScheduleMutations } from '@/features/vendor-tours/hooks/useVendorScheduleMutations';
import { useVendorTourDetail } from '@/features/vendor-tours/hooks/useVendorTourDetail';
import type {
  CreateSchedulePayload,
  TourSchedule,
  UpdateSchedulePayload,
} from '@/features/vendor-tours/types';
import { toast } from '@/store/useToastStore';

const TABLE_COLUMNS = ['Ngày đi', 'Ngày về', 'Giá', 'Chỗ (đã đặt/tổng)', 'Trạng thái', 'Thao tác'];

/**
 * Quản lý lịch khởi hành của 1 tour — dùng chung layout bảng với TourList/TourApprovals.
 * Vào từ icon "Lịch khởi hành" trên mỗi dòng ở `TourList`. Chỉ màn Manager mới có nút
 * Hủy lịch (`DELETE .../schedules/{scheduleId}` yêu cầu quyền VendorManager).
 */
export default function TourSchedules() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: tour, isLoading, isError, error } = useVendorTourDetail(id);
  const { createSchedule, updateSchedule, deleteSchedule } = useVendorScheduleMutations(id ?? '');

  const [formTarget, setFormTarget] = useState<TourSchedule | 'create' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TourSchedule | null>(null);

  const handleBack = () => navigate(PATHS.VENDOR_MANAGER_TOURS);

  const schedules = [...(tour?.schedules ?? [])].sort((a, b) =>
    a.departureDate.localeCompare(b.departureDate)
  );

  const handleFormSubmit = (payload: CreateSchedulePayload | UpdateSchedulePayload) => {
    if (formTarget === 'create') {
      createSchedule.mutate(payload as CreateSchedulePayload, {
        onSuccess: () => {
          setFormTarget(null);
          toast.success('Đã tạo lịch khởi hành.');
        },
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : 'Không thể tạo lịch khởi hành.'),
      });
    } else if (formTarget) {
      updateSchedule.mutate(
        { scheduleId: formTarget.scheduleId, payload: payload as UpdateSchedulePayload },
        {
          onSuccess: () => {
            setFormTarget(null);
            toast.success('Đã cập nhật lịch khởi hành.');
          },
          onError: (err) =>
            toast.error(err instanceof Error ? err.message : 'Không thể cập nhật lịch khởi hành.'),
        }
      );
    }
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteSchedule.mutate(deleteTarget.scheduleId, {
      onSuccess: () => {
        setDeleteTarget(null);
        toast.success('Đã hủy lịch khởi hành.');
      },
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : 'Không thể hủy lịch khởi hành.'),
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isError || !tour) {
    return (
      <div
        className="space-y-4 rounded-3xl bg-white p-6 text-center"
        style={{ border: '1px solid #E6E2D1' }}
      >
        <p className="text-sm" style={{ color: '#DC2626' }}>
          Không thể tải thông tin tour:{' '}
          {error instanceof Error ? error.message : 'Lỗi không xác định'}
        </p>
        <button
          type="button"
          onClick={handleBack}
          className="rounded-full px-5 py-2.5 text-sm font-semibold"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #D8D3C4', color: '#06261D' }}
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const isEditingExisting = formTarget !== null && formTarget !== 'create';
  // Vào thẳng màn này bằng URL vẫn có thể lọt qua nút lịch (đã disable) ở bảng danh sách tour,
  // nên phải kiểm tra lại trạng thái ngay tại đây — BE chặn bằng mã lỗi 4206.
  const canSchedule = SCHEDULABLE_STATUSES.has(tour.status);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={handleBack}
            className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold"
            style={{ color: '#6F7B75' }}
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách tour
          </button>
          <h2 className="text-3xl font-extrabold tracking-tight" style={{ color: '#06261D' }}>
            Lịch khởi hành — {tour.tourName}
          </h2>
          <p className="text-sm font-medium mt-1" style={{ color: '#6F7B75' }}>
            Thiết lập ngày đi, ngày về, giá riêng và giới hạn số chỗ cho từng lịch khởi hành.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setFormTarget('create')}
          disabled={!canSchedule}
          title={canSchedule ? undefined : NOT_SCHEDULABLE_REASON}
          className="inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          style={{ backgroundColor: '#06261D' }}
        >
          + Thêm lịch mới
        </button>
      </div>

      <div
        className="overflow-hidden rounded-3xl bg-white shadow-sm"
        style={{ border: '1px solid #E6E2D1' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: '#F0EEE6' }}>
              <tr>
                {TABLE_COLUMNS.map((col) => (
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
              {schedules.length === 0 ? (
                <tr>
                  <td
                    colSpan={TABLE_COLUMNS.length}
                    className="px-6 py-16 text-center text-sm"
                    style={{ color: '#6F7B75' }}
                  >
                    Tour này chưa có lịch khởi hành nào.
                  </td>
                </tr>
              ) : (
                schedules.map((schedule) => (
                  <ScheduleTableRow
                    key={schedule.scheduleId}
                    schedule={schedule}
                    onEditClick={setFormTarget}
                    onDeleteClick={setDeleteTarget}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ScheduleFormDialog
        open={formTarget !== null}
        onOpenChange={(open) => !open && setFormTarget(null)}
        mode={isEditingExisting ? 'edit' : 'create'}
        defaultValues={
          isEditingExisting
            ? {
                departureDate: formTarget.departureDate,
                returnDate: formTarget.returnDate,
                price: formTarget.price,
                availableSlots: formTarget.availableSlots,
                status: formTarget.status,
              }
            : { price: tour.basePrice }
        }
        bookedSlots={isEditingExisting ? formTarget.bookedSlots : 0}
        maxCapacity={tour.maxCapacity}
        isPending={createSchedule.isPending || updateSchedule.isPending}
        onSubmit={handleFormSubmit}
      />

      <DeleteScheduleConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        departureDate={deleteTarget?.departureDate ?? ''}
        onConfirm={handleDeleteConfirm}
        isPending={deleteSchedule.isPending}
      />
    </div>
  );
}
