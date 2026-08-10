import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { companionGroupService } from '../services/companionGroupService';
import { companionGroupKeys } from './companionGroupKeys';

export function useMyJoinRequests(params: { status?: string; page?: number; size?: number } = {}) {
  return useQuery({
    queryKey: companionGroupKeys.myJoinRequestList(params),
    queryFn: () => companionGroupService.getMyJoinRequests(params),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
