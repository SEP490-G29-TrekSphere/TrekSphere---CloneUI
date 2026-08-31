import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { groupWorkspaceService } from '../services/groupWorkspaceService';
import { companionGroupKeys } from './companionGroupKeys';
import { groupWorkspaceKeys } from './groupWorkspaceKeys';

export function useGroupDissolveRequest(groupId: string | undefined) {
  return useQuery({
    queryKey: groupWorkspaceKeys.dissolve(groupId ?? ''),
    queryFn: () => groupWorkspaceService.getDissolveRequest(groupId as string),
    enabled: Boolean(groupId),
  });
}

export function useCreateDissolveRequest(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reason: string) => groupWorkspaceService.createDissolveRequest(groupId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.dissolve(groupId) });
    },
  });
}

export function useVoteDissolveRequest(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, vote }: { requestId: string; vote: 'YES' | 'NO' }) =>
      groupWorkspaceService.voteDissolveRequest(groupId, requestId, vote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.dissolve(groupId) });
      // Đủ đồng thuận sẽ xoá nhóm thật ở BE → invalidate group detail để trang tự phát hiện
      // nhóm không còn tồn tại và hiện đúng trạng thái lỗi/điều hướng.
      queryClient.invalidateQueries({ queryKey: companionGroupKeys.detail(groupId) });
    },
  });
}

export function useCancelDissolveRequest(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => groupWorkspaceService.cancelDissolveRequest(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.dissolve(groupId) });
    },
  });
}
