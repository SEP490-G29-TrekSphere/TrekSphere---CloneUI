import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorPorterService } from '../services/vendorPorterService';
import type { CreateVendorPorterPayload, UpdateVendorPorterPayload } from '../types';
import { vendorPorterKeys } from './useVendorPorterList';
import { vendorPorterSummaryKeys } from './useVendorPorterSummary';

/** Mutation cho Tạo/Sửa/Xóa hồ sơ porter — invalidate danh sách + số liệu tổng hợp sau khi xong. */
export function useVendorPorterMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: vendorPorterKeys.all });
    queryClient.invalidateQueries({ queryKey: vendorPorterSummaryKeys.all });
  };

  const createPorter = useMutation({
    mutationFn: (payload: CreateVendorPorterPayload) => vendorPorterService.createPorter(payload),
    onSuccess: invalidate,
  });

  const updatePorter = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateVendorPorterPayload }) =>
      vendorPorterService.updatePorter(id, payload),
    onSuccess: invalidate,
  });

  const deletePorter = useMutation({
    mutationFn: (id: string) => vendorPorterService.deletePorter(id),
    onSuccess: invalidate,
  });

  return { createPorter, updatePorter, deletePorter };
}
