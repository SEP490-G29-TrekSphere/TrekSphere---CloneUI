import { useQuery } from '@tanstack/react-query';
import {
  companionGroupService,
  type GetJoinRequestsParams,
} from '../services/companionGroupService';

export function useJoinRequests(groupId: string | undefined, params: GetJoinRequestsParams = {}) {
  return useQuery({
    queryKey: ['join-requests', groupId, params],
    queryFn: () => {
      if (!groupId) throw new Error('Group ID is required');
      return companionGroupService.getJoinRequests(groupId, params);
    },
    enabled: Boolean(groupId),
    staleTime: 1000 * 30, // 30 seconds — join requests change frequently
  });
}
