import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/store/useAppStore';
import { companionGroupService } from '../services/companionGroupService';

export function useMyMemberStatus(matchingGroupId?: string) {
  const user = useAppStore((state) => state.user);

  return useQuery({
    queryKey: ['matching-group-member-me', matchingGroupId],
    queryFn: () => {
      if (!matchingGroupId) throw new Error('Matching Group ID is required');
      return companionGroupService.getMyMemberStatus(matchingGroupId);
    },
    enabled: Boolean(matchingGroupId) && Boolean(user),
    staleTime: 1000 * 30, // 30 seconds
    retry: false,
  });
}
