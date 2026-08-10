import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  companionGroupService,
  type GetMatchingGroupsParams,
} from '../services/companionGroupService';
import { companionGroupKeys } from './companionGroupKeys';

export function useMatchingGroups(params: GetMatchingGroupsParams = {}) {
  return useQuery({
    queryKey: companionGroupKeys.list(params),
    queryFn: () => companionGroupService.getMatchingGroups(params),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
