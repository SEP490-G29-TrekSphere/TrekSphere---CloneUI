import { useMutation, useQueryClient } from '@tanstack/react-query';
import { companionGroupService } from '../services/companionGroupService';
import { companionGroupKeys } from './companionGroupKeys';

interface JoinMatchingGroupVariables {
  matchingGroupId: string;
  /** Lời nhắn gửi trưởng nhóm — optional. */
  message?: string;
}

export function useJoinMatchingGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ matchingGroupId, message }: JoinMatchingGroupVariables) =>
      companionGroupService.joinMatchingGroup(matchingGroupId, message),
    onSuccess: (_, { matchingGroupId }) => {
      queryClient.invalidateQueries({ queryKey: companionGroupKeys.lists() });
      queryClient.invalidateQueries({ queryKey: companionGroupKeys.detail(matchingGroupId) });
      queryClient.invalidateQueries({
        queryKey: companionGroupKeys.memberStatus(matchingGroupId),
      });
      queryClient.invalidateQueries({ queryKey: companionGroupKeys.myJoinRequests() });
    },
  });
}
