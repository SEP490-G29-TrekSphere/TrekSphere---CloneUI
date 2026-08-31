/** Query key factory cho `groupWorkspaceService.ts` (Workspace nhóm). */
export const groupWorkspaceKeys = {
  all: ['group-workspace'] as const,

  lifecycle: (groupId: string) => [...groupWorkspaceKeys.all, 'lifecycle', groupId] as const,
  feed: (groupId: string) => [...groupWorkspaceKeys.all, 'feed', groupId] as const,
  checkpoints: (groupId: string) => [...groupWorkspaceKeys.all, 'checkpoints', groupId] as const,
  itinerary: (groupId: string) => [...groupWorkspaceKeys.all, 'itinerary', groupId] as const,
  budget: (groupId: string) => [...groupWorkspaceKeys.all, 'budget', groupId] as const,
  equipment: (groupId: string) => [...groupWorkspaceKeys.all, 'equipment', groupId] as const,
  members: (groupId: string) => [...groupWorkspaceKeys.all, 'members', groupId] as const,
  peerReviews: (groupId: string) => [...groupWorkspaceKeys.all, 'peer-reviews', groupId] as const,
  succession: (groupId: string) => [...groupWorkspaceKeys.all, 'succession', groupId] as const,
  dissolve: (groupId: string) => [...groupWorkspaceKeys.all, 'dissolve', groupId] as const,
};
