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

  // Khóa = DEACTIVATED chứ không phải LOCKED: BE chưa implement nhánh LOCKED
  // (trả code 9001 "Chức năng khoá vĩnh viễn chưa được hỗ trợ") dù swagger có
  // khai báo giá trị này.
  const lock = useMutation({
    mutationFn: () => adminAccountService.updateStatus(accountId, 'DEACTIVATED'),
    onSuccess: invalidate,
  });

  const unlock = useMutation({
    mutationFn: () => adminAccountService.updateStatus(accountId, 'ACTIVE'),
    onSuccess: invalidate,
  });

  return { lock, unlock };
}
