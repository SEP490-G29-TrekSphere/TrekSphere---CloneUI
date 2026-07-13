import { useQuery } from '@tanstack/react-query';
import { adminAccountService } from '../services/adminAccountService';
import type { AdminAccountFilter, AdminAccountsResponse } from '../types';

/** Query keys dùng chung cho admin accounts. */
export const adminAccountKeys = {
  all: ['admin', 'accounts'] as const,
  lists: () => [...adminAccountKeys.all, 'list'] as const,
  list: (filter: AdminAccountFilter, page: number, pageSize: number) =>
    [...adminAccountKeys.lists(), { filter, page, pageSize }] as const,
};

/**
 * Hook lấy danh sách accounts cho màn admin account list.
 *
 * Throw error khi API fail để React Query set `isError = true` và
 * UI hiển thị được message lỗi từ BE.
 */
export function useAdminAccounts(filter: AdminAccountFilter, page: number, pageSize: number) {
  return useQuery<AdminAccountsResponse>({
    queryKey: adminAccountKeys.list(filter, page, pageSize),
    queryFn: async () => {
      const res = await adminAccountService.listAccounts(filter, page, pageSize);
      return res;
    },
    staleTime: 30 * 1000,
  });
}
