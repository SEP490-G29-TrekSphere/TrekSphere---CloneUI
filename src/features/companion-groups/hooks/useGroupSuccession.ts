import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { groupWorkspaceService } from '../services/groupWorkspaceService';
import { companionGroupKeys } from './companionGroupKeys';
import { groupWorkspaceKeys } from './groupWorkspaceKeys';

export function useGroupSuccession(groupId: string | undefined) {
  return useQuery({
    queryKey: groupWorkspaceKeys.succession(groupId ?? ''),
    queryFn: () => groupWorkspaceService.getSuccessionRequest(groupId as string),
    enabled: Boolean(groupId),
  });
}

export function useCreateSuccessionRequest(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { reason: string; nomineeId: string }) =>
      groupWorkspaceService.createSuccessionRequest(groupId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.succession(groupId) });
    },
  });
}

export function useAppointLeaderDirect(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (nomineeId: string) =>
      groupWorkspaceService.appointLeaderDirect(groupId, { nomineeId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.succession(groupId) });
      // Chuyển giao ngay lập tức → invalidate cả group detail thật (ownerId đổi).
      queryClient.invalidateQueries({ queryKey: companionGroupKeys.detail(groupId) });
    },
  });
}

export function useVoteSuccessionRequest(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, vote }: { requestId: string; vote: 'YES' | 'NO' }) =>
      groupWorkspaceService.voteSuccessionRequest(groupId, requestId, vote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.succession(groupId) });
      // Bầu đủ đa số sẽ chuyển ownerId thật của nhóm → invalidate cả group detail.
      queryClient.invalidateQueries({ queryKey: companionGroupKeys.detail(groupId) });
    },
  });
}

export function useCancelSuccessionRequest(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => groupWorkspaceService.cancelSuccessionRequest(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.succession(groupId) });
    },
  });
}
