import { useMutation, useQueryClient } from '@tanstack/react-query';
import { companionGroupService } from '../services/companionGroupService';
import { companionGroupKeys } from './companionGroupKeys';

export function useDeleteMatchingGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (matchingGroupId: string) =>
      companionGroupService.deleteMatchingGroup(matchingGroupId),
    onSuccess: (_, matchingGroupId) => {
      queryClient.invalidateQueries({ queryKey: companionGroupKeys.lists() });
      queryClient.invalidateQueries({ queryKey: companionGroupKeys.detail(matchingGroupId) });
      queryClient.invalidateQueries({ queryKey: companionGroupKeys.myGroups() });
    },
  });
}
