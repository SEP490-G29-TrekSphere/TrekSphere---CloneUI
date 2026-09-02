import { http } from 'msw';
import {
  addTrustScoreBonus,
  computeCompletedTrips,
  computeTrustScore,
} from '@/shared/utils/trustScore';
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
  description?: string;
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
  description?: string;
  imageUrl?: string;
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
  beneficiaryIds: string[];
  beneficiaryNames: string[];
  receiptImageUrl?: string;
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
  // KHÔNG lưu trustScore/completedTrips ở đây — luôn tính qua computeTrustScore /
  // computeCompletedTrips (nguồn chung, xem @/shared/utils/trustScore) tại điểm trả response,
  // để không phát sinh bản sao cục bộ có thể lệch khỏi các màn khác (bảng thành viên, hồ sơ
  // ứng viên, trang cá nhân đều phải ra cùng 1 số cho cùng 1 userId).
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
  mode: 'DIRECT' | 'POLL';
  requestedById: string;
  reason: string;
  nomineeId: string;
  votes: { userId: string; vote: 'YES' | 'NO' }[];
  status: 'OPEN' | 'APPROVED' | 'CANCELLED' | 'EXPIRED';
  deadline?: string;
  createdAt: string;
}

/** Hạn Poll bình chọn Trưởng nhóm — 24h theo MODULE 4 (BR-LEAD). */
const SUCCESSION_POLL_HOURS = 24;

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

// Toạ độ/độ cao mẫu để checkpoint dự kiến trông trực quan như dữ liệu thật thay vì "—" trống.
const CHECKPOINT_DISTANCE_SAMPLES = [
  '0km · 1.500m',
  '4.2km · 2.200m',
  '7.8km · 2.800m',
  '11km · 3.143m',
];
const CHECKPOINT_GPS_SAMPLES = [
  '22.3364° N, 103.7754° E',
  '22.3401° N, 103.7812° E',
  '22.3455° N, 103.7889° E',
  '22.3512° N, 103.7940° E',
];

function inferBudgetCategory(label: string): BudgetCategory {
  const normalized = label.toLowerCase();
  if (/xe|trung chuyển|taxi|tàu|vé/.test(normalized)) return 'trans';
  if (/ăn|đồ ăn|nước|bbq|thực phẩm/.test(normalized)) return 'food';
  if (/lán|lều|túi ngủ|dụng cụ|trại/.test(normalized)) return 'gear';
  return 'other';
}

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
    distanceAltitude: CHECKPOINT_DISTANCE_SAMPLES[idx % CHECKPOINT_DISTANCE_SAMPLES.length],
    gps: CHECKPOINT_GPS_SAMPLES[idx % CHECKPOINT_GPS_SAMPLES.length],
    imageUrl:
      idx === 0
        ? group?.tourImageUrl
        : `https://picsum.photos/seed/checkpoint-${groupId}-${idx}/600/400`,
    description: day.description,
    // Checkpoint đầu tiên sẵn sàng để check-in ngay khi nhóm chuyển sang giai đoạn 4
    // (nếu không, không có checkpoint nào ở trạng thái IN_PROGRESS để bấm check-in).
    status: (idx === 0 ? 'IN_PROGRESS' : 'UPCOMING') as CheckpointStatus,
  }));

  const itineraryDays: ItineraryDayColumn[] = (group?.itinerary ?? []).map((day) => ({
    id: `day-${day.day}`,
    title: `Ngày ${day.day}`,
    subtitle: day.title,
  }));

  const itineraryActivities: ItineraryActivity[] = (group?.itinerary ?? []).flatMap(
    (day, dayIdx) => {
      const dayId = `day-${day.day}`;
      const isLastDay = dayIdx === (group?.itinerary.length ?? 1) - 1;
      const morningActivity: ItineraryActivity = {
        id: nextId('act'),
        dayId,
        timeSlot: 'morning',
        timeRange: dayIdx === 0 ? '05:30 - 07:00' : '06:00 - 07:00',
        title:
          dayIdx === 0
            ? 'Tập trung, kiểm tra trang bị & xuất phát'
            : 'Ăn sáng & thu dọn hành trang',
        location: dayIdx === 0 ? group?.location || 'Điểm tập kết' : 'Khu vực lán nghỉ',
        assignee: group?.ownerName || 'Trưởng nhóm',
        description:
          dayIdx === 0
            ? 'Cả nhóm tập trung đúng giờ, Trưởng nhóm điểm danh và kiểm tra trang bị bắt buộc (đèn pin, áo mưa, sơ cứu) trước khi khởi hành.'
            : 'Ăn sáng nhẹ, đóng gói lều trại và chuẩn bị tiếp tục hành trình.',
      };
      const mainActivity: ItineraryActivity = {
        id: nextId('act'),
        dayId,
        timeSlot: 'afternoon',
        timeRange: '13:30 - 17:00',
        title: day.title,
        location: group?.location || 'Trên cung đường trek',
        assignee: group?.ownerName || 'Trưởng nhóm',
        description: day.description,
        imageUrl: group?.tourImageUrl,
      };
      const eveningActivity: ItineraryActivity = {
        id: nextId('act'),
        dayId,
        timeSlot: 'evening',
        timeRange: '18:00 - 20:00',
        title: 'Dựng lều, nấu ăn tối & sinh hoạt chung',
        location: 'Khu vực cắm trại',
        assignee: 'Toàn đội',
        description:
          'Cùng nhau dựng lều, chuẩn bị bữa tối BBQ và chia sẻ cảm nhận hành trình trong ngày quanh bếp lửa trại.',
      };
      return isLastDay
        ? [morningActivity, mainActivity]
        : [morningActivity, mainActivity, eveningActivity];
    }
  );

  const budgetPlanItems: BudgetPlanItem[] = (group?.budgetItems ?? []).map((item) => ({
    id: nextId('plan'),
    category: inferBudgetCategory(item.label),
    title: item.label,
    amount: item.amount,
    note: `Dự toán tự động từ lộ trình "${group?.tourName ?? ''}".`,
  }));

  // Hoá đơn thực tế mẫu: xen kẽ "chi hộ cả nhóm" và "1 người ứng tiền chỉ cho một phần nhóm"
  // để bảng Ngân sách trông trực quan giống nghiệp vụ thật ngay khi vào workspace demo.
  const actualExpenses: ActualExpense[] = budgetPlanItems
    .slice(0, Math.min(3, budgetPlanItems.length))
    .map((item, idx) => {
      const payer = members[idx % (members.length || 1)];
      const partialBeneficiaries = members.slice(0, Math.max(1, Math.ceil(members.length * 0.6)));
      const beneficiaries = idx % 2 === 0 ? members : partialBeneficiaries;
      return {
        id: nextId('exp'),
        title: item.title,
        payerId: payer?.userId ?? '',
        payerName: payer?.fullName ?? 'Thành viên',
        amount: item.amount,
        beneficiaryIds: beneficiaries.map((m) => m.userId),
        beneficiaryNames: beneficiaries.map((m) => m.fullName),
        receiptImageUrl: `https://picsum.photos/seed/receipt-${groupId}-${idx}/600/800`,
      };
    });

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
    actualExpenses,
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

