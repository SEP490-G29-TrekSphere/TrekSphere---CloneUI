import { keepPreviousData, type UseQueryOptions, useQuery } from '@tanstack/react-query';
import { companionGroupService } from '../services/companionGroupService';
import { companionGroupKeys } from './companionGroupKeys';

export function useMyMatchingGroups(
  params: {
    status?: string;
    keyword?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  } = {},
  options?: Omit<
    UseQueryOptions<
      Awaited<ReturnType<typeof companionGroupService.getMyMatchingGroups>>,
      Error,
      Awaited<ReturnType<typeof companionGroupService.getMyMatchingGroups>>,
      ReturnType<typeof companionGroupKeys.myGroupList>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: companionGroupKeys.myGroupList(params),
    queryFn: () => companionGroupService.getMyMatchingGroups(params),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2, // 2 minutes
    ...options,
  });
}
