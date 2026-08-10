import { useQuery } from '@tanstack/react-query';
import { adminVendorService } from '../services/adminVendorService';
import { adminVendorKeys } from './useAdminVendors';

/** Hook lấy số liệu thống kê tổng quan (4 thẻ overview) cho màn vendor list. */
export function useAdminVendorStats() {
  return useQuery({
    queryKey: adminVendorKeys.stats(),
    queryFn: () => adminVendorService.getStats(),
  });
}
