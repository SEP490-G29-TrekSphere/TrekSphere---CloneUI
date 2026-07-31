import { useMutation, useQueryClient } from '@tanstack/react-query';
import { companionGroupService } from '../services/companionGroupService';

export function useDeleteMatchingGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (matchingGroupId: string) =>
      companionGroupService.deleteMatchingGroup(matchingGroupId),
    onSuccess: (_, matchingGroupId) => {
      // Invalidate matching groups lists and details
      queryClient.invalidateQueries({ queryKey: ['matching-groups'] });
      queryClient.invalidateQueries({ queryKey: ['matching-group', matchingGroupId] });
    },
  });
}
