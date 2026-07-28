import { useQuery } from '@tanstack/react-query';
import { vendorPorterService } from '../services/vendorPorterService';

export const vendorPorterSummaryKeys = {
  all: ['vendor-porter', 'summary'] as const,
};

/** Số liệu tổng hợp cho thẻ thống kê — tính từ toàn bộ hồ sơ porter (không phân trang). */
export function useVendorPorterSummary() {
  return useQuery({
    queryKey: vendorPorterSummaryKeys.all,
    queryFn: async () => {
      const porters = await vendorPorterService.listAllPorters();
      const active = porters.filter((porter) => porter.status === 'ACTIVE').length;
      return {
        total: porters.length,
        active,
        inactive: porters.length - active,
      };
    },
    staleTime: 60_000,
  });
}
