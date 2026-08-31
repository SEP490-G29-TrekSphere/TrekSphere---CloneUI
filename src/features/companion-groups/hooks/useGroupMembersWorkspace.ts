import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PeerReviewPayload } from '../services/groupWorkspaceService';
import { groupWorkspaceService } from '../services/groupWorkspaceService';
import { groupWorkspaceKeys } from './groupWorkspaceKeys';

export function useGroupWorkspaceMembers(groupId: string | undefined) {
  return useQuery({
    queryKey: groupWorkspaceKeys.members(groupId ?? ''),
    queryFn: () => groupWorkspaceService.getWorkspaceMembers(groupId as string),
    enabled: Boolean(groupId),
  });
}

export function useGroupPeerReviews(groupId: string | undefined) {
  return useQuery({
    queryKey: groupWorkspaceKeys.peerReviews(groupId ?? ''),
    queryFn: () => groupWorkspaceService.getPeerReviews(groupId as string),
    enabled: Boolean(groupId),
  });
}

export function useSubmitPeerReview(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PeerReviewPayload) =>
      groupWorkspaceService.submitPeerReview(groupId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.peerReviews(groupId) });
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.members(groupId) });
    },
  });
}
