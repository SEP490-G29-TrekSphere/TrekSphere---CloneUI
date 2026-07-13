import { useQuery } from '@tanstack/react-query';
import { adminAccountService } from '../services/adminAccountService';
import type { AdminAccountDetail } from '../types.detail';

export const adminAccountDetailKeys = {
  all: ['admin', 'account-detail'] as const,
  detail: (id: string) => [...adminAccountDetailKeys.all, id] as const,
};

/**
 * Hook lấy chi tiết 1 account cho màn admin account detail.
 */
export function useAdminAccountDetail(id: string) {
  return useQuery<AdminAccountDetail>({
    queryKey: adminAccountDetailKeys.detail(id),
    queryFn: async () => {
      const detail = await adminAccountService.getAccountDetailById(id);
      if (!detail) {
        throw new Error('Không tìm thấy tài khoản');
      }
      return detail;
    },
    enabled: Boolean(id),
  });
}
