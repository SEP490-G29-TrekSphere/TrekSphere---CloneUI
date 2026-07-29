import { useQuery } from '@tanstack/react-query';
import { adminVendorService } from '../services/adminVendorService';
import type { AdminVendorFilter, AdminVendorsResponse } from '../types';

/** Query keys dùng chung cho admin vendors. */
export const adminVendorKeys = {
  all: ['admin', 'vendors'] as const,
  lists: () => [...adminVendorKeys.all, 'list'] as const,
  list: (filter: AdminVendorFilter, page: number, pageSize: number) =>
    [...adminVendorKeys.lists(), { filter, page, pageSize }] as const,
  stats: () => [...adminVendorKeys.all, 'stats'] as const,
};

/**
 * Hook lấy danh sách vendors cho màn admin vendor list.
 *
 * Throw error khi API fail để React Query set `isError = true` và
 * UI hiển thị được message lỗi từ BE.
 */
export function useAdminVendors(filter: AdminVendorFilter, page: number, pageSize: number) {
  return useQuery<AdminVendorsResponse>({
    queryKey: adminVendorKeys.list(filter, page, pageSize),
    queryFn: () => adminVendorService.listVendors(filter, page, pageSize),
    staleTime: 30 * 1000,
  });
}
