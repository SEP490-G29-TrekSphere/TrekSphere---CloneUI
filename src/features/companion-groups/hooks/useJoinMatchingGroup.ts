import { useMutation, useQueryClient } from '@tanstack/react-query';
import { companionGroupService } from '../services/companionGroupService';

export function useJoinMatchingGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (matchingGroupId: string) =>
      companionGroupService.joinMatchingGroup(matchingGroupId),
    onSuccess: (_, matchingGroupId) => {
      // Invalidate both lists and detail query so details are updated with the new pending/accepted member
      queryClient.invalidateQueries({ queryKey: ['matching-groups'] });
      queryClient.invalidateQueries({ queryKey: ['matching-group-detail', matchingGroupId] });
    },
  });
}
