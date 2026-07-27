import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorScheduleService } from '../services/vendorScheduleService';
import type { CreateSchedulePayload, UpdateSchedulePayload } from '../types';
import { vendorTourDetailKeys } from './useVendorTourDetail';

/**
 * Mutation cho "Tạo lịch khởi hành", "Sửa lịch" và "Hủy lịch" — cả 3 chỉ cần
 * invalidate lại `vendorTourDetailKeys.detail(tourId)` vì danh sách lịch hiển
 * thị trên trang lấy trực tiếp từ `schedules` nhúng trong chi tiết tour.
 */
export function useVendorScheduleMutations(tourId: string) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: vendorTourDetailKeys.detail(tourId) });
  };

  const createSchedule = useMutation({
    mutationFn: (payload: CreateSchedulePayload) =>
      vendorScheduleService.createSchedule(tourId, payload),
    onSuccess: invalidate,
  });

  const updateSchedule = useMutation({
    mutationFn: ({ scheduleId, payload }: { scheduleId: string; payload: UpdateSchedulePayload }) =>
      vendorScheduleService.updateSchedule(scheduleId, payload),
    onSuccess: invalidate,
  });

  const deleteSchedule = useMutation({
    mutationFn: (scheduleId: string) => vendorScheduleService.deleteSchedule(scheduleId),
    onSuccess: invalidate,
  });

  return { createSchedule, updateSchedule, deleteSchedule };
}
