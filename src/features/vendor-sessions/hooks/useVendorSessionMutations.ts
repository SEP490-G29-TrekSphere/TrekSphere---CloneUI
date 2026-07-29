import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorSessionService } from '../services/vendorSessionService';
import type {
  AssignCoordinatorPayload,
  AssignEquipmentPayload,
  AssignPorterPayload,
} from '../types';
import { vendorSessionKeys } from './useVendorSessionList';

/**
 * Mutation cho gán/gỡ Coordinator, Porter, Thiết bị của 1 phiên tour — mỗi hành
 * động gọi API và lưu ngay lập tức (không có khái niệm "nháp rồi lưu" ở BE),
 * invalidate lại allocations + danh sách phiên sau khi xong.
 */
export function useVendorSessionMutations(sessionId: string) {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: vendorSessionKeys.allocations(sessionId) });
    queryClient.invalidateQueries({ queryKey: vendorSessionKeys.all });
  };

  const assignCoordinator = useMutation({
    mutationFn: (payload: AssignCoordinatorPayload) =>
      vendorSessionService.assignCoordinator(sessionId, payload),
    onSuccess: invalidate,
  });

  const removeCoordinator = useMutation({
    mutationFn: (scheduleId: string) => vendorSessionService.removeCoordinator(scheduleId),
    onSuccess: invalidate,
  });

  const assignPorter = useMutation({
    mutationFn: (payload: AssignPorterPayload) =>
      vendorSessionService.assignPorter(sessionId, payload),
    onSuccess: invalidate,
  });

  const removePorter = useMutation({
    mutationFn: (porterScheduleId: string) => vendorSessionService.removePorter(porterScheduleId),
    onSuccess: invalidate,
  });

  const assignEquipment = useMutation({
    mutationFn: (payload: AssignEquipmentPayload) =>
      vendorSessionService.assignEquipment(sessionId, payload),
    onSuccess: invalidate,
  });

  const removeEquipment = useMutation({
    mutationFn: (sessionEquipmentId: string) =>
      vendorSessionService.removeEquipment(sessionEquipmentId),
    onSuccess: invalidate,
  });

  return {
    assignCoordinator,
    removeCoordinator,
    assignPorter,
    removePorter,
    assignEquipment,
    removeEquipment,
  };
}
