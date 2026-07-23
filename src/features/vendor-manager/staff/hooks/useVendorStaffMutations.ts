import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorStaffService } from '../services/vendorStaffService';
import type { AddVendorStaffPayload } from '../types';
import { vendorStaffKeys } from './useVendorStaffList';
import { vendorStaffLockedCountKeys } from './useVendorStaffLockedCount';

/** Mutation cho "Thêm nhân viên" và "Khóa/Mở khóa" — cả 2 đều invalidate list + locked-count. */
export function useVendorStaffMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: vendorStaffKeys.all });
    queryClient.invalidateQueries({ queryKey: vendorStaffLockedCountKeys.all });
  };

  const addStaff = useMutation({
    mutationFn: (payload: AddVendorStaffPayload) => vendorStaffService.addStaff(payload),
    onSuccess: invalidate,
  });

  const setStatus = useMutation({
    mutationFn: ({ staffId, isActive }: { staffId: string; isActive: boolean }) =>
      vendorStaffService.updateStatus(staffId, isActive),
    onSuccess: invalidate,
  });

  return { addStaff, setStatus };
}
