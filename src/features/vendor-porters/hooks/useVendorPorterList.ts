import { useQuery } from '@tanstack/react-query';
import { vendorPorterService } from '../services/vendorPorterService';
import type { VendorPorterFilter } from '../types';

export const vendorPorterKeys = {
  all: ['vendor-porter'] as const,
  list: (filter: VendorPorterFilter, page: number, pageSize: number) =>
    ['vendor-porter', 'list', filter, page, pageSize] as const,
};

/** Danh sách hồ sơ porter (bảng chính) — phân trang theo filter/page hiện tại. */
export function useVendorPorterList(filter: VendorPorterFilter, page: number, pageSize: number) {
  return useQuery({
    queryKey: vendorPorterKeys.list(filter, page, pageSize),
    queryFn: () => vendorPorterService.listPorters(filter, page, pageSize),
  });
}
