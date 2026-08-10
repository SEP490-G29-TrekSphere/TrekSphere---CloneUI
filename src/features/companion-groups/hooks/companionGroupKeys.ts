/**
 * Centralized React Query key factory for the companion-groups feature.
 *
 * Every query and mutation in this feature MUST use keys from this factory
 * so that `invalidateQueries` always hits the right cache entries.
 */
export const companionGroupKeys = {
  all: ['companion-groups'] as const,

  // GET /matching-groups — public listing
  lists: () => [...companionGroupKeys.all, 'list'] as const,
  list: (params: object) => [...companionGroupKeys.lists(), params] as const,

  // GET /matching-groups/:id — single group detail
  details: () => [...companionGroupKeys.all, 'detail'] as const,
  detail: (id: string) => [...companionGroupKeys.details(), id] as const,

  // GET /matching-groups/:id/members/me — current user's membership status
  memberStatuses: () => [...companionGroupKeys.all, 'member-me'] as const,
  memberStatus: (id: string) => [...companionGroupKeys.memberStatuses(), id] as const,

  // GET /matching-groups/owned — groups I own / belong to
  myGroups: () => [...companionGroupKeys.all, 'my-groups'] as const,
  myGroupList: (params: object) => [...companionGroupKeys.myGroups(), params] as const,

  // GET /matching-groups/join-requests/me — my outgoing join requests
  myJoinRequests: () => [...companionGroupKeys.all, 'my-join-requests'] as const,
  myJoinRequestList: (params: object) => [...companionGroupKeys.myJoinRequests(), params] as const,

  // GET /matching-groups/:id/join-requests — incoming requests (owner view)
  joinRequests: () => [...companionGroupKeys.all, 'join-requests'] as const,
  joinRequestList: (groupId: string, params?: object) =>
    [...companionGroupKeys.joinRequests(), groupId, params] as const,
};
