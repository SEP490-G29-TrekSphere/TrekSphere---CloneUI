import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorEquipmentService } from '../services/vendorEquipmentService';
import type { CreateVendorEquipmentPayload, UpdateVendorEquipmentPayload } from '../types';
import { vendorEquipmentKeys } from './useVendorEquipmentList';
import { vendorEquipmentSummaryKeys } from './useVendorEquipmentSummary';

/** Mutation cho Thêm/Sửa/Xóa dụng cụ trong kho — invalidate danh sách + số liệu tổng hợp sau khi xong. */
export function useVendorEquipmentMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: vendorEquipmentKeys.all });
    queryClient.invalidateQueries({ queryKey: vendorEquipmentSummaryKeys.all });
  };

  const createEquipment = useMutation({
    mutationFn: (payload: CreateVendorEquipmentPayload) =>
      vendorEquipmentService.createEquipment(payload),
    onSuccess: invalidate,
  });

  const updateEquipment = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateVendorEquipmentPayload }) =>
      vendorEquipmentService.updateEquipment(id, payload),
    onSuccess: invalidate,
  });

  const deleteEquipment = useMutation({
    mutationFn: (id: string) => vendorEquipmentService.deleteEquipment(id),
    onSuccess: invalidate,
  });

  return { createEquipment, updateEquipment, deleteEquipment };
}
