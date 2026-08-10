import { keepPreviousData, useQuery } from '@tanstack/react-query';
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
  } = {}
) {
  return useQuery({
    queryKey: companionGroupKeys.myGroupList(params),
    queryFn: () => companionGroupService.getMyMatchingGroups(params),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
