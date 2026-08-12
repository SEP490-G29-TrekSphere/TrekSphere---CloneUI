import { type ApiResponse, ApiService } from '@/config/apiClient';

export interface MatchingGroupCreateRequest {
  tourId: string;
  groupName: string;
  description?: string;
  maxSize: number;
  targetDate: string; // 'yyyy-MM-dd'
  matchingDeadline: string; // ISO date-time
}

export type MatchingGroupStatus = 'OPEN' | 'FULL' | 'CLOSED' | 'HIDDEN';

export interface MatchingGroupItem {
  matchingGroupId: string;
  tourId: string;
  tourName: string;
  ownerId: string;
  ownerName: string;
  ownerAvatarUrl?: string;
  groupName: string;
  description?: string;
  maxSize: number;
  currentSize: number;
  targetDate: string; // 'yyyy-MM-dd'
  matchingDeadline: string; // ISO String
  status: MatchingGroupStatus;
  createdAt: string; // ISO String
}

export interface GetMatchingGroupsParams {
  tourId?: string;
  targetDate?: string;
  keyword?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
}

export interface GetJoinRequestsParams {
  status?: MatchingMemberStatus;
  page?: number;
  size?: number;
}

export interface MyMatchingJoinRequestItem {
  matchingMemberId: string;
  matchingGroupId: string;
  groupName: string;
  groupStatus: MatchingGroupStatus;
  tourId: string;
  tourName: string;
  ownerId: string;
  ownerName: string;
  ownerAvatarUrl?: string;
  currentSize: number;
  maxSize: number;
  targetDate: string; // 'yyyy-MM-dd'
  matchingDeadline: string; // ISO string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'LEFT';
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  canCancel: boolean;
}

