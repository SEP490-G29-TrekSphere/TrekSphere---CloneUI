import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { groupWorkspaceService } from '../services/groupWorkspaceService';
import { groupWorkspaceKeys } from './groupWorkspaceKeys';

export function useGroupFeed(groupId: string | undefined) {
  return useQuery({
    queryKey: groupWorkspaceKeys.feed(groupId ?? ''),
    queryFn: () => groupWorkspaceService.getFeed(groupId as string),
    enabled: Boolean(groupId),
  });
}

export function useCreateFeedPost(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => groupWorkspaceService.createFeedPost(groupId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.feed(groupId) });
    },
  });
}

export function useToggleFeedPostLike(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => groupWorkspaceService.toggleFeedPostLike(groupId, postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.feed(groupId) });
    },
  });
}
