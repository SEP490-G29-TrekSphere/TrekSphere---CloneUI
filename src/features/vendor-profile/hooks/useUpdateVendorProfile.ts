import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorProfileService } from '../services/vendorProfileService';
import { vendorProfileKeys } from './useVendorProfile';

/** Hook mutation cập nhật hồ sơ Vendor (`PUT /vendors/profile`). */
export function useUpdateVendorProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: vendorProfileService.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorProfileKeys.all });
    },
  });
}