/**
 * BR-LEAD (MODULE 4): Poll bình chọn Leader mới quá hạn 24h mà chưa đủ >50% phiếu → nhóm tự
 * động chuyển `CANCELLED` (bị xoá khỏi danh sách nhóm ghép, giống cơ chế giải tán). Gọi hàm này
 * lười (lazy) trước mỗi lần đọc/bầu để không cần cron job nền.
 * @returns true nếu request vừa bị hết hạn ở lần gọi này (nhóm vừa bị huỷ).
 */
function expireSuccessionPollIfNeeded(groupId: string, ws: WorkspaceState): boolean {
  const request = ws.succession;
  if (
    !request ||
    request.mode !== 'POLL' ||
    request.status !== 'OPEN' ||
    !request.deadline ||
    new Date(request.deadline).getTime() > Date.now()
  ) {
    return false;
  }
  request.status = 'EXPIRED';
  const idx = groups.findIndex((g) => g.matchingGroupId === groupId);
  if (idx !== -1) groups.splice(idx, 1);
  return true;
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

  // Mỗi khoản chi chỉ chia đều cho những người thụ hưởng của chính nó (beneficiaryIds),
  // không phải chia đều cho toàn bộ thành viên nhóm.
  const balanceByUserId = new Map(members.map((m) => [m.userId, { balance: 0, name: m.fullName }]));
  for (const expense of actualExpenses) {
    const beneficiaries = expense.beneficiaryIds.length
      ? expense.beneficiaryIds
      : members.map((m) => m.userId);
    const share = expense.amount / beneficiaries.length;

    const payer = balanceByUserId.get(expense.payerId);
    if (payer) payer.balance += expense.amount;

    for (const userId of beneficiaries) {
      const beneficiary = balanceByUserId.get(userId);
      if (beneficiary) beneficiary.balance -= share;
    }
  }

  const balances = members.map((m) => ({
    userId: m.userId,
    name: m.fullName,
    balance: balanceByUserId.get(m.userId)?.balance ?? 0,
  }));

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
    const formData = await request.formData().catch(() => null);
    const name = (formData?.get('name') as string | null)?.trim();
    const category = (formData?.get('category') as string | null)?.trim();
    const distanceAltitude = (formData?.get('distanceAltitude') as string | null)?.trim();
    const gps = (formData?.get('gps') as string | null)?.trim();
    const description = (formData?.get('description') as string | null)?.trim();
    const image = formData?.get('image');

    if (!name) return fail('Tên điểm đến không được để trống.', 400);
    const checkpoint: TrailCheckpoint = {
      id: nextId('cp'),
      order: ws.checkpoints.length + 1,
      name,
      category: category || 'Trạm dừng chân',
      distanceAltitude: distanceAltitude || '—',
      gps: gps || '—',
      imageUrl:
        image instanceof File && image.size > 0
          ? `https://picsum.photos/seed/checkpoint-${Date.now()}/600/400`
          : undefined,
      description: description || undefined,
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
      const formData = await request.formData().catch(() => null);
      const dayId = (formData?.get('dayId') as string | null) || undefined;
      const timeSlot = (formData?.get('timeSlot') as TimeSlot | null) || undefined;
      const timeRange = (formData?.get('timeRange') as string | null)?.trim();
      const title = (formData?.get('title') as string | null)?.trim();
      const location = (formData?.get('location') as string | null)?.trim();
      const assignee = (formData?.get('assignee') as string | null)?.trim();
      const description = (formData?.get('description') as string | null)?.trim();
      const image = formData?.get('image');

      if (!title || !dayId) return fail('Thiếu thông tin hoạt động.', 400);
      const activity: ItineraryActivity = {
        id: nextId('act'),
        dayId,
        timeSlot: timeSlot ?? 'morning',
        timeRange: timeRange || '08:00 - 09:00',
        title,
        location: location || 'Địa điểm tập trung',
        assignee: assignee || 'Toàn đội',
        description: description || undefined,
        imageUrl:
          image instanceof File && image.size > 0
            ? `https://picsum.photos/seed/activity-${Date.now()}/600/400`
            : undefined,
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
    const groupId = params.groupId as string;
    const ws = getWorkspace(groupId);
    const group = groups.find((g) => g.matchingGroupId === groupId);
    const formData = await request.formData().catch(() => null);
    const id = (formData?.get('id') as string | null) || undefined;
    const title = (formData?.get('title') as string | null)?.trim();
    const payerId = (formData?.get('payerId') as string | null) || undefined;
    const amount = Number(formData?.get('amount') ?? 0);
    const beneficiaryIds = (formData?.getAll('beneficiaryIds') as string[]).filter(Boolean);
    const receiptImage = formData?.get('receiptImage');
    const removeReceiptImage = formData?.get('removeReceiptImage') === 'true';

    if (!title || !payerId) return fail('Thiếu thông tin hoá đơn.', 400);
    if (beneficiaryIds.length === 0) {
      return fail('Cần chọn ít nhất một người được chi khoản này.', 400);
    }

    const payer = findUserById(payerId) ?? mockUsers.find((u) => u.id === payerId);
    const payerName = payer?.fullName ?? 'Thành viên';
    const beneficiaryNames = beneficiaryIds.map((uid) => {
      const member = group?.members.find((m) => m.userId === uid);
      return member?.fullName ?? findUserById(uid)?.fullName ?? 'Thành viên';
    });
    const receiptImageUrl =
      receiptImage instanceof File && receiptImage.size > 0
        ? `https://picsum.photos/seed/receipt-${Date.now()}/600/800`
        : undefined;

    if (id) {
      const existing = ws.actualExpenses.find((e) => e.id === id);
      if (existing) {
        existing.title = title;
        existing.payerId = payerId;
        existing.payerName = payerName;
        existing.amount = amount || existing.amount;
        existing.beneficiaryIds = beneficiaryIds;
        existing.beneficiaryNames = beneficiaryNames;
        if (removeReceiptImage) existing.receiptImageUrl = undefined;
        if (receiptImageUrl) existing.receiptImageUrl = receiptImageUrl;
        return ok(existing, 'Đã cập nhật hoá đơn.');
      }
    }
    const expense: ActualExpense = {
      id: nextId('exp'),
      title,
      payerId,
      payerName,
      amount: amount || 0,
      beneficiaryIds,
      beneficiaryNames,
      receiptImageUrl,
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
      const profile: MemberProfile = ws.memberProfiles[m.userId] ?? {
        skills: [],
        bloodType: '—',
        allergies: 'Không dị ứng',
        certifications: 'Chưa cập nhật',
        emergencyPhone: '—',
        emergencyRelation: '—',
        note: '',
      };
      return {
        userId: m.userId,
        fullName: m.fullName,
        avatarUrl: m.avatarUrl,
        roleLabel: roleLabel(group, m.userId),
        isLeader: group.ownerId === m.userId,
        isCoLeader: false,
        // Luôn tính tại đây (không đọc field lưu sẵn) để khớp đúng 1 nguồn với
        // JoinRequestProfileModal / trang cá nhân — kể cả sau khi có Peer Review cộng bonus.
        trustScore: computeTrustScore(m.userId),
        completedTrips: computeCompletedTrips(m.userId),
        skills: profile.skills.map((name: string) => ({ name })),
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

    // Cộng bonus vào store CHUNG theo userId (addTrustScoreBonus), không mutate 1 bản sao
    // trustScore cục bộ trong nhóm này — để bảng thành viên, hồ sơ ứng viên và trang cá nhân
    // luôn đọc ra cùng 1 điểm tin cậy đã cộng dồn cho đúng người đó (MODULE 6: điểm Peer Review
    // "cộng trực tiếp vào Trust Score hiển thị công khai trên Hồ sơ cá nhân").
    const avg = (review.punctualityScore + review.fitnessScore + review.financeScore) / 3;
    const bonus = avg >= 4.5 ? 2.5 : avg >= 3.5 ? 1.5 : avg >= 2.5 ? 0.5 : 0;
    if (bonus > 0) addTrustScoreBonus(body.revieweeId, bonus);

    return ok(review, 'Đã ghi nhận đánh giá.', 201);
  }),

  // ---------- Leader succession (MODULE 4) ----------
  // Trường hợp A: Leader chỉ định trực tiếp (không cần bầu). Trường hợp B: mở Poll 24h, cần
  // >50% phiếu YES; quá 24h không đủ phiếu → nhóm tự động bị huỷ (BR-LEAD-01/02).
  http.get('*/matching-groups/:groupId/workspace/succession-request', ({ params }) => {
    const groupId = params.groupId as string;
    const ws = getWorkspace(groupId);
    expireSuccessionPollIfNeeded(groupId, ws);
    return ok(ws.succession);
  }),
  http.post(
    '*/matching-groups/:groupId/workspace/succession-request',
    async ({ params, request }) => {
      const groupId = params.groupId as string;
      const ws = getWorkspace(groupId);
      const group = groups.find((g) => g.matchingGroupId === groupId);
      const user = currentUser(request);
      const body = (await request.json().catch(() => ({}))) as {
        reason?: string;
        nomineeId?: string;
      };
      if (!body.reason?.trim() || !body.nomineeId)
        return fail('Thiếu lý do hoặc người đề cử.', 400);
      if (ws.phase === 4) {
        return fail('Không thể chuyển giao Leader khi chuyến đi đang diễn ra (IN_PROGRESS).', 400);
      }
      if (group && !acceptedMembers(group).some((m) => m.userId === body.nomineeId)) {
        return fail('Người được đề cử không phải thành viên hợp lệ của nhóm.', 400);
      }

      const now = new Date();
      ws.succession = {
        id: nextId('succession'),
        mode: 'POLL',
        requestedById: user.id,
        reason: body.reason.trim(),
        nomineeId: body.nomineeId,
        votes: [],
        status: 'OPEN',
        deadline: new Date(now.getTime() + SUCCESSION_POLL_HOURS * 60 * 60 * 1000).toISOString(),
        createdAt: now.toISOString(),
      };
      return ok(ws.succession, 'Đã mở bình chọn chuyển giao quyền Leader (hạn 24h).', 201);
    }
  ),
  // Trường hợp A: chỉ định trực tiếp — chuyển giao ngay, không cần bầu.
  http.post(
    '*/matching-groups/:groupId/workspace/succession-request/appoint',
    async ({ params, request }) => {
      const groupId = params.groupId as string;
      const ws = getWorkspace(groupId);
      const group = groups.find((g) => g.matchingGroupId === groupId);
      const user = currentUser(request);
      const body = (await request.json().catch(() => ({}))) as { nomineeId?: string };
      if (!body.nomineeId) return fail('Thiếu người được chỉ định.', 400);
      if (ws.phase === 4) {
        return fail('Không thể chuyển giao Leader khi chuyến đi đang diễn ra (IN_PROGRESS).', 400);
      }
      const nominee = group?.members.find((m) => m.userId === body.nomineeId);
      if (!group || !nominee) return fail('Người được chỉ định không hợp lệ.', 400);

      group.ownerId = nominee.userId;
      group.ownerName = nominee.fullName;

      const now = new Date();
      ws.succession = {
        id: nextId('succession'),
        mode: 'DIRECT',
        requestedById: user.id,
        reason: 'Leader chỉ định trực tiếp',
        nomineeId: nominee.userId,
        votes: [],
        status: 'APPROVED',
        createdAt: now.toISOString(),
      };
      return ok(ws.succession, `Đã chỉ định ${nominee.fullName} làm Trưởng nhóm mới.`);
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
      if (expireSuccessionPollIfNeeded(groupId, ws)) {
        return fail('Poll bình chọn đã hết hạn 24h — nhóm đã tự động bị huỷ.', 400);
      }
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
