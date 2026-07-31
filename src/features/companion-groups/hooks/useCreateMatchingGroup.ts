import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  companionGroupService,
  type MatchingGroupCreateRequest,
} from '../services/companionGroupService';

export function useCreateMatchingGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: MatchingGroupCreateRequest) =>
      companionGroupService.createMatchingGroup(payload),
    onSuccess: () => {
      // Invalidate the list so the new group appears on the board
      queryClient.invalidateQueries({ queryKey: ['matching-groups'] });
    },
  });
}
