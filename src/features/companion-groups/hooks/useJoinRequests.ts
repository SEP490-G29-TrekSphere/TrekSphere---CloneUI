import { useQuery } from '@tanstack/react-query';
import {
  companionGroupService,
  type GetJoinRequestsParams,
} from '../services/companionGroupService';
import { companionGroupKeys } from './companionGroupKeys';

export function useJoinRequests(groupId: string | undefined, params: GetJoinRequestsParams = {}) {
  return useQuery({
    queryKey: companionGroupKeys.joinRequestList(groupId ?? '', params),
    queryFn: () => {
      if (!groupId) throw new Error('Group ID is required');
      return companionGroupService.getJoinRequests(groupId, params);
    },
    enabled: Boolean(groupId),
    staleTime: 0, // join requests change frequently
  });
}
