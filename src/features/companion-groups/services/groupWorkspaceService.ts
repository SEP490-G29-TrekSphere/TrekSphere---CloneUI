import { type ApiResponse, ApiService } from '@/config/apiClient';

/**
 * Service cho "Workspace nhóm" (dành cho thành viên/trưởng nhóm đã tham gia) — tái hiện
 * luồng/UI của WorkspacePreview + 4 sub-workspace (Itinerary/Budget/Members/Equipment) trong
 * `/groups/overview` (story-flow review), nối với dữ liệu thật thay vì dữ liệu tĩnh minh hoạ.
 *
 * Namespace endpoint riêng `/matching-groups/:groupId/workspace/*` để tách khỏi
 * `companionGroupService.ts` (CRUD nhóm/thành viên cốt lõi đã ổn định).
 */

function unwrapResponse<T>(response: ApiResponse<T>): T {
  if (response.error) throw new Error(response.error);
  return response.data as T;
}

// ---------- Lifecycle phase ----------

export type GroupLifecyclePhase = 1 | 2 | 3 | 4 | 5;

export interface GroupLifecycleResponse {
  phase: GroupLifecyclePhase;
  tripStatus: 'ONGOING' | 'COMPLETED';
}

// ---------- Feed ----------

export interface FeedPostItem {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  authorAvatarUrl?: string;
  createdAt: string;
  content: string;
  isAnnouncement: boolean;
  likeCount: number;
  likedByMe: boolean;
  commentsCount: number;
}

// ---------- Tracking / Checkpoints ----------

export type CheckpointStatus = 'COMPLETED' | 'IN_PROGRESS' | 'UPCOMING' | 'SKIPPED';

export interface TrailCheckpointItem {
  id: string;
  order: number;
  name: string;
  category: string;
  distanceAltitude: string;
  gps: string;
  imageUrl?: string;
  status: CheckpointStatus;
  checkedInByName?: string;
  checkedInAt?: string;
}

// ---------- Itinerary timetable ----------

export type TimeSlot = 'morning' | 'noon' | 'afternoon' | 'evening';

export interface ItineraryDayColumn {
  id: string;
  title: string;
  subtitle: string;
}

export interface ItineraryActivityItem {
  id: string;
  dayId: string;
  timeSlot: TimeSlot;
  timeRange: string;
  title: string;
  location: string;
  assignee: string;
}

// ---------- Budget workspace ----------

export type BudgetCategory = 'trans' | 'food' | 'gear' | 'other';

export interface BudgetPlanItem {
  id: string;
  category: BudgetCategory;
  title: string;
  amount: number;
  note?: string;
}

export interface ActualExpenseItem {
  id: string;
  title: string;
  payerId: string;
  payerName: string;
  amount: number;
}

export interface DebtSettlementItem {
  id: string;
  debtorId: string;
  debtorName: string;
  creditorId: string;
  creditorName: string;
  amount: number;
  status: 'PENDING' | 'CONFIRMED';
}

export interface GroupBudgetResponse {
  planItems: BudgetPlanItem[];
  actualExpenses: ActualExpenseItem[];
  settlements: DebtSettlementItem[];
}

// ---------- Equipment ----------

export interface EquipmentItemDto {
  id: string;
  name: string;
  category: 'personal' | 'shared';
  type: string;
  isEssential: boolean;
  assignedToUserId?: string;
  assignedToName?: string;
  isPrepared: boolean;
  notes?: string;
}

// ---------- Members workspace (extended profile + peer review) ----------

export interface MemberSkill {
  name: string;
}

export interface MemberMedicalInfo {
  bloodType?: string;
  allergies?: string;
  certifications?: string;
  emergencyPhone?: string;
  emergencyRelation?: string;
  note?: string;
}

export interface WorkspaceMemberItem {
  userId: string;
  fullName: string;
  avatarUrl?: string;
  roleLabel: string;
  isLeader: boolean;
  isCoLeader: boolean;
  trustScore: number;
  completedTrips: number;
  skills: MemberSkill[];
  medicalInfo: MemberMedicalInfo;
}

