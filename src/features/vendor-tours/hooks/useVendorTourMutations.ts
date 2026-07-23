import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorTourService } from '../services/vendorTourService';
import type { CheckpointSubmitItem, CreateTourPayload, UpdateTourPayload } from '../types';
import { vendorTourCheckpointsKeys } from './useVendorTourCheckpoints';
import { vendorTourDetailKeys } from './useVendorTourDetail';
import { vendorTourKeys } from './useVendorTourList';
import { vendorTourStatsKeys } from './useVendorTourStats';

/**
 * Mutation cho "Tạo tour" (+ checkpoints), "Sửa tour" (+ reconcile checkpoints),
 * "Xóa tour" và "Gửi kiểm duyệt" — invalidate list + stats (và detail/checkpoints
 * query khi sửa/gửi duyệt) sau khi xong.
 */
export function useVendorTourMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: vendorTourKeys.all });
    queryClient.invalidateQueries({ queryKey: vendorTourStatsKeys.all });
  };

  const createTourWithCheckpoints = useMutation({
    mutationFn: async ({
      tour,
      checkpoints,
    }: {
      tour: CreateTourPayload;
      checkpoints: CheckpointSubmitItem[];
    }) => {
      const created = await vendorTourService.createTour(tour);
      // Checkpoint chỉ tạo được sau khi tour đã có tourId — gọi tuần tự theo thứ tự nhập.
      for (const checkpoint of checkpoints) {
        await vendorTourService.createCheckpoint(created.id, checkpoint.payload);
      }
      return created;
    },
    onSuccess: invalidate,
  });

  const updateTour = useMutation({
    mutationFn: ({ tourId, tour }: { tourId: string; tour: UpdateTourPayload }) =>
      vendorTourService.updateTour(tourId, tour),
    onSuccess: (_data, variables) => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: vendorTourDetailKeys.detail(variables.tourId) });
    },
  });

  /**
   * Sửa tour + đồng bộ checkpoints: checkpoint có `checkpointId` → PUT (sửa),
   * không có → POST (mới thêm); checkpoint cũ nào không còn trong danh sách gửi
   * lên → DELETE. Không diff field-by-field cho đơn giản — PUT lại nguyên payload
   * hiện tại của mỗi checkpoint còn giữ, kể cả khi user không đổi gì.
   */
  const updateTourWithCheckpoints = useMutation({
    mutationFn: async ({
      tourId,
      tour,
      checkpoints,
      deletedCheckpointIds,
    }: {
      tourId: string;
      tour: UpdateTourPayload;
      checkpoints: CheckpointSubmitItem[];
      deletedCheckpointIds: string[];
    }) => {
      const updated = await vendorTourService.updateTour(tourId, tour);
      for (const checkpoint of checkpoints) {
        if (checkpoint.checkpointId) {
          await vendorTourService.updateCheckpoint(checkpoint.checkpointId, checkpoint.payload);
        } else {
          await vendorTourService.createCheckpoint(tourId, checkpoint.payload);
        }
      }
      for (const checkpointId of deletedCheckpointIds) {
        await vendorTourService.deleteCheckpoint(checkpointId);
      }
      return updated;
    },
    onSuccess: (_data, variables) => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: vendorTourDetailKeys.detail(variables.tourId) });
      queryClient.invalidateQueries({ queryKey: vendorTourCheckpointsKeys.list(variables.tourId) });
    },
  });

  const deleteTour = useMutation({
    mutationFn: (tourId: string) => vendorTourService.deleteTour(tourId),
    onSuccess: invalidate,
  });

  const submitTourForApproval = useMutation({
    mutationFn: (tourId: string) => vendorTourService.submitTourForApproval(tourId),
    onSuccess: (_data, tourId) => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: vendorTourDetailKeys.detail(tourId) });
    },
  });

  return {
    createTourWithCheckpoints,
    updateTour,
    updateTourWithCheckpoints,
    deleteTour,
    submitTourForApproval,
  };
}
