import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAccountService } from '../services/adminAccountService';
import { adminAccountDetailKeys } from './useAdminAccountDetail';
import { adminAccountKeys } from './useAdminAccounts';

/**
 * Hook mutation cho các thao tác nguy hiểm trên tài khoản.
 * Dùng chung cho cả AccountDetail (lock/unlock/revoke).
 */
export function useAccountMutations(accountId: string) {
  const queryClient = useQueryClient();

  const lock = useMutation({
    mutationFn: () => adminAccountService.lockAccount(accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminAccountKeys.all });
      queryClient.invalidateQueries({ queryKey: adminAccountDetailKeys.all });
    },
  });

  const unlock = useMutation({
    mutationFn: () => adminAccountService.unlockAccount(accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminAccountKeys.all });
      queryClient.invalidateQueries({ queryKey: adminAccountDetailKeys.all });
    },
  });

  const revoke = useMutation({
    mutationFn: () => adminAccountService.revokeLicense(accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminAccountKeys.all });
      queryClient.invalidateQueries({ queryKey: adminAccountDetailKeys.all });
    },
  });

  return { lock, unlock, revoke };
}
