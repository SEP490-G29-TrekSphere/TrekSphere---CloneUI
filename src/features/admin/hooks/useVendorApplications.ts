import { useQuery } from '@tanstack/react-query';
import {
  type VendorApplicationFilter,
  type VendorApplicationsResponse,
  vendorApplicationService,
} from '../services/vendorApplicationService';

export const vendorApplicationKeys = {
  all: ['admin', 'vendorApplications'] as const,
  lists: () => [...vendorApplicationKeys.all, 'list'] as const,
  list: (filter: VendorApplicationFilter) =>
    [...vendorApplicationKeys.lists(), { filter }] as const,
  details: () => [...vendorApplicationKeys.all, 'detail'] as const,
  detail: (id: string) => [...vendorApplicationKeys.details(), id] as const,
  stats: () => [...vendorApplicationKeys.all, 'stats'] as const,
};

/**
 * Hook lấy danh sách các đơn đăng ký nhà cung cấp với filter và phân trang.
 */
export function useVendorApplications(filter: VendorApplicationFilter) {
  return useQuery<VendorApplicationsResponse>({
    queryKey: vendorApplicationKeys.list(filter),
    queryFn: () => vendorApplicationService.getApplications(filter),
    staleTime: 30 * 1000,
  });
}

/**
 * Hook lấy chi tiết một đơn đăng ký theo ID.
 */
export function useVendorApplicationDetail(id?: string) {
  return useQuery({
    queryKey: vendorApplicationKeys.detail(id || ''),
    queryFn: () => vendorApplicationService.getApplicationById(id || ''),
    enabled: Boolean(id),
    staleTime: 30 * 1000,
  });
}

/**
 * Hook lấy thống kê số lượng đơn theo từng trạng thái.
 */
export function useVendorApplicationStats() {
  return useQuery({
    queryKey: vendorApplicationKeys.stats(),
    queryFn: () => vendorApplicationService.getStats(),
    staleTime: 60 * 1000,
  });
}
