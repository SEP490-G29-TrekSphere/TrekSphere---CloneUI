import { useQuery } from '@tanstack/react-query';
import { vendorTourService } from '../services/vendorTourService';
import type { VendorTourFilter } from '../types';

export const vendorTourKeys = {
  all: ['vendor-tours'] as const,
  list: (filter: VendorTourFilter, page: number, pageSize: number) =>
    ['vendor-tours', 'list', filter, page, pageSize] as const,
};

/** Danh sách tour (bảng chính) — phân trang theo filter/page hiện tại. */
export function useVendorTourList(filter: VendorTourFilter, page: number, pageSize: number) {
  return useQuery({
    queryKey: vendorTourKeys.list(filter, page, pageSize),
    queryFn: () => vendorTourService.listMyTours(filter, page, pageSize),
  });
}
