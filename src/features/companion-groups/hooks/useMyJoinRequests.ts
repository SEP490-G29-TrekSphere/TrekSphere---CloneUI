import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { companionGroupService } from '../services/companionGroupService';

export function useMyJoinRequests(params: { status?: string; page?: number; size?: number } = {}) {
  return useQuery({
    queryKey: ['my-join-requests', params],
    queryFn: () => companionGroupService.getMyJoinRequests(params),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
