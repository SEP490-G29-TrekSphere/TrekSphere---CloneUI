import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { EquipmentItemDto } from '../services/groupWorkspaceService';
import { groupWorkspaceService } from '../services/groupWorkspaceService';
import { groupWorkspaceKeys } from './groupWorkspaceKeys';

export function useGroupEquipmentWorkspace(groupId: string | undefined) {
  return useQuery({
    queryKey: groupWorkspaceKeys.equipment(groupId ?? ''),
    queryFn: () => groupWorkspaceService.getEquipment(groupId as string),
    enabled: Boolean(groupId),
  });
}

export function useAddEquipmentItem(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<EquipmentItemDto, 'id' | 'isPrepared'>) =>
      groupWorkspaceService.addEquipmentItem(groupId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.equipment(groupId) });
    },
  });
}

export function useToggleEquipmentPrepared(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => groupWorkspaceService.toggleEquipmentPrepared(groupId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.equipment(groupId) });
    },
  });
}
