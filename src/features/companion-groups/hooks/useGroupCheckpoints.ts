import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { groupWorkspaceService } from '../services/groupWorkspaceService';
import { groupWorkspaceKeys } from './groupWorkspaceKeys';

export function useGroupCheckpoints(groupId: string | undefined) {
  return useQuery({
    queryKey: groupWorkspaceKeys.checkpoints(groupId ?? ''),
    queryFn: () => groupWorkspaceService.getCheckpoints(groupId as string),
    enabled: Boolean(groupId),
  });
}

export function useAddCheckpoint(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      category: string;
      distanceAltitude: string;
      gps: string;
      imageUrl?: string;
    }) => groupWorkspaceService.addCheckpoint(groupId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.checkpoints(groupId) });
    },
  });
}

export function useDeleteCheckpoint(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (checkpointId: string) =>
      groupWorkspaceService.deleteCheckpoint(groupId, checkpointId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.checkpoints(groupId) });
    },
  });
}

export function useCheckInCheckpoint(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (checkpointId: string) =>
      groupWorkspaceService.checkInCheckpoint(groupId, checkpointId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.checkpoints(groupId) });
    },
  });
}

export function useSkipCheckpoint(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (checkpointId: string) =>
      groupWorkspaceService.skipCheckpoint(groupId, checkpointId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.checkpoints(groupId) });
    },
  });
}
