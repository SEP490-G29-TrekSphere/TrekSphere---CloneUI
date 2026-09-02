import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { BudgetPlanItem } from '../services/groupWorkspaceService';
import { groupWorkspaceService } from '../services/groupWorkspaceService';
import { groupWorkspaceKeys } from './groupWorkspaceKeys';

export function useGroupBudgetWorkspace(groupId: string | undefined) {
  return useQuery({
    queryKey: groupWorkspaceKeys.budget(groupId ?? ''),
    queryFn: () => groupWorkspaceService.getBudget(groupId as string),
    enabled: Boolean(groupId),
  });
}

export function useSaveBudgetPlanItem(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<BudgetPlanItem, 'id'> & { id?: string }) =>
      groupWorkspaceService.savePlanItem(groupId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.budget(groupId) });
    },
  });
}

export function useDeleteBudgetPlanItem(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => groupWorkspaceService.deletePlanItem(groupId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.budget(groupId) });
    },
  });
}

export function useSaveActualExpense(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      id?: string;
      title: string;
      payerId: string;
      amount: number;
      beneficiaryIds: string[];
      receiptImage?: File | null;
      removeReceiptImage?: boolean;
    }) => groupWorkspaceService.saveExpense(groupId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.budget(groupId) });
    },
  });
}

export function useDeleteActualExpense(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (expenseId: string) => groupWorkspaceService.deleteExpense(groupId, expenseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.budget(groupId) });
    },
  });
}

export function useConfirmSettlement(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settlementId: string) =>
      groupWorkspaceService.confirmSettlement(groupId, settlementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.budget(groupId) });
    },
  });
}
