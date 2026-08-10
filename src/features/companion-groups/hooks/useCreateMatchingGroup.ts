import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  companionGroupService,
  type MatchingGroupCreateRequest,
} from '../services/companionGroupService';
import { companionGroupKeys } from './companionGroupKeys';

export function useCreateMatchingGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: MatchingGroupCreateRequest) =>
      companionGroupService.createMatchingGroup(payload),
    onSuccess: () => {
      // Invalidate the public list and my-groups so the new group appears
      queryClient.invalidateQueries({ queryKey: companionGroupKeys.lists() });
      queryClient.invalidateQueries({ queryKey: companionGroupKeys.myGroups() });
    },
  });
}
