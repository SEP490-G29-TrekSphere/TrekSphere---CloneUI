import { http } from 'msw';
import { findUserById, mockUsers } from '../data/users';
import { fail, ok } from '../envelope';
import { groups, type MatchingGroup, type MatchingMemberItem } from './companion-groups';

/**
 * Mock cho `groupWorkspaceService.ts` — "Workspace nhóm" dành cho thành viên/trưởng nhóm đã
 * tham gia (Feed, Live tracking/checkpoints, Lộ trình chi tiết, Ngân sách C2C, Thành viên +
 * Peer review, Checklist đồ dùng, Chuyển giao Leader). Tái hiện đúng luồng/UI của
 * WorkspacePreview trong `/groups/overview` (story-flow review) nhưng nối dữ liệu thật.
 *
 * Toàn bộ state lưu trong 1 in-memory store keyed theo matchingGroupId, khởi tạo lười (lazy)
 * dựa trên thành viên thật của nhóm (từ `companion-groups.ts`) — không dùng tên người hư cấu.
 */

type LifecyclePhase = 1 | 2 | 3 | 4 | 5;
type TripStatus = 'ONGOING' | 'COMPLETED';
type CheckpointStatus = 'COMPLETED' | 'IN_PROGRESS' | 'UPCOMING' | 'SKIPPED';
type TimeSlot = 'morning' | 'noon' | 'afternoon' | 'evening';
type BudgetCategory = 'trans' | 'food' | 'gear' | 'other';

interface FeedPost {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  authorAvatarUrl?: string;
  createdAt: string;
  content: string;
  isAnnouncement: boolean;
  likedBy: string[];
  commentsCount: number;
}

