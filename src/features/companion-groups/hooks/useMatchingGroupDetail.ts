import { useQuery } from '@tanstack/react-query';
import { companionGroupService } from '../services/companionGroupService';
import { companionGroupKeys } from './companionGroupKeys';

export function useMatchingGroupDetail(matchingGroupId?: string) {
  return useQuery({
    queryKey: companionGroupKeys.detail(matchingGroupId ?? ''),
    queryFn: () => {
      if (!matchingGroupId) throw new Error('Matching Group ID is required');
      return companionGroupService.getMatchingGroupDetail(matchingGroupId);
    },
    enabled: Boolean(matchingGroupId),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
