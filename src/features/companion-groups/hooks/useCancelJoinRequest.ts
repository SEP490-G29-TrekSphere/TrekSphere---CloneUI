import { useMutation, useQueryClient } from '@tanstack/react-query';
import { companionGroupService } from '../services/companionGroupService';
import { companionGroupKeys } from './companionGroupKeys';

export function useCancelJoinRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (matchingGroupId: string) =>
      companionGroupService.cancelJoinRequest(matchingGroupId),
    onSuccess: (_, matchingGroupId) => {
      queryClient.invalidateQueries({ queryKey: companionGroupKeys.lists() });
      queryClient.invalidateQueries({ queryKey: companionGroupKeys.detail(matchingGroupId) });
      queryClient.invalidateQueries({
        queryKey: companionGroupKeys.memberStatus(matchingGroupId),
      });
      queryClient.invalidateQueries({ queryKey: companionGroupKeys.myJoinRequests() });
      queryClient.invalidateQueries({ queryKey: companionGroupKeys.myGroups() });
    },
  });
}
