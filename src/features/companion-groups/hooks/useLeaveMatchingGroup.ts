import { useMutation, useQueryClient } from '@tanstack/react-query';
import { companionGroupService } from '../services/companionGroupService';

export function useLeaveMatchingGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (matchingGroupId: string) =>
      companionGroupService.leaveMatchingGroup(matchingGroupId),
    onSuccess: (_, matchingGroupId) => {
      // Invalidate both lists and detail query so status updates correctly
      queryClient.invalidateQueries({ queryKey: ['matching-groups'] });
      queryClient.invalidateQueries({ queryKey: ['matching-group-detail', matchingGroupId] });
    },
  });
}
