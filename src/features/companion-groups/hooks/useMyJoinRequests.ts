import { keepPreviousData, type UseQueryOptions, useQuery } from '@tanstack/react-query';
import { companionGroupService } from '../services/companionGroupService';
import { companionGroupKeys } from './companionGroupKeys';

export function useMyJoinRequests(
  params: { status?: string; page?: number; size?: number } = {},
  options?: Omit<
    UseQueryOptions<
      Awaited<ReturnType<typeof companionGroupService.getMyJoinRequests>>,
      Error,
      Awaited<ReturnType<typeof companionGroupService.getMyJoinRequests>>,
      ReturnType<typeof companionGroupKeys.myJoinRequestList>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: companionGroupKeys.myJoinRequestList(params),
    queryFn: () => companionGroupService.getMyJoinRequests(params),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2, // 2 minutes
    ...options,
  });
}
