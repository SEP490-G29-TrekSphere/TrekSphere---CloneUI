import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { groupWorkspaceService } from '../services/groupWorkspaceService';
import { groupWorkspaceKeys } from './groupWorkspaceKeys';

export function useGroupLifecycle(groupId: string | undefined) {
  return useQuery({
    queryKey: groupWorkspaceKeys.lifecycle(groupId ?? ''),
    queryFn: () => groupWorkspaceService.getLifecycle(groupId as string),
    enabled: Boolean(groupId),
  });
}

export function useAdvanceLifecyclePhase(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (phase: 1 | 2 | 3 | 4 | 5) =>
      groupWorkspaceService.advanceLifecyclePhase(groupId, phase),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.lifecycle(groupId) });
    },
  });
}

export function useSetTripStatus(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tripStatus: 'ONGOING' | 'COMPLETED') =>
      groupWorkspaceService.setTripStatus(groupId, tripStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.lifecycle(groupId) });
    },
  });
}