export interface PeerReviewPayload {
  revieweeId: string;
  punctualityScore: number;
  fitnessScore: number;
  financeScore: number;
  tags: string[];
  comment?: string;
}

export interface PeerReviewItem extends PeerReviewPayload {
  reviewerId: string;
  createdAt: string;
}

// ---------- Leader succession ----------

export interface SuccessionVote {
  userId: string;
  vote: 'YES' | 'NO';
}

export interface SuccessionRequestItem {
  id: string;
  requestedById: string;
  reason: string;
  nomineeId: string;
  nomineeName: string;
  votes: SuccessionVote[];
  status: 'OPEN' | 'APPROVED' | 'CANCELLED';
}

// ---------- Group dissolve (cần toàn bộ thành viên đồng thuận) ----------

export interface DissolveRequestItem {
  id: string;
  requestedById: string;
  reason: string;
  votes: SuccessionVote[];
  /** Số phiếu YES cần có để giải tán = tổng số thành viên đã tham gia (đồng thuận tuyệt đối). */
  requiredVotes: number;
  status: 'OPEN' | 'APPROVED' | 'CANCELLED';
}

export const groupWorkspaceService = {
  async getLifecycle(groupId: string): Promise<GroupLifecycleResponse> {
    return unwrapResponse(
      await ApiService<GroupLifecycleResponse>(
        `/matching-groups/${groupId}/workspace/lifecycle`,
        'GET'
      )
    );
  },
  async advanceLifecyclePhase(
    groupId: string,
    phase: GroupLifecyclePhase
  ): Promise<GroupLifecycleResponse> {
    return unwrapResponse(
      await ApiService<GroupLifecycleResponse>(
        `/matching-groups/${groupId}/workspace/lifecycle`,
        'PUT',
        { phase }
      )
    );
  },
  async setTripStatus(
    groupId: string,
    tripStatus: 'ONGOING' | 'COMPLETED'
  ): Promise<GroupLifecycleResponse> {
    return unwrapResponse(
      await ApiService<GroupLifecycleResponse>(
        `/matching-groups/${groupId}/workspace/trip-status`,
        'PUT',
        { tripStatus }
      )
    );
  },

  async getFeed(groupId: string): Promise<FeedPostItem[]> {
    return unwrapResponse(
      await ApiService<FeedPostItem[]>(`/matching-groups/${groupId}/workspace/feed`, 'GET')
    );
  },
  async createFeedPost(groupId: string, content: string): Promise<FeedPostItem> {
    return unwrapResponse(
      await ApiService<FeedPostItem>(`/matching-groups/${groupId}/workspace/feed`, 'POST', {
        content,
      })
    );
  },
  async toggleFeedPostLike(groupId: string, postId: string): Promise<FeedPostItem> {
    return unwrapResponse(
      await ApiService<FeedPostItem>(
        `/matching-groups/${groupId}/workspace/feed/${postId}/like`,
        'POST'
      )
    );
  },

  async getCheckpoints(groupId: string): Promise<TrailCheckpointItem[]> {
    return unwrapResponse(
      await ApiService<TrailCheckpointItem[]>(
        `/matching-groups/${groupId}/workspace/checkpoints`,
        'GET'
      )
    );
  },
  async addCheckpoint(
    groupId: string,
    data: {
      name: string;
      category: string;
      distanceAltitude: string;
      gps: string;
      imageUrl?: string;
    }
  ): Promise<TrailCheckpointItem> {
    return unwrapResponse(
      await ApiService<TrailCheckpointItem>(
        `/matching-groups/${groupId}/workspace/checkpoints`,
        'POST',
        data
      )
    );
  },
  async deleteCheckpoint(groupId: string, checkpointId: string): Promise<void> {
    unwrapResponse(
      await ApiService<void>(
        `/matching-groups/${groupId}/workspace/checkpoints/${checkpointId}`,
        'DELETE'
      )
    );
  },
  async checkInCheckpoint(groupId: string, checkpointId: string): Promise<TrailCheckpointItem> {
    return unwrapResponse(
      await ApiService<TrailCheckpointItem>(
        `/matching-groups/${groupId}/workspace/checkpoints/${checkpointId}/checkin`,
        'PUT'
      )
    );
  },
  /** Bỏ qua checkpoint (thực tế đi lệch kế hoạch) — vẫn chuyển sang checkpoint kế tiếp. */
  async skipCheckpoint(groupId: string, checkpointId: string): Promise<TrailCheckpointItem> {
    return unwrapResponse(
      await ApiService<TrailCheckpointItem>(
        `/matching-groups/${groupId}/workspace/checkpoints/${checkpointId}/skip`,
        'PUT'
      )
    );
  },

  async getItinerary(
    groupId: string
  ): Promise<{ days: ItineraryDayColumn[]; activities: ItineraryActivityItem[] }> {
    return unwrapResponse(
      await ApiService<{ days: ItineraryDayColumn[]; activities: ItineraryActivityItem[] }>(
        `/matching-groups/${groupId}/workspace/itinerary`,
        'GET'
      )
    );
  },
  async addItineraryDay(groupId: string): Promise<ItineraryDayColumn> {
    return unwrapResponse(
      await ApiService<ItineraryDayColumn>(
        `/matching-groups/${groupId}/workspace/itinerary/days`,
        'POST'
      )
    );
  },
  async addItineraryActivity(
    groupId: string,
    data: Omit<ItineraryActivityItem, 'id'>
  ): Promise<ItineraryActivityItem> {
    return unwrapResponse(
      await ApiService<ItineraryActivityItem>(
        `/matching-groups/${groupId}/workspace/itinerary/activities`,
        'POST',
        data
      )
    );
  },
  async deleteItineraryActivity(groupId: string, activityId: string): Promise<void> {
    unwrapResponse(
      await ApiService<void>(
        `/matching-groups/${groupId}/workspace/itinerary/activities/${activityId}`,
        'DELETE'
      )
    );
  },

  async getBudget(groupId: string): Promise<GroupBudgetResponse> {
    return unwrapResponse(
      await ApiService<GroupBudgetResponse>(`/matching-groups/${groupId}/workspace/budget`, 'GET')
    );
  },
  async savePlanItem(
    groupId: string,
    data: Omit<BudgetPlanItem, 'id'> & { id?: string }
  ): Promise<BudgetPlanItem> {
    return unwrapResponse(
      await ApiService<BudgetPlanItem>(
        `/matching-groups/${groupId}/workspace/budget/plan-items`,
        'POST',
        data
      )
    );
  },
  async deletePlanItem(groupId: string, itemId: string): Promise<void> {
    unwrapResponse(
      await ApiService<void>(
        `/matching-groups/${groupId}/workspace/budget/plan-items/${itemId}`,
        'DELETE'
      )
    );
  },
  async saveExpense(
    groupId: string,
    data: { id?: string; title: string; payerId: string; amount: number }
  ): Promise<ActualExpenseItem> {
    return unwrapResponse(
      await ApiService<ActualExpenseItem>(
        `/matching-groups/${groupId}/workspace/budget/expenses`,
        'POST',
        data
      )
    );
  },
  async deleteExpense(groupId: string, expenseId: string): Promise<void> {
    unwrapResponse(
      await ApiService<void>(
        `/matching-groups/${groupId}/workspace/budget/expenses/${expenseId}`,
        'DELETE'
      )
    );
  },
  async confirmSettlement(groupId: string, settlementId: string): Promise<DebtSettlementItem> {
    return unwrapResponse(
      await ApiService<DebtSettlementItem>(
        `/matching-groups/${groupId}/workspace/budget/settlements/${settlementId}/confirm`,
        'PUT'
      )
    );
  },

  async getEquipment(groupId: string): Promise<EquipmentItemDto[]> {
    return unwrapResponse(
      await ApiService<EquipmentItemDto[]>(`/matching-groups/${groupId}/workspace/equipment`, 'GET')
    );
  },
  async addEquipmentItem(
    groupId: string,
    data: Omit<EquipmentItemDto, 'id' | 'isPrepared'>
  ): Promise<EquipmentItemDto> {
    return unwrapResponse(
      await ApiService<EquipmentItemDto>(
        `/matching-groups/${groupId}/workspace/equipment`,
        'POST',
        data
      )
    );
  },
  async toggleEquipmentPrepared(groupId: string, itemId: string): Promise<EquipmentItemDto> {
    return unwrapResponse(
      await ApiService<EquipmentItemDto>(
        `/matching-groups/${groupId}/workspace/equipment/${itemId}/toggle`,
        'PUT'
      )
    );
  },

  async getWorkspaceMembers(groupId: string): Promise<WorkspaceMemberItem[]> {
    return unwrapResponse(
      await ApiService<WorkspaceMemberItem[]>(
        `/matching-groups/${groupId}/workspace/members`,
        'GET'
      )
    );
  },
  async getPeerReviews(groupId: string): Promise<PeerReviewItem[]> {
    return unwrapResponse(
      await ApiService<PeerReviewItem[]>(
        `/matching-groups/${groupId}/workspace/peer-reviews`,
        'GET'
      )
    );
  },
  async submitPeerReview(groupId: string, payload: PeerReviewPayload): Promise<PeerReviewItem> {
    return unwrapResponse(
      await ApiService<PeerReviewItem>(
        `/matching-groups/${groupId}/workspace/peer-reviews`,
        'POST',
        payload
      )
    );
  },

  async getSuccessionRequest(groupId: string): Promise<SuccessionRequestItem | null> {
    return unwrapResponse(
      await ApiService<SuccessionRequestItem | null>(
        `/matching-groups/${groupId}/workspace/succession-request`,
        'GET'
      )
    );
  },
  async createSuccessionRequest(
    groupId: string,
    data: { reason: string; nomineeId: string }
  ): Promise<SuccessionRequestItem> {
    return unwrapResponse(
      await ApiService<SuccessionRequestItem>(
        `/matching-groups/${groupId}/workspace/succession-request`,
        'POST',
        data
      )
    );
  },
  async voteSuccessionRequest(
    groupId: string,
    requestId: string,
    vote: 'YES' | 'NO'
  ): Promise<SuccessionRequestItem> {
    return unwrapResponse(
      await ApiService<SuccessionRequestItem>(
        `/matching-groups/${groupId}/workspace/succession-request/${requestId}/vote`,
        'POST',
        { vote }
      )
    );
  },
  async cancelSuccessionRequest(groupId: string): Promise<void> {
    unwrapResponse(
      await ApiService<void>(`/matching-groups/${groupId}/workspace/succession-request`, 'DELETE')
    );
  },

  async getDissolveRequest(groupId: string): Promise<DissolveRequestItem | null> {
    return unwrapResponse(
      await ApiService<DissolveRequestItem | null>(
        `/matching-groups/${groupId}/workspace/dissolve-request`,
        'GET'
      )
    );
  },
  async createDissolveRequest(groupId: string, reason: string): Promise<DissolveRequestItem> {
    return unwrapResponse(
      await ApiService<DissolveRequestItem>(
        `/matching-groups/${groupId}/workspace/dissolve-request`,
        'POST',
        { reason }
      )
    );
  },
  async voteDissolveRequest(
    groupId: string,
    requestId: string,
    vote: 'YES' | 'NO'
  ): Promise<DissolveRequestItem> {
    return unwrapResponse(
      await ApiService<DissolveRequestItem>(
        `/matching-groups/${groupId}/workspace/dissolve-request/${requestId}/vote`,
        'POST',
        { vote }
      )
    );
  },
  async cancelDissolveRequest(groupId: string): Promise<void> {
    unwrapResponse(
      await ApiService<void>(`/matching-groups/${groupId}/workspace/dissolve-request`, 'DELETE')
    );
  },
};
