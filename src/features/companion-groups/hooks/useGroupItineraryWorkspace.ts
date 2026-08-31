import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ItineraryActivityItem } from '../services/groupWorkspaceService';
import { groupWorkspaceService } from '../services/groupWorkspaceService';
import { groupWorkspaceKeys } from './groupWorkspaceKeys';

export function useGroupItineraryWorkspace(groupId: string | undefined) {
  return useQuery({
    queryKey: groupWorkspaceKeys.itinerary(groupId ?? ''),
    queryFn: () => groupWorkspaceService.getItinerary(groupId as string),
    enabled: Boolean(groupId),
  });
}

export function useAddItineraryDay(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => groupWorkspaceService.addItineraryDay(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.itinerary(groupId) });
    },
  });
}

export function useAddItineraryActivity(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<ItineraryActivityItem, 'id'>) =>
      groupWorkspaceService.addItineraryActivity(groupId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.itinerary(groupId) });
    },
  });
}

export function useDeleteItineraryActivity(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (activityId: string) =>
      groupWorkspaceService.deleteItineraryActivity(groupId, activityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.itinerary(groupId) });
    },
  });
}