export interface MyMatchingJoinRequestPaginationResponse {
  content: MyMatchingJoinRequestItem[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface MatchingMemberPaginationResponse {
  content: MatchingMemberItem[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface MatchingGroupPaginationResponse {
  content: MatchingGroupItem[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export type MatchingMemberRole = 'OWNER' | 'MEMBER';
export type MatchingMemberStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'LEFT';

export interface MatchingMemberItem {
  matchingMemberId: string;
  userId: string;
  fullName: string;
  avatarUrl?: string;
  role: MatchingMemberRole;
  status: MatchingMemberStatus;
  createdAt: string; // ISO string
  isInConversation?: boolean;
}

export interface MatchingGroupDetailResponse {
  matchingGroupId: string;
  tourId: string;
  tourName: string;
  ownerId: string;
  ownerName: string;
  ownerAvatarUrl?: string;
  groupName: string;
  description?: string;
  maxSize: number;
  currentSize: number;
  targetDate: string; // 'yyyy-MM-dd'
  matchingDeadline: string; // ISO string
  status: MatchingGroupStatus;
  createdAt: string; // ISO string
  members: MatchingMemberItem[];
  hasConversation?: boolean;
  isInConversation?: boolean;
}

function unwrapResponse<T>(response: ApiResponse<T>): T {
  if (response.error) {
    throw new Error(response.error);
  }
  return response.data as T;
}

/** Pagination rỗng trả về khi BE chưa mở public access (guest 401). */
const EMPTY_PAGINATION: MatchingGroupPaginationResponse = {
  content: [],
  pageNumber: 0,
  pageSize: 0,
  totalElements: 0,
  totalPages: 0,
  last: true,
};

export const companionGroupService = {
  async getMatchingGroups(
    params: GetMatchingGroupsParams = {}
  ): Promise<MatchingGroupPaginationResponse> {
    const queryParams: Record<string, string> = {};

    if (params.tourId) queryParams.tourId = params.tourId;
    if (params.targetDate) queryParams.targetDate = params.targetDate;
    if (params.keyword !== undefined && params.keyword.trim() !== '') {
      queryParams.keyword = params.keyword.trim();
    }
    if (params.page !== undefined) queryParams.page = String(params.page);
    if (params.size !== undefined) queryParams.size = String(params.size);
    if (params.sortBy) queryParams.sortBy = params.sortBy;
    if (params.sortDir) queryParams.sortDir = params.sortDir;

    const response = await ApiService<MatchingGroupPaginationResponse>(
      '/matching-groups',
      'GET',
      undefined,
      queryParams
    );

    // Nếu BE trả 401 (chưa mở public access cho guest), trả về danh sách rỗng
    // thay vì throw lỗi — trang vẫn hiển thị được, không bị màn hình đỏ.
    if (response.status === 401) {
      return EMPTY_PAGINATION;
    }

    return unwrapResponse(response);
  },

  async getMatchingGroupDetail(matchingGroupId: string): Promise<MatchingGroupDetailResponse> {
    const response = await ApiService<MatchingGroupDetailResponse>(
      `/matching-groups/${matchingGroupId}`,
      'GET'
    );

    return unwrapResponse(response);
  },

  async createMatchingGroup(
    payload: MatchingGroupCreateRequest
  ): Promise<MatchingGroupDetailResponse> {
    const response = await ApiService<MatchingGroupDetailResponse>(
      '/matching-groups',
      'POST',
      payload
    );

    return unwrapResponse(response);
  },

  async deleteMatchingGroup(matchingGroupId: string): Promise<void> {
    const response = await ApiService<void>(`/matching-groups/${matchingGroupId}`, 'DELETE');

    unwrapResponse(response);
  },

  async joinMatchingGroup(matchingGroupId: string): Promise<MatchingMemberItem> {
    const response = await ApiService<MatchingMemberItem>(
      `/matching-groups/${matchingGroupId}/join`,
      'POST'
    );

    return unwrapResponse(response);
  },

  async getMyMemberStatus(matchingGroupId: string): Promise<MatchingMemberItem> {
    const response = await ApiService<MatchingMemberItem>(
      `/matching-groups/${matchingGroupId}/members/me`,
      'GET'
    );

    return unwrapResponse(response);
  },

  async leaveMatchingGroup(matchingGroupId: string): Promise<MatchingMemberItem> {
    const response = await ApiService<MatchingMemberItem>(
      `/matching-groups/${matchingGroupId}/members/me`,
      'DELETE'
    );

    return unwrapResponse(response);
  },

  async cancelJoinRequest(matchingGroupId: string): Promise<MatchingMemberItem> {
    const response = await ApiService<MatchingMemberItem>(
      `/matching-groups/${matchingGroupId}/join-request`,
      'DELETE'
    );

    return unwrapResponse(response);
  },

  async approveMember(groupId: string, memberId: string): Promise<MatchingMemberItem> {
    const response = await ApiService<MatchingMemberItem>(
      `/matching-groups/${groupId}/join-requests/${memberId}/approve`,
      'PUT'
    );

    return unwrapResponse(response);
  },

  async rejectMember(groupId: string, memberId: string): Promise<MatchingMemberItem> {
    const response = await ApiService<MatchingMemberItem>(
      `/matching-groups/${groupId}/join-requests/${memberId}/reject`,
      'PUT'
    );

    return unwrapResponse(response);
  },

  async getJoinRequests(
    groupId: string,
    params: GetJoinRequestsParams = {}
  ): Promise<MatchingMemberPaginationResponse> {
    const queryParams: Record<string, string> = {};

    if (params.status) queryParams.status = params.status;
    if (params.page !== undefined) queryParams.page = String(params.page);
    if (params.size !== undefined) queryParams.size = String(params.size);

    const response = await ApiService<MatchingMemberPaginationResponse>(
      `/matching-groups/${groupId}/join-requests`,
      'GET',
      undefined,
      queryParams
    );

    return unwrapResponse(response);
  },

  async getMyMatchingGroups(
    params: {
      status?: string;
      keyword?: string;
      page?: number;
      size?: number;
      sortBy?: string;
      sortDir?: string;
    } = {}
  ): Promise<MatchingGroupPaginationResponse> {
    const queryParams: Record<string, string> = {};
    if (params.status) queryParams.status = params.status;
    if (params.keyword !== undefined && params.keyword.trim() !== '') {
      queryParams.keyword = params.keyword.trim();
    }
    if (params.page !== undefined) queryParams.page = String(params.page);
    if (params.size !== undefined) queryParams.size = String(params.size);
    if (params.sortBy) queryParams.sortBy = params.sortBy;
    if (params.sortDir) queryParams.sortDir = params.sortDir;

    const response = await ApiService<MatchingGroupPaginationResponse>(
      '/matching-groups/owned',
      'GET',
      undefined,
      queryParams
    );

    if (response.status === 401) {
      return EMPTY_PAGINATION;
    }

    return unwrapResponse(response);
  },

  async getMyJoinRequests(
    params: { status?: string; page?: number; size?: number } = {}
  ): Promise<MyMatchingJoinRequestPaginationResponse> {
    const queryParams: Record<string, string> = {};
    if (params.status) queryParams.status = params.status;
    if (params.page !== undefined) queryParams.page = String(params.page);
    if (params.size !== undefined) queryParams.size = String(params.size);

    const response = await ApiService<MyMatchingJoinRequestPaginationResponse>(
      '/matching-groups/join-requests/me',
      'GET',
      undefined,
      queryParams
    );

    return unwrapResponse(response);
  },
};
