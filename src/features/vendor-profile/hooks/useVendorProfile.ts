import { useQuery } from '@tanstack/react-query';
import { vendorProfileService } from '../services/vendorProfileService';

export const vendorProfileKeys = {
  all: ['vendor-profile'] as const,
};

/** Hook lấy hồ sơ Vendor hiện tại (Manager/Staff). */
export function useVendorProfile() {
  return useQuery({
    queryKey: vendorProfileKeys.all,
    queryFn: () => vendorProfileService.getProfile(),
    staleTime: 30 * 1000,
  });
}