interface TrailCheckpoint {
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

interface ItineraryDayColumn {
  id: string;
  title: string;
  subtitle: string;
}

interface ItineraryActivity {
  id: string;
  dayId: string;
  timeSlot: TimeSlot;
  timeRange: string;
  title: string;
  location: string;
  assignee: string;
}

interface BudgetPlanItem {
  id: string;
  category: BudgetCategory;
  title: string;
  amount: number;
  note?: string;
}

interface ActualExpense {
  id: string;
  title: string;
  payerId: string;
  payerName: string;
  amount: number;
}

interface EquipmentItem {
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

interface MemberProfile {
  skills: string[];
  bloodType: string;
  allergies: string;
  certifications: string;
  emergencyPhone: string;
  emergencyRelation: string;
  note: string;
  trustScore: number;
  completedTrips: number;
}

interface PeerReview {
  reviewerId: string;
  revieweeId: string;
  punctualityScore: number;
  fitnessScore: number;
  financeScore: number;
  tags: string[];
  comment?: string;
  createdAt: string;
}

interface SuccessionRequest {
  id: string;
  requestedById: string;
  reason: string;
  nomineeId: string;
  votes: { userId: string; vote: 'YES' | 'NO' }[];
  status: 'OPEN' | 'APPROVED' | 'CANCELLED';
}

interface DissolveRequest {
  id: string;
  requestedById: string;
  reason: string;
  votes: { userId: string; vote: 'YES' | 'NO' }[];
  status: 'OPEN' | 'APPROVED' | 'CANCELLED';
}

interface WorkspaceState {
  phase: LifecyclePhase;
  tripStatus: TripStatus;
  feed: FeedPost[];
  checkpoints: TrailCheckpoint[];
  itineraryDays: ItineraryDayColumn[];
  itineraryActivities: ItineraryActivity[];
  budgetPlanItems: BudgetPlanItem[];
  actualExpenses: ActualExpense[];
  equipment: EquipmentItem[];
  memberProfiles: Record<string, MemberProfile>;
  peerReviews: PeerReview[];
  succession: SuccessionRequest | null;
  dissolve: DissolveRequest | null;
}

const SKILL_POOL = [
  'Sơ cứu cơ bản',
  'Dẫn đường',
  'Nấu ăn dã ngoại',
  'Sửa xe',
  'Nhiếp ảnh',
  'Dựng lều',
];
const EQUIPMENT_TYPES = ['Trang phục', 'Lều trại', 'Nấu nướng', 'Y tế', 'Điện tử', 'Bảo hộ'];

function acceptedMembers(group: MatchingGroup): MatchingMemberItem[] {
  return group.members.filter((m) => m.status === 'ACCEPTED');
}

function roleLabel(group: MatchingGroup, userId: string): string {
  if (group.ownerId === userId) return 'Trưởng nhóm';
  return 'Thành viên';
}

let idSeq = 1000;
function nextId(prefix: string) {
  idSeq += 1;
  return `${prefix}-${idSeq}`;
}

function buildDefaultWorkspace(groupId: string): WorkspaceState {
  const group = groups.find((g) => g.matchingGroupId === groupId);
  const members = group ? acceptedMembers(group) : [];

  const feed: FeedPost[] = group
    ? [
        {
          id: nextId('post'),
          authorId: group.ownerId,
          authorName: group.ownerName,
          authorRole: 'Trưởng nhóm',
          authorAvatarUrl: group.ownerAvatarUrl,
          createdAt: group.createdAt,
          isAnnouncement: true,
          content: `Chào cả nhóm! Mình đã lập nhóm "${group.groupName}". Mọi người chia sẻ thông tin chuẩn bị đồ dùng và thắc mắc ngay tại đây nhé.`,
          likedBy: [],
          commentsCount: 0,
        },
      ]
    : [];

  const checkpoints: TrailCheckpoint[] = (group?.itinerary ?? []).map((day, idx) => ({
    id: nextId('cp'),
    order: idx + 1,
    name: day.title,
    category: idx === 0 ? 'Tập kết & khởi hành' : `Chặng ${idx + 1}`,
    distanceAltitude: '—',
    gps: '—',
    imageUrl: group?.tourImageUrl,
    // Checkpoint đầu tiên sẵn sàng để check-in ngay khi nhóm chuyển sang giai đoạn 4
    // (nếu không, không có checkpoint nào ở trạng thái IN_PROGRESS để bấm check-in).
    status: (idx === 0 ? 'IN_PROGRESS' : 'UPCOMING') as CheckpointStatus,
  }));

  const itineraryDays: ItineraryDayColumn[] = (group?.itinerary ?? []).map((day) => ({
    id: `day-${day.day}`,
    title: `Ngày ${day.day}`,
    subtitle: day.title,
  }));

  const itineraryActivities: ItineraryActivity[] = (group?.itinerary ?? []).flatMap((day) => [
    {
      id: nextId('act'),
      dayId: `day-${day.day}`,
      timeSlot: 'morning' as TimeSlot,
      timeRange: '',
      title: day.title,
      location: group?.location ?? '',
      assignee: group?.ownerName ?? '',
    },
  ]);

  const budgetPlanItems: BudgetPlanItem[] = (group?.budgetItems ?? []).map((item) => ({
    id: nextId('plan'),
    category: 'other' as BudgetCategory,
    title: item.label,
    amount: item.amount,
  }));

  const equipment: EquipmentItem[] = [
    {
      id: nextId('eq'),
      name: 'Lều cắm trại',
      category: 'shared',
      type: 'Lều trại',
      isEssential: true,
      assignedToUserId: members[0]?.userId,
      assignedToName: members[0]?.fullName,
      isPrepared: false,
    },
    {
      id: nextId('eq'),
      name: 'Bộ sơ cứu y tế',
      category: 'shared',
      type: 'Y tế',
      isEssential: true,
      assignedToUserId: members[1]?.userId ?? members[0]?.userId,
      assignedToName: members[1]?.fullName ?? members[0]?.fullName,
      isPrepared: false,
    },
    {
      id: nextId('eq'),
      name: 'Đèn pin đeo đầu + pin dự phòng',
      category: 'personal',
      type: 'Điện tử',
      isEssential: true,
      isPrepared: false,
    },
    {
      id: nextId('eq'),
      name: 'Áo mưa bộ',
      category: 'personal',
      type: 'Trang phục',
      isEssential: true,
      isPrepared: false,
    },
  ];

  const memberProfiles: Record<string, MemberProfile> = {};
  members.forEach((m, idx) => {
    memberProfiles[m.userId] = {
      skills: [SKILL_POOL[idx % SKILL_POOL.length], SKILL_POOL[(idx + 2) % SKILL_POOL.length]],
      bloodType: ['O+', 'A+', 'B+', 'AB+', 'O-'][idx % 5],
      allergies: 'Không dị ứng',
      certifications: 'Chưa cập nhật',
      emergencyPhone: '090xxxxxxx',
      emergencyRelation: 'Người thân',
      note: 'Chưa cập nhật ghi chú thể lực.',
      trustScore: 85 + ((idx * 3) % 15),
      completedTrips: idx,
    };
  });

  return {
    phase: 2,
    tripStatus: 'ONGOING',
    feed,
    checkpoints,
    itineraryDays,
    itineraryActivities,
    budgetPlanItems,
    actualExpenses: [],
    equipment,
    memberProfiles,
    peerReviews: [],
    succession: null,
    dissolve: null,
  };
}

const workspaceStore: Record<string, WorkspaceState> = {};

function getWorkspace(groupId: string): WorkspaceState {
  if (!workspaceStore[groupId]) {
    workspaceStore[groupId] = buildDefaultWorkspace(groupId);
  }
  return workspaceStore[groupId];
}

function currentUser(request: Request) {
  const auth = request.headers.get('authorization');
  const rest = auth?.startsWith('Bearer mock-access-')
    ? auth.replace('Bearer mock-access-', '')
    : '';
  const id = rest.split('-').slice(0, -1).join('-') || null;
  return (id && findUserById(id)) || mockUsers[1];
}

function toFeedItem(post: FeedPost, userId: string) {
  return {
    id: post.id,
    authorId: post.authorId,
    authorName: post.authorName,
    authorRole: post.authorRole,
    authorAvatarUrl: post.authorAvatarUrl,
    createdAt: post.createdAt,
    content: post.content,
    isAnnouncement: post.isAnnouncement,
    likeCount: post.likedBy.length,
    likedByMe: post.likedBy.includes(userId),
    commentsCount: post.commentsCount,
  };
}

/** Tính toán bù trừ nợ tối ưu (greedy min-cash-flow) từ chi phí thực tế / chia đều đầu người. */
function computeSettlements(
  group: MatchingGroup | undefined,
  actualExpenses: ActualExpense[]
): {
  id: string;
  debtorId: string;
  debtorName: string;
  creditorId: string;
  creditorName: string;
  amount: number;
  status: 'PENDING' | 'CONFIRMED';
}[] {
  const members = group ? acceptedMembers(group) : [];
  if (members.length === 0 || actualExpenses.length === 0) return [];

  const total = actualExpenses.reduce((sum, e) => sum + e.amount, 0);
  const perPerson = total / members.length;

  const balances = members.map((m) => {
    const paid = actualExpenses
      .filter((e) => e.payerId === m.userId)
      .reduce((sum, e) => sum + e.amount, 0);
    return { userId: m.userId, name: m.fullName, balance: paid - perPerson };
  });

  const debtors = balances.filter((b) => b.balance < -1).sort((a, b) => a.balance - b.balance);
  const creditors = balances.filter((b) => b.balance > 1).sort((a, b) => b.balance - a.balance);

  const settlements: {
    id: string;
    debtorId: string;
    debtorName: string;
    creditorId: string;
    creditorName: string;
    amount: number;
    status: 'PENDING' | 'CONFIRMED';
  }[] = [];

  let di = 0;
  let ci = 0;
  while (di < debtors.length && ci < creditors.length) {
    const debtor = debtors[di];
    const creditor = creditors[ci];
    const amount = Math.min(-debtor.balance, creditor.balance);
    if (amount > 1) {
      settlements.push({
        id: `settle-${debtor.userId}-${creditor.userId}`,
        debtorId: debtor.userId,
        debtorName: debtor.name,
        creditorId: creditor.userId,
        creditorName: creditor.name,
        amount: Math.round(amount),
        status: 'PENDING',
      });
    }
    debtor.balance += amount;
    creditor.balance -= amount;
    if (Math.abs(debtor.balance) < 1) di += 1;
    if (Math.abs(creditor.balance) < 1) ci += 1;
  }
  return settlements;
}

const confirmedSettlementIds = new Set<string>();

export const companionGroupWorkspaceHandlers = [
  // ---------- Lifecycle ----------
  http.get('*/matching-groups/:groupId/workspace/lifecycle', ({ params }) => {
    const ws = getWorkspace(params.groupId as string);
    return ok({ phase: ws.phase, tripStatus: ws.tripStatus });
  }),
  http.put('*/matching-groups/:groupId/workspace/lifecycle', async ({ params, request }) => {
    const ws = getWorkspace(params.groupId as string);
    const body = (await request.json().catch(() => ({}))) as { phase?: LifecyclePhase };
    if (body.phase && body.phase >= 1 && body.phase <= 5) ws.phase = body.phase;
    return ok({ phase: ws.phase, tripStatus: ws.tripStatus }, 'Đã cập nhật giai đoạn nhóm.');
  }),
  http.put('*/matching-groups/:groupId/workspace/trip-status', async ({ params, request }) => {
    const ws = getWorkspace(params.groupId as string);
    const body = (await request.json().catch(() => ({}))) as { tripStatus?: TripStatus };
    if (body.tripStatus) ws.tripStatus = body.tripStatus;
    return ok({ phase: ws.phase, tripStatus: ws.tripStatus }, 'Đã cập nhật trạng thái chuyến đi.');
  }),

  // ---------- Feed ----------
  http.get('*/matching-groups/:groupId/workspace/feed', ({ params, request }) => {
    const ws = getWorkspace(params.groupId as string);
    const user = currentUser(request);
    const items = [...ws.feed]
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .map((p) => toFeedItem(p, user.id));
    return ok(items);
  }),
  http.post('*/matching-groups/:groupId/workspace/feed', async ({ params, request }) => {
    const groupId = params.groupId as string;
    const ws = getWorkspace(groupId);
    const group = groups.find((g) => g.matchingGroupId === groupId);
    const user = currentUser(request);
    const body = (await request.json().catch(() => ({}))) as { content?: string };
    if (!body.content?.trim()) return fail('Nội dung bài đăng không được để trống.', 400);

    const isSos = body.content.includes('SOS') || body.content.includes('CẢNH BÁO');
    const post: FeedPost = {
      id: nextId('post'),
      authorId: user.id,
      authorName: user.fullName,
      authorRole: group ? roleLabel(group, user.id) : 'Thành viên',
      authorAvatarUrl: user.avatarUrl,
      createdAt: new Date().toISOString(),
      content: body.content.trim(),
      isAnnouncement: isSos || false,
      likedBy: [],
      commentsCount: 0,
    };
    ws.feed.unshift(post);
    return ok(toFeedItem(post, user.id), 'Đã đăng bài.', 201);
  }),
  http.post('*/matching-groups/:groupId/workspace/feed/:postId/like', ({ params, request }) => {
    const ws = getWorkspace(params.groupId as string);
    const user = currentUser(request);
    const post = ws.feed.find((p) => p.id === params.postId);
    if (!post) return fail('Không tìm thấy bài đăng.', 404);
    const idx = post.likedBy.indexOf(user.id);
    if (idx >= 0) post.likedBy.splice(idx, 1);
    else post.likedBy.push(user.id);
    return ok(toFeedItem(post, user.id));
  }),

  // ---------- Checkpoints ----------
  http.get('*/matching-groups/:groupId/workspace/checkpoints', ({ params }) => {
    const ws = getWorkspace(params.groupId as string);
    return ok([...ws.checkpoints].sort((a, b) => a.order - b.order));
  }),
  http.post('*/matching-groups/:groupId/workspace/checkpoints', async ({ params, request }) => {
    const ws = getWorkspace(params.groupId as string);
    const body = (await request.json().catch(() => ({}))) as {
      name?: string;
      category?: string;
      distanceAltitude?: string;
      gps?: string;
      imageUrl?: string;
    };
    if (!body.name?.trim()) return fail('Tên điểm đến không được để trống.', 400);
    const checkpoint: TrailCheckpoint = {
      id: nextId('cp'),
      order: ws.checkpoints.length + 1,
      name: body.name.trim(),
      category: body.category?.trim() || 'Trạm dừng chân',
      distanceAltitude: body.distanceAltitude?.trim() || '—',
      gps: body.gps?.trim() || '—',
      imageUrl: body.imageUrl,
      status: 'UPCOMING',
    };
    ws.checkpoints.push(checkpoint);
    return ok(checkpoint, 'Đã thêm checkpoint.', 201);
  }),
  http.delete('*/matching-groups/:groupId/workspace/checkpoints/:checkpointId', ({ params }) => {
    const ws = getWorkspace(params.groupId as string);
    ws.checkpoints = ws.checkpoints.filter((c) => c.id !== params.checkpointId);
    return ok(null, 'Đã xoá checkpoint.');
  }),
  http.put(
    '*/matching-groups/:groupId/workspace/checkpoints/:checkpointId/checkin',
    ({ params, request }) => {
      const ws = getWorkspace(params.groupId as string);
      const user = currentUser(request);
      const checkpoint = ws.checkpoints.find((c) => c.id === params.checkpointId);
      if (!checkpoint) return fail('Không tìm thấy checkpoint.', 404);
      checkpoint.status = 'COMPLETED';
      checkpoint.checkedInByName = user.fullName;
      checkpoint.checkedInAt = new Date().toISOString();
      const nextCp = ws.checkpoints.find((c) => c.order === checkpoint.order + 1);
      if (nextCp && nextCp.status === 'UPCOMING') nextCp.status = 'IN_PROGRESS';
      return ok(checkpoint, 'Đã check-in checkpoint.');
    }
  ),
  http.put('*/matching-groups/:groupId/workspace/checkpoints/:checkpointId/skip', ({ params }) => {
    const ws = getWorkspace(params.groupId as string);
    const checkpoint = ws.checkpoints.find((c) => c.id === params.checkpointId);
    if (!checkpoint) return fail('Không tìm thấy checkpoint.', 404);
    checkpoint.status = 'SKIPPED';
    const nextCp = ws.checkpoints.find((c) => c.order === checkpoint.order + 1);
    if (nextCp && nextCp.status === 'UPCOMING') nextCp.status = 'IN_PROGRESS';
    return ok(checkpoint, 'Đã bỏ qua checkpoint.');
  }),

  // ---------- Itinerary timetable ----------
  http.get('*/matching-groups/:groupId/workspace/itinerary', ({ params }) => {
    const ws = getWorkspace(params.groupId as string);
    return ok({ days: ws.itineraryDays, activities: ws.itineraryActivities });
  }),
  http.post('*/matching-groups/:groupId/workspace/itinerary/days', ({ params }) => {
    const ws = getWorkspace(params.groupId as string);
    const day: ItineraryDayColumn = {
      id: nextId('day'),
      title: `Ngày ${ws.itineraryDays.length + 1}`,
      subtitle: 'Lộ trình mở rộng',
    };
    ws.itineraryDays.push(day);
    return ok(day, 'Đã thêm ngày.', 201);
  }),
  http.post(
    '*/matching-groups/:groupId/workspace/itinerary/activities',
    async ({ params, request }) => {
      const ws = getWorkspace(params.groupId as string);
      const body = (await request.json().catch(() => ({}))) as Partial<ItineraryActivity>;
      if (!body.title?.trim() || !body.dayId) return fail('Thiếu thông tin hoạt động.', 400);
      const activity: ItineraryActivity = {
        id: nextId('act'),
        dayId: body.dayId,
        timeSlot: body.timeSlot ?? 'morning',
        timeRange: body.timeRange?.trim() || '08:00 - 09:00',
        title: body.title.trim(),
        location: body.location?.trim() || 'Địa điểm tập trung',
        assignee: body.assignee?.trim() || 'Toàn đội',
      };
      ws.itineraryActivities.push(activity);
      return ok(activity, 'Đã thêm hoạt động.', 201);
    }
  ),
  http.delete(
    '*/matching-groups/:groupId/workspace/itinerary/activities/:activityId',
    ({ params }) => {
      const ws = getWorkspace(params.groupId as string);
      ws.itineraryActivities = ws.itineraryActivities.filter((a) => a.id !== params.activityId);
      return ok(null, 'Đã xoá hoạt động.');
    }
  ),

  // ---------- Budget ----------
  http.get('*/matching-groups/:groupId/workspace/budget', ({ params }) => {
    const groupId = params.groupId as string;
    const ws = getWorkspace(groupId);
    const group = groups.find((g) => g.matchingGroupId === groupId);
    const settlements = computeSettlements(group, ws.actualExpenses).map((s) => ({
      ...s,
      status: confirmedSettlementIds.has(s.id) ? ('CONFIRMED' as const) : s.status,
    }));
    return ok({
      planItems: ws.budgetPlanItems,
      actualExpenses: ws.actualExpenses,
      settlements,
    });
  }),
  http.post(
    '*/matching-groups/:groupId/workspace/budget/plan-items',
    async ({ params, request }) => {
      const ws = getWorkspace(params.groupId as string);
      const body = (await request.json().catch(() => ({}))) as Partial<BudgetPlanItem>;
      if (!body.title?.trim()) return fail('Tên khoản chi không được để trống.', 400);
      if (body.id) {
        const existing = ws.budgetPlanItems.find((p) => p.id === body.id);
        if (existing) {
          existing.category = body.category ?? existing.category;
          existing.title = body.title.trim();
          existing.amount = body.amount ?? existing.amount;
          existing.note = body.note;
          return ok(existing, 'Đã cập nhật khoản dự toán.');
        }
      }
      const item: BudgetPlanItem = {
        id: nextId('plan'),
        category: body.category ?? 'other',
        title: body.title.trim(),
        amount: body.amount ?? 0,
        note: body.note,
      };
      ws.budgetPlanItems.push(item);
      return ok(item, 'Đã thêm khoản dự toán.', 201);
    }
  ),
  http.delete('*/matching-groups/:groupId/workspace/budget/plan-items/:itemId', ({ params }) => {
    const ws = getWorkspace(params.groupId as string);
    ws.budgetPlanItems = ws.budgetPlanItems.filter((p) => p.id !== params.itemId);
    return ok(null, 'Đã xoá khoản dự toán.');
  }),
  http.post('*/matching-groups/:groupId/workspace/budget/expenses', async ({ params, request }) => {
    const ws = getWorkspace(params.groupId as string);
    const body = (await request.json().catch(() => ({}))) as {
      id?: string;
      title?: string;
      payerId?: string;
      amount?: number;
    };
    if (!body.title?.trim() || !body.payerId) return fail('Thiếu thông tin hoá đơn.', 400);
    const payer = findUserById(body.payerId) ?? mockUsers.find((u) => u.id === body.payerId);
    const payerName = payer?.fullName ?? 'Thành viên';
    if (body.id) {
      const existing = ws.actualExpenses.find((e) => e.id === body.id);
      if (existing) {
        existing.title = body.title.trim();
        existing.payerId = body.payerId;
        existing.payerName = payerName;
        existing.amount = body.amount ?? existing.amount;
        return ok(existing, 'Đã cập nhật hoá đơn.');
      }
    }
    const expense: ActualExpense = {
      id: nextId('exp'),
      title: body.title.trim(),
      payerId: body.payerId,
      payerName,
      amount: body.amount ?? 0,
    };
    ws.actualExpenses.push(expense);
    return ok(expense, 'Đã ghi nhận hoá đơn.', 201);
  }),
  http.delete('*/matching-groups/:groupId/workspace/budget/expenses/:expenseId', ({ params }) => {
    const ws = getWorkspace(params.groupId as string);
    ws.actualExpenses = ws.actualExpenses.filter((e) => e.id !== params.expenseId);
    return ok(null, 'Đã xoá hoá đơn.');
  }),
  http.put(
    '*/matching-groups/:groupId/workspace/budget/settlements/:settlementId/confirm',
    ({ params }) => {
      confirmedSettlementIds.add(params.settlementId as string);
      return ok(
        { id: params.settlementId, status: 'CONFIRMED' as const },
        'Đã xác nhận thanh toán.'
      );
    }
  ),

  // ---------- Equipment ----------
  http.get('*/matching-groups/:groupId/workspace/equipment', ({ params }) => {
    const ws = getWorkspace(params.groupId as string);
    return ok(ws.equipment);
  }),
  http.post('*/matching-groups/:groupId/workspace/equipment', async ({ params, request }) => {
    const ws = getWorkspace(params.groupId as string);
    const body = (await request.json().catch(() => ({}))) as Partial<EquipmentItem>;
    if (!body.name?.trim()) return fail('Tên vật dụng không được để trống.', 400);
    const item: EquipmentItem = {
      id: nextId('eq'),
      name: body.name.trim(),
      category: body.category ?? 'shared',
      type: body.type || EQUIPMENT_TYPES[0],
      isEssential: true,
      assignedToUserId: body.category === 'shared' ? body.assignedToUserId : undefined,
      assignedToName: body.category === 'shared' ? body.assignedToName : undefined,
      isPrepared: false,
      notes: body.notes,
    };
    ws.equipment.unshift(item);
    return ok(item, 'Đã thêm & phân công đồ dùng.', 201);
  }),
  http.put('*/matching-groups/:groupId/workspace/equipment/:itemId/toggle', ({ params }) => {
    const ws = getWorkspace(params.groupId as string);
    const item = ws.equipment.find((e) => e.id === params.itemId);
    if (!item) return fail('Không tìm thấy vật dụng.', 404);
    item.isPrepared = !item.isPrepared;
    return ok(item);
  }),

  // ---------- Members workspace + peer review ----------
  http.get('*/matching-groups/:groupId/workspace/members', ({ params }) => {
    const groupId = params.groupId as string;
    const ws = getWorkspace(groupId);
    const group = groups.find((g) => g.matchingGroupId === groupId);
    if (!group) return ok([]);
    const items = acceptedMembers(group).map((m) => {
      const profile = ws.memberProfiles[m.userId] ?? {
        skills: [],
        bloodType: '—',
        allergies: 'Không dị ứng',
        certifications: 'Chưa cập nhật',
        emergencyPhone: '—',
        emergencyRelation: '—',
        note: '',
        trustScore: 85,
        completedTrips: 0,
      };
      return {
        userId: m.userId,
        fullName: m.fullName,
        avatarUrl: m.avatarUrl,
        roleLabel: roleLabel(group, m.userId),
        isLeader: group.ownerId === m.userId,
        isCoLeader: false,
        trustScore: profile.trustScore,
        completedTrips: profile.completedTrips,
        skills: profile.skills.map((name) => ({ name })),
        medicalInfo: {
          bloodType: profile.bloodType,
          allergies: profile.allergies,
          certifications: profile.certifications,
          emergencyPhone: profile.emergencyPhone,
          emergencyRelation: profile.emergencyRelation,
          note: profile.note,
        },
      };
    });
    return ok(items);
  }),
  http.get('*/matching-groups/:groupId/workspace/peer-reviews', ({ params }) => {
    const ws = getWorkspace(params.groupId as string);
    return ok(ws.peerReviews);
  }),
  http.post('*/matching-groups/:groupId/workspace/peer-reviews', async ({ params, request }) => {
    const groupId = params.groupId as string;
    const ws = getWorkspace(groupId);
    const user = currentUser(request);
    const body = (await request.json().catch(() => ({}))) as {
      revieweeId?: string;
      punctualityScore?: number;
      fitnessScore?: number;
      financeScore?: number;
      tags?: string[];
      comment?: string;
    };
    if (!body.revieweeId) return fail('Thiếu thành viên được đánh giá.', 400);

    const review: PeerReview = {
      reviewerId: user.id,
      revieweeId: body.revieweeId,
      punctualityScore: body.punctualityScore ?? 5,
      fitnessScore: body.fitnessScore ?? 5,
      financeScore: body.financeScore ?? 5,
      tags: body.tags ?? [],
      comment: body.comment,
      createdAt: new Date().toISOString(),
    };
    ws.peerReviews = ws.peerReviews.filter(
      (r) => !(r.reviewerId === user.id && r.revieweeId === body.revieweeId)
    );
    ws.peerReviews.push(review);

    const avg = (review.punctualityScore + review.fitnessScore + review.financeScore) / 3;
    const bonus = avg >= 4.5 ? 2.5 : avg >= 3.5 ? 1.5 : avg >= 2.5 ? 0.5 : 0;
    const profile = ws.memberProfiles[body.revieweeId];
    if (profile) profile.trustScore = Math.min(100, Math.round(profile.trustScore + bonus));

    return ok(review, 'Đã ghi nhận đánh giá.', 201);
  }),

  // ---------- Leader succession ----------
  http.get('*/matching-groups/:groupId/workspace/succession-request', ({ params }) => {
    const ws = getWorkspace(params.groupId as string);
    return ok(ws.succession);
  }),
  http.post(
    '*/matching-groups/:groupId/workspace/succession-request',
    async ({ params, request }) => {
      const groupId = params.groupId as string;
      const ws = getWorkspace(groupId);
      const user = currentUser(request);
      const body = (await request.json().catch(() => ({}))) as {
        reason?: string;
        nomineeId?: string;
      };
      if (!body.reason?.trim() || !body.nomineeId)
        return fail('Thiếu lý do hoặc người đề cử.', 400);

      ws.succession = {
        id: nextId('succession'),
        requestedById: user.id,
        reason: body.reason.trim(),
        nomineeId: body.nomineeId,
        votes: [],
        status: 'OPEN',
      };
      return ok(ws.succession, 'Đã gửi yêu cầu chuyển giao quyền Leader.', 201);
    }
  ),
  http.post(
    '*/matching-groups/:groupId/workspace/succession-request/:requestId/vote',
    async ({ params, request }) => {
      const groupId = params.groupId as string;
      const ws = getWorkspace(groupId);
      const group = groups.find((g) => g.matchingGroupId === groupId);
      const user = currentUser(request);
      const body = (await request.json().catch(() => ({}))) as { vote?: 'YES' | 'NO' };
      if (!ws.succession || ws.succession.id !== params.requestId) {
        return fail('Không tìm thấy yêu cầu chuyển giao.', 404);
      }
      ws.succession.votes = ws.succession.votes.filter((v) => v.userId !== user.id);
      ws.succession.votes.push({ userId: user.id, vote: body.vote ?? 'YES' });

      const memberCount = group ? acceptedMembers(group).length : 1;
      const yesVotes = ws.succession.votes.filter((v) => v.vote === 'YES').length;
      if (group && yesVotes > memberCount / 2) {
        group.ownerId = ws.succession.nomineeId;
        const nominee = group.members.find((m) => m.userId === ws.succession?.nomineeId);
        if (nominee) group.ownerName = nominee.fullName;
        ws.succession.status = 'APPROVED';
      }
      return ok(ws.succession, 'Đã ghi nhận phiếu bầu.');
    }
  ),
  http.delete('*/matching-groups/:groupId/workspace/succession-request', ({ params }) => {
    const ws = getWorkspace(params.groupId as string);
    ws.succession = null;
    return ok(null, 'Đã huỷ yêu cầu chuyển giao.');
  }),

  // ---------- Giải tán nhóm — cần TOÀN BỘ thành viên đồng thuận (unanimous), không phải
  // riêng leader quyết định. ----------
  http.get('*/matching-groups/:groupId/workspace/dissolve-request', ({ params }) => {
    const ws = getWorkspace(params.groupId as string);
    if (!ws.dissolve) return ok(null);
    const group = groups.find((g) => g.matchingGroupId === params.groupId);
    const requiredVotes = group ? acceptedMembers(group).length : 1;
    return ok({ ...ws.dissolve, requiredVotes });
  }),
  http.post(
    '*/matching-groups/:groupId/workspace/dissolve-request',
    async ({ params, request }) => {
      const groupId = params.groupId as string;
      const ws = getWorkspace(groupId);
      const user = currentUser(request);
      const body = (await request.json().catch(() => ({}))) as { reason?: string };
      if (!body.reason?.trim()) return fail('Vui lòng nêu lý do giải tán nhóm.', 400);

      // Leader khởi tạo yêu cầu → tự động tính là 1 phiếu YES của chính leader.
      ws.dissolve = {
        id: nextId('dissolve'),
        requestedById: user.id,
        reason: body.reason.trim(),
        votes: [{ userId: user.id, vote: 'YES' }],
        status: 'OPEN',
      };
      const group = groups.find((g) => g.matchingGroupId === groupId);
      const requiredVotes = group ? acceptedMembers(group).length : 1;
      return ok({ ...ws.dissolve, requiredVotes }, 'Đã gửi yêu cầu giải tán nhóm.', 201);
    }
  ),
  http.post(
    '*/matching-groups/:groupId/workspace/dissolve-request/:requestId/vote',
    async ({ params, request }) => {
      const groupId = params.groupId as string;
      const ws = getWorkspace(groupId);
      const group = groups.find((g) => g.matchingGroupId === groupId);
      const user = currentUser(request);
      const body = (await request.json().catch(() => ({}))) as { vote?: 'YES' | 'NO' };
      if (!ws.dissolve || ws.dissolve.id !== params.requestId) {
        return fail('Không tìm thấy yêu cầu giải tán.', 404);
      }
      ws.dissolve.votes = ws.dissolve.votes.filter((v) => v.userId !== user.id);
      ws.dissolve.votes.push({ userId: user.id, vote: body.vote ?? 'YES' });

      const members = group ? acceptedMembers(group) : [];
      const requiredVotes = members.length;
      const yesVotes = ws.dissolve.votes.filter((v) => v.vote === 'YES').length;

      // Bất kỳ ai bỏ phiếu KHÔNG đồng ý → huỷ ngay yêu cầu (đồng thuận tuyệt đối, không thể
      // giải tán nếu còn dù chỉ 1 người phản đối).
      if (body.vote === 'NO') {
        ws.dissolve.status = 'CANCELLED';
        return ok(
          { ...ws.dissolve, requiredVotes },
          'Đã huỷ yêu cầu giải tán do có thành viên không đồng ý.'
        );
      }

      if (members.length > 0 && yesVotes >= requiredVotes) {
        ws.dissolve.status = 'APPROVED';
        const idx = groups.findIndex((g) => g.matchingGroupId === groupId);
        if (idx !== -1) groups.splice(idx, 1);
      }
      return ok({ ...ws.dissolve, requiredVotes }, 'Đã ghi nhận phiếu bầu.');
    }
  ),
  http.delete('*/matching-groups/:groupId/workspace/dissolve-request', ({ params }) => {
    const ws = getWorkspace(params.groupId as string);
    ws.dissolve = null;
    return ok(null, 'Đã huỷ yêu cầu giải tán.');
  }),
];
