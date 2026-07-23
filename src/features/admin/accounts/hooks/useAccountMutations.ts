import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAccountService } from '../services/adminAccountService';
import { adminAccountDetailKeys } from './useAdminAccountDetail';
import { adminAccountKeys } from './useAdminAccounts';

/**
 * Hook mutation cho thao tác khóa/mở khóa tài khoản (`PUT /users/{id}/status`).
 * Dùng chung cho AccountDetail.
 */
export function useAccountMutations(accountId: string) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: adminAccountKeys.all });
    queryClient.invalidateQueries({ queryKey: adminAccountDetailKeys.all });
  };

  const lock = useMutation({
    mutationFn: () => adminAccountService.updateStatus(accountId, 'LOCKED'),
    onSuccess: invalidate,
  });

  const unlock = useMutation({
    mutationFn: () => adminAccountService.updateStatus(accountId, 'ACTIVE'),
    onSuccess: invalidate,
  });

  return { lock, unlock };
}
