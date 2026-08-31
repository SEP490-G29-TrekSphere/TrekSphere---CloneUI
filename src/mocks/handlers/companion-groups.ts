import { http } from 'msw';
import { getMockAvatar, getMockTourImage } from '@/utils/mockImageUtils';
import { findUserById, mockUsers } from '../data/users';
import { created, fail, ok } from '../envelope';

/**
 * Mock cho `companionGroupService.ts` — ghép nhóm đi trek chung (matching groups).
 * Field naming khớp chính xác `MatchingGroupItem` / `MatchingGroupDetailResponse` /
 * `MatchingMemberItem` trong service (pageNumber/pageSize/last — KHÔNG dùng page() helper
 * vì shape phân trang ở feature này khác `Page<T>` kiểu Spring).
 */

type MatchingGroupStatus = 'OPEN' | 'FULL' | 'CLOSED' | 'HIDDEN';
type MatchingMemberRole = 'OWNER' | 'MEMBER';
type MatchingMemberStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'LEFT';

export interface MatchingMemberItem {
  matchingMemberId: string;
  userId: string;
  fullName: string;
  avatarUrl?: string;
  role: MatchingMemberRole;
  status: MatchingMemberStatus;
  createdAt: string;
  isInConversation?: boolean;
  message?: string;
}

interface ItineraryDay {
  day: number;
  title: string;
  description: string;
}

interface BudgetItem {
  label: string;
  amount: number;
}

interface MatchReason {
  label: string;
  detail: string;
}

export interface MatchingGroup {
  matchingGroupId: string;
  tourId: string;
  tourName: string;
  tourImageUrl: string;
  location: string;
  ownerId: string;
  ownerName: string;
  ownerAvatarUrl?: string;
  groupName: string;
  description?: string;
  maxSize: number;
  targetDate: string;
  matchingDeadline: string;
  status: MatchingGroupStatus;
  createdAt: string;
  members: MatchingMemberItem[];
  hasConversation?: boolean;
  itinerary: ItineraryDay[];
  budgetItems: BudgetItem[];
  journeyIntro: string[];
  matchPercent: number;
  matchReasons: MatchReason[];
}

const TREKKER = mockUsers.find((u) => u.id === 'user-trekker-1')!;
const OTHER_TREKKERS = [
  {
    id: 'user-demo-hoangnam',
    fullName: 'Hoàng Nam',
    avatarUrl: getMockAvatar('hoang-nam'),
  },
  {
    id: 'user-demo-thanhha',
    fullName: 'Thanh Hà',
    avatarUrl: getMockAvatar('thanh-ha'),
  },
  {
    id: 'user-demo-minhanh',
    fullName: 'Minh Anh',
    avatarUrl: getMockAvatar('minh-anh'),
  },
  {
    id: 'user-demo-tuankiet',
    fullName: 'Lê Tuấn Kiệt',
    avatarUrl: getMockAvatar('tuan-kiet'),
  },
];

let idSeq = 100;
function nextId(prefix: string) {
  idSeq += 1;
  return `${prefix}-${idSeq}`;
}

export const groups: MatchingGroup[] = [
  {
    matchingGroupId: 'mg-1',
    tourId: 'tour-fansipan-3d2n',
    tourName: 'Chinh phục Fansipan 3N2Đ — cung Trạm Tôn',
    tourImageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
    location: 'Fansipan, Sa Pa, Lào Cai',
    ownerId: OTHER_TREKKERS[0].id,
    ownerName: OTHER_TREKKERS[0].fullName,
    ownerAvatarUrl: OTHER_TREKKERS[0].avatarUrl,
    groupName: 'Săn mây Fansipan cuối tháng 10',
    description:
      'Tìm thêm 3 bạn đồng hành leo Fansipan, ưu tiên người có thể lực tốt, đi cung tự túc.',
    maxSize: 7,
    targetDate: '2026-10-18',
    matchingDeadline: '2026-10-10T23:59:00.000Z',
    status: 'OPEN',
    createdAt: '2026-08-01T02:00:00.000Z',
    itinerary: [
      {
        day: 1,
        title: 'Sa Pa → Trạm Tôn → Lán 2.800m',
        description: 'Xuất phát sớm từ Sa Pa, trek qua rừng trúc lên lán nghỉ ở độ cao 2.800m.',
      },
      {
        day: 2,
        title: 'Lán 2.800m → Đỉnh Fansipan 3.143m → Sa Pa',
        description: 'Chinh phục nóc nhà Đông Dương lúc bình minh, xuống núi và về lại Sa Pa.',
      },
    ],
    budgetItems: [
      { label: 'Porter + đồ ăn 2 ngày', amount: 850000 },
      { label: 'Lán nghỉ + túi ngủ thuê', amount: 250000 },
      { label: 'Xe trung chuyển Sa Pa ↔ Trạm Tôn', amount: 150000 },
    ],
    journeyIntro: [
      'Fansipan được mệnh danh là "Nóc nhà Đông Dương" với độ cao 3.143m, nằm trong dãy Hoàng Liên Sơn hùng vĩ. Cung Trạm Tôn là cung đường trekking tự nhiên, ít bị thương mại hoá hơn cung cáp treo.',
      'Chuyến đi kéo dài 2 ngày 1 đêm theo hình thức C2C ghép nhóm tự túc. Thành viên cùng chia sẻ chi phí porter, đồ ăn và lán nghỉ theo đúng dự toán minh bạch.',
    ],
    matchPercent: 92,
    matchReasons: [
      { label: 'Khung ngày tự do', detail: 'Khớp với khoảng ngày rảnh phổ biến cuối tháng 10' },
      { label: 'Thể lực phù hợp', detail: 'Yêu cầu thể lực khá tốt, phù hợp người có kinh nghiệm' },
      { label: 'Ngân sách tương đồng', detail: 'Chi phí dự kiến ~1.25 triệu/người, mức phổ thông' },
      {
        label: 'Cung đường rõ ràng',
        detail: 'Trạm Tôn là cung tự túc phổ biến, nhiều thông tin tham khảo',
      },
    ],
    members: [
      {
        matchingMemberId: 'mm-1',
        userId: OTHER_TREKKERS[0].id,
        fullName: OTHER_TREKKERS[0].fullName,
        avatarUrl: OTHER_TREKKERS[0].avatarUrl,
        role: 'OWNER',
        status: 'ACCEPTED',
        createdAt: '2026-08-01T02:00:00.000Z',
      },
      {
        matchingMemberId: 'mm-2',
        userId: OTHER_TREKKERS[1].id,
        fullName: OTHER_TREKKERS[1].fullName,
        avatarUrl: OTHER_TREKKERS[1].avatarUrl,
        role: 'MEMBER',
        status: 'ACCEPTED',
        createdAt: '2026-08-02T02:00:00.000Z',
      },
      {
        matchingMemberId: 'mm-3',
        userId: OTHER_TREKKERS[2].id,
        fullName: OTHER_TREKKERS[2].fullName,
        avatarUrl: OTHER_TREKKERS[2].avatarUrl,
        role: 'MEMBER',
        status: 'PENDING',
        createdAt: '2026-08-15T02:00:00.000Z',
      },
    ],
    hasConversation: true,
  },
  {
    matchingGroupId: 'mg-2',
    tourId: 'tour-tanang-phandung-2d1d',
    tourName: 'Tà Năng — Phan Dũng 2N1Đ',
    tourImageUrl: getMockTourImage('tour-tanang-phandung-2d1d'),
    location: 'Tà Năng, Đức Trọng, Lâm Đồng',
    ownerId: OTHER_TREKKERS[1].id,
    ownerName: OTHER_TREKKERS[1].fullName,
    ownerAvatarUrl: OTHER_TREKKERS[1].avatarUrl,
    groupName: 'Tà Năng cuối tuần cùng nhóm chill',
    description: 'Nhóm nhỏ đi nhẹ nhàng, chụp ảnh đồi cỏ, có kinh nghiệm dốc đồi.',
    maxSize: 8,
    targetDate: '2026-10-24',
    matchingDeadline: '2026-10-18T23:59:00.000Z',
    status: 'OPEN',
    createdAt: '2026-08-05T02:00:00.000Z',
    itinerary: [
      {
        day: 1,
        title: 'Tà Năng → Đồi cỏ trung tâm → Lán nghỉ',
        description: 'Bắt đầu trek qua các đồi cỏ đặc trưng, cắm trại ngắm hoàng hôn.',
      },
      {
        day: 2,
        title: 'Lán nghỉ → Phan Dũng → Xe về',
        description: 'Ngắm bình minh, tiếp tục xuống Phan Dũng và đón xe về điểm xuất phát.',
      },
    ],
    budgetItems: [
      { label: 'Xe trung chuyển 2 chiều', amount: 400000 },
      { label: 'Đồ ăn + nước 2 ngày', amount: 300000 },
      { label: 'Phí hướng dẫn địa phương', amount: 200000 },
    ],
    journeyIntro: [
      'Tà Năng — Phan Dũng được xem là "cung trekking đẹp nhất Việt Nam" với những đồi cỏ trải dài bất tận, băng qua 3 tỉnh Lâm Đồng, Ninh Thuận và Bình Thuận.',
      'Lịch trình 2 ngày 1 đêm phù hợp người mới bắt đầu trekking, độ dốc nhẹ nhàng, thích hợp cắm trại ngắm hoàng hôn và bình minh trên đồi cỏ.',
    ],
    matchPercent: 87,
    matchReasons: [
      { label: 'Độ khó nhẹ nhàng', detail: 'Phù hợp người mới, không yêu cầu thể lực cao' },
      { label: 'Khung ngày tự do', detail: 'Khớp với cuối tuần cuối tháng 10' },
      { label: 'Ngân sách tiết kiệm', detail: 'Chi phí dự kiến ~900k/người' },
      { label: 'Nhóm đông vui', detail: 'Quy mô tới 8 người, dễ kết bạn mới' },
    ],
    members: [
      {
        matchingMemberId: 'mm-4',
        userId: OTHER_TREKKERS[1].id,
        fullName: OTHER_TREKKERS[1].fullName,
        avatarUrl: OTHER_TREKKERS[1].avatarUrl,
        role: 'OWNER',
        status: 'ACCEPTED',
        createdAt: '2026-08-05T02:00:00.000Z',
      },
    ],
    hasConversation: false,
  },
  {
    matchingGroupId: 'mg-3',
    tourId: 'tour-puluong-3d2n',
    tourName: 'Pù Luông mùa lúa chín 3N2Đ',
    tourImageUrl: getMockTourImage('tour-puluong-3d2n'),
    location: 'Pù Luông, Bá Thước, Thanh Hóa',
    ownerId: TREKKER.id,
    ownerName: TREKKER.fullName,
    ownerAvatarUrl: TREKKER.avatarUrl,
    groupName: 'Pù Luông mùa lúa — tự túc tiết kiệm',
    description:
      'Mình lập nhóm đi Pù Luông ngắm mùa lúa chín, cần thêm 3 người, ngân sách ~1.4 triệu/người.',
    maxSize: 6,
    targetDate: '2026-11-01',
    matchingDeadline: '2026-10-25T23:59:00.000Z',
    status: 'OPEN',
    createdAt: '2026-08-10T02:00:00.000Z',
    itinerary: [
      {
        day: 1,
        title: 'Hà Nội → Pù Luông → Bản Đôn',
        description: 'Di chuyển tới Pù Luông, nhận phòng homestay, đạp xe ngắm ruộng bậc thang.',
      },
      {
        day: 2,
        title: 'Bản Đôn → Đỉnh Pù Luông → Bản Kho Mường',
        description: 'Trek lên điểm ngắm toàn cảnh mùa lúa chín, nghỉ đêm tại Kho Mường.',
      },
      {
        day: 3,
        title: 'Kho Mường → Hang Dơi → Hà Nội',
        description: 'Khám phá hang Dơi, ăn trưa đặc sản và lên xe về Hà Nội.',
      },
    ],
    budgetItems: [
      { label: 'Homestay 2 đêm', amount: 500000 },
      { label: 'Ăn uống 3 ngày', amount: 450000 },
      { label: 'Xe di chuyển Hà Nội ↔ Pù Luông', amount: 450000 },
    ],
    journeyIntro: [
      'Pù Luông là khu bảo tồn thiên nhiên nổi tiếng với ruộng bậc thang mùa lúa chín và những bản làng người Thái yên bình, cách Hà Nội khoảng 170km.',
      'Hành trình 3 ngày 2 đêm kết hợp trekking nhẹ, đạp xe qua bản làng và nghỉ đêm tại homestay, phù hợp nhóm muốn trải nghiệm chậm rãi, tiết kiệm chi phí.',
    ],
    matchPercent: 95,
    matchReasons: [
      { label: 'Mùa lúa chín đẹp nhất', detail: 'Đúng thời điểm lúa chín vàng cuối tháng 10' },
      { label: 'Ngân sách tiết kiệm', detail: 'Chi phí dự kiến ~1.4 triệu/người, đã gồm homestay' },
      {
        label: 'Nhịp độ thong thả',
        detail: 'Không yêu cầu thể lực cao, phù hợp đi chậm ngắm cảnh',
      },
      { label: 'Trưởng nhóm kinh nghiệm', detail: 'Đã tổ chức nhiều chuyến C2C tự túc trước đó' },
    ],
    members: [
      {
        matchingMemberId: 'mm-5',
        userId: TREKKER.id,
        fullName: TREKKER.fullName,
        avatarUrl: TREKKER.avatarUrl,
        role: 'OWNER',
        status: 'ACCEPTED',
        createdAt: '2026-08-10T02:00:00.000Z',
      },
      {
        matchingMemberId: 'mm-6',
        userId: OTHER_TREKKERS[3].id,
        fullName: OTHER_TREKKERS[3].fullName,
        avatarUrl: OTHER_TREKKERS[3].avatarUrl,
        role: 'MEMBER',
        status: 'PENDING',
        createdAt: '2026-08-20T02:00:00.000Z',
      },
    ],
    hasConversation: true,
  },
  {
    matchingGroupId: 'mg-4',
    tourId: 'tour-bidoup-2d1d',
    tourName: 'Bidoup Núi Bà 2N1Đ — nhóm chụp ảnh',
    tourImageUrl: getMockTourImage('tour-bidoup-2d1d'),
    location: 'Bidoup Núi Bà, Lạc Dương, Lâm Đồng',
    ownerId: OTHER_TREKKERS[2].id,
    ownerName: OTHER_TREKKERS[2].fullName,
    ownerAvatarUrl: OTHER_TREKKERS[2].avatarUrl,
    groupName: 'Bidoup săn hoa đỗ quyên',
    description: 'Nhóm đã đủ người, đóng ghép nhóm.',
    maxSize: 6,
    targetDate: '2026-09-05',
    matchingDeadline: '2026-08-30T23:59:00.000Z',
    status: 'FULL',
    createdAt: '2026-07-20T02:00:00.000Z',
    itinerary: [
      {
        day: 1,
        title: 'Trạm kiểm lâm → Rừng nguyên sinh → Điểm cắm trại',
        description: 'Trek xuyên rừng nguyên sinh, ngắm hoa đỗ quyên nở dọc đường.',
      },
      {
        day: 2,
        title: 'Điểm cắm trại → Đỉnh Bidoup → Trạm kiểm lâm',
        description: 'Ngắm bình minh trên đỉnh, xuống núi và kết thúc hành trình.',
      },
    ],
    budgetItems: [
      { label: 'Phí kiểm lâm + hướng dẫn', amount: 300000 },
      { label: 'Đồ ăn + lều trại thuê', amount: 400000 },
    ],
    journeyIntro: [
      'Vườn quốc gia Bidoup Núi Bà là khu rừng nguyên sinh rộng lớn ở Lâm Đồng, nổi tiếng với mùa hoa đỗ quyên nở rộ và hệ sinh thái đa dạng bậc nhất Tây Nguyên.',
      'Hành trình 2 ngày 1 đêm phù hợp người yêu thích nhiếp ảnh thiên nhiên, đi chậm để quan sát và chụp ảnh hoa, chim rừng dọc đường.',
    ],
    matchPercent: 78,
    matchReasons: [
      { label: 'Mùa hoa đỗ quyên', detail: 'Đúng thời điểm hoa nở rộ đầu tháng 9' },
      { label: 'Phù hợp nhiếp ảnh', detail: 'Nhịp độ chậm, nhiều điểm dừng chụp ảnh' },
      { label: 'Nhóm đã đủ người', detail: 'Có thể đăng ký Waitlist chờ suất trống' },
    ],
    members: Array.from({ length: 6 }).map((_, i) => ({
      matchingMemberId: `mm-full-${i}`,
      userId: `user-demo-bidoup-${i}`,
      fullName: `Thành viên ${i + 1}`,
      avatarUrl: getMockAvatar(`bidoup-${i}`),
      role: i === 0 ? ('OWNER' as const) : ('MEMBER' as const),
      status: 'ACCEPTED' as const,
      createdAt: '2026-07-21T02:00:00.000Z',
    })),
    hasConversation: true,
  },
];

function currentUserIdFromAuthHeader(request: Request): string | null {
  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Bearer mock-access-')) return null;
  const rest = auth.replace('Bearer mock-access-', '');
  return rest.split('-').slice(0, -1).join('-') || null;
}

function currentUser(request: Request) {
  const id = currentUserIdFromAuthHeader(request);
  return (id && findUserById(id)) || TREKKER;
}

function toItem(g: MatchingGroup) {
  return {
    matchingGroupId: g.matchingGroupId,
    tourId: g.tourId,
    tourName: g.tourName,
    tourImageUrl: g.tourImageUrl,
    location: g.location,
    ownerId: g.ownerId,
    ownerName: g.ownerName,
    ownerAvatarUrl: g.ownerAvatarUrl,
    groupName: g.groupName,
    description: g.description,
    maxSize: g.maxSize,
    currentSize: g.members.filter((m) => m.status === 'ACCEPTED').length,
    targetDate: g.targetDate,
    matchingDeadline: g.matchingDeadline,
    status: g.status,
    createdAt: g.createdAt,
  };
}

function toDetail(g: MatchingGroup, userId?: string) {
  return {
    ...toItem(g),
    itinerary: g.itinerary,
    budgetItems: g.budgetItems,
    journeyIntro: g.journeyIntro,
    matchPercent: g.matchPercent,
    matchReasons: g.matchReasons,
    members: g.members,
    hasConversation: g.hasConversation ?? false,
    isInConversation: userId
      ? g.members.some((m) => m.userId === userId && m.status === 'ACCEPTED')
      : false,
  };
}

function paginate<T>(items: T[], page: number, size: number) {
  const start = page * size;
  const content = items.slice(start, start + size);
  return {
    content,
    pageNumber: page,
    pageSize: size,
    totalElements: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / size)),
    last: start + size >= items.length,
  };
}

export const companionGroupHandlers = [
  // GET /matching-groups/owned — phải đứng TRƯỚC GET /matching-groups/:id
  http.get('*/matching-groups/owned', async ({ request }) => {
    const url = new URL(request.url);
    const user = currentUser(request);
    const page = Number(url.searchParams.get('page') ?? '0');
    const size = Number(url.searchParams.get('size') ?? '10');
    const status = url.searchParams.get('status');
    const keyword = url.searchParams.get('keyword')?.toLowerCase();

    let owned = groups.filter((g) => g.ownerId === user.id);
    if (status) owned = owned.filter((g) => g.status === status);
    if (keyword) owned = owned.filter((g) => g.groupName.toLowerCase().includes(keyword));

    return ok(paginate(owned.map(toItem), page, size));
  }),

  // GET /matching-groups/join-requests/me — phải đứng TRƯỚC GET /matching-groups/:groupId/join-requests
  http.get('*/matching-groups/join-requests/me', async ({ request }) => {
    const url = new URL(request.url);
    const user = currentUser(request);
    const page = Number(url.searchParams.get('page') ?? '0');
    const size = Number(url.searchParams.get('size') ?? '10');
    const status = url.searchParams.get('status');

    let items = groups.flatMap((g) =>
      g.members
        .filter((m) => m.userId === user.id && m.role === 'MEMBER')
        .map((m) => ({
          matchingMemberId: m.matchingMemberId,
          matchingGroupId: g.matchingGroupId,
          groupName: g.groupName,
          groupStatus: g.status,
          tourId: g.tourId,
          tourName: g.tourName,
          tourImageUrl: g.tourImageUrl,
          ownerId: g.ownerId,
          ownerName: g.ownerName,
          ownerAvatarUrl: g.ownerAvatarUrl,
          currentSize: g.members.filter((mm) => mm.status === 'ACCEPTED').length,
          maxSize: g.maxSize,
          targetDate: g.targetDate,
          matchingDeadline: g.matchingDeadline,
          status: m.status,
          createdAt: m.createdAt,
          updatedAt: m.createdAt,
          canCancel: m.status === 'PENDING',
        }))
    );
    if (status) items = items.filter((i) => i.status === status);

    return ok(paginate(items, page, size));
  }),

  // GET /matching-groups — danh sách công khai
  http.get('*/matching-groups', async ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? '0');
    const size = Number(url.searchParams.get('size') ?? '10');
    const tourId = url.searchParams.get('tourId');
    const targetDate = url.searchParams.get('targetDate');
    const keyword = url.searchParams.get('keyword')?.toLowerCase();

    let list = groups.filter((g) => g.status !== 'HIDDEN');
    if (tourId) list = list.filter((g) => g.tourId === tourId);
    if (targetDate) list = list.filter((g) => g.targetDate === targetDate);
    if (keyword) {
      list = list.filter(
        (g) =>
          g.groupName.toLowerCase().includes(keyword) || g.tourName.toLowerCase().includes(keyword)
      );
    }

    return ok(paginate(list.map(toItem), page, size));
  }),

  // POST /matching-groups — tạo nhóm mới
  http.post('*/matching-groups', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as {
      tourId?: string;
      groupName?: string;
      description?: string;
      maxSize?: number;
      targetDate?: string;
      matchingDeadline?: string;
    };
    const user = currentUser(request);
    const newGroup: MatchingGroup = {
      matchingGroupId: nextId('mg'),
      tourId: body.tourId ?? 'tour-unknown',
      tourName: 'Tour đã chọn',
      tourImageUrl: getMockTourImage(body.tourId ?? 'tour-unknown'),
      location: 'Đang cập nhật',
      ownerId: user.id,
      ownerName: user.fullName,
      ownerAvatarUrl: user.avatarUrl,
      groupName: body.groupName ?? 'Nhóm ghép chuyến đi mới',
      description: body.description,
      maxSize: body.maxSize ?? 6,
      targetDate: body.targetDate ?? new Date().toISOString().slice(0, 10),
      matchingDeadline: body.matchingDeadline ?? new Date().toISOString(),
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      itinerary: [],
      budgetItems: [],
      journeyIntro: [],
      matchPercent: 80,
      matchReasons: [],
      members: [
        {
          matchingMemberId: nextId('mm'),
          userId: user.id,
          fullName: user.fullName,
          avatarUrl: user.avatarUrl,
          role: 'OWNER',
          status: 'ACCEPTED',
          createdAt: new Date().toISOString(),
        },
      ],
      hasConversation: false,
    };
    groups.unshift(newGroup);
    return ok(toDetail(newGroup, user.id), 'Tạo nhóm thành công', 201);
  }),

  // GET /matching-groups/:matchingGroupId
  http.get('*/matching-groups/:matchingGroupId', async ({ params, request }) => {
    const user = currentUser(request);
    const group = groups.find((g) => g.matchingGroupId === params.matchingGroupId);
    if (!group) return fail('Không tìm thấy nhóm ghép chuyến đi.', 404);
    return ok(toDetail(group, user.id));
  }),

  // DELETE /matching-groups/:matchingGroupId
  http.delete('*/matching-groups/:matchingGroupId', async ({ params }) => {
    const idx = groups.findIndex((g) => g.matchingGroupId === params.matchingGroupId);
    if (idx === -1) return fail('Không tìm thấy nhóm ghép chuyến đi.', 404);
    groups.splice(idx, 1);
    return ok(null, 'Đã xoá nhóm.');
  }),

  // POST /matching-groups/:matchingGroupId/join
  http.post('*/matching-groups/:matchingGroupId/join', async ({ params, request }) => {
    const group = groups.find((g) => g.matchingGroupId === params.matchingGroupId);
    if (!group) return fail('Không tìm thấy nhóm ghép chuyến đi.', 404);
    const user = currentUser(request);
    const body = (await request.json().catch(() => ({}))) as { message?: string };

    let member = group.members.find((m) => m.userId === user.id);
    if (member && member.status !== 'LEFT' && member.status !== 'REJECTED') {
      return ok(member, 'Bạn đã gửi yêu cầu tham gia nhóm này rồi.');
    }
    member = {
      matchingMemberId: nextId('mm'),
      userId: user.id,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      role: 'MEMBER',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      message: body.message,
    };
    group.members = group.members.filter((m) => m.userId !== user.id);
    group.members.push(member);
    return created(member, 'Đã gửi yêu cầu tham gia.');
  }),

  // GET /matching-groups/:matchingGroupId/members/me
  http.get('*/matching-groups/:matchingGroupId/members/me', async ({ params, request }) => {
    const group = groups.find((g) => g.matchingGroupId === params.matchingGroupId);
    if (!group) return fail('Không tìm thấy nhóm ghép chuyến đi.', 404);
    const user = currentUser(request);
    const member = group.members.find((m) => m.userId === user.id);
    if (!member) return fail('Bạn chưa tham gia nhóm này.', 404);
    return ok(member);
  }),

  // DELETE /matching-groups/:matchingGroupId/members/me — rời nhóm
  http.delete('*/matching-groups/:matchingGroupId/members/me', async ({ params, request }) => {
    const group = groups.find((g) => g.matchingGroupId === params.matchingGroupId);
    if (!group) return fail('Không tìm thấy nhóm ghép chuyến đi.', 404);
    const user = currentUser(request);
    const member = group.members.find((m) => m.userId === user.id);
    if (!member) return fail('Bạn chưa tham gia nhóm này.', 404);
    member.status = 'LEFT';
    return ok(member, 'Bạn đã rời nhóm.');
  }),

  // DELETE /matching-groups/:matchingGroupId/join-request — huỷ yêu cầu tham gia
  http.delete('*/matching-groups/:matchingGroupId/join-request', async ({ params, request }) => {
    const group = groups.find((g) => g.matchingGroupId === params.matchingGroupId);
    if (!group) return fail('Không tìm thấy nhóm ghép chuyến đi.', 404);
    const user = currentUser(request);
    const member = group.members.find((m) => m.userId === user.id && m.status === 'PENDING');
    if (!member) return fail('Không có yêu cầu tham gia nào để huỷ.', 404);
    member.status = 'LEFT';
    return ok(member, 'Đã huỷ yêu cầu tham gia.');
  }),

  // PUT /matching-groups/:groupId/join-requests/:memberId/approve
  http.put('*/matching-groups/:groupId/join-requests/:memberId/approve', async ({ params }) => {
    const group = groups.find((g) => g.matchingGroupId === params.groupId);
    if (!group) return fail('Không tìm thấy nhóm ghép chuyến đi.', 404);
    const member = group.members.find((m) => m.matchingMemberId === params.memberId);
    if (!member) return fail('Không tìm thấy yêu cầu tham gia.', 404);
    member.status = 'ACCEPTED';
    if (group.members.filter((m) => m.status === 'ACCEPTED').length >= group.maxSize) {
      group.status = 'FULL';
    }
    return ok(member, 'Đã chấp nhận thành viên.');
  }),

  // PUT /matching-groups/:groupId/join-requests/:memberId/reject
  http.put('*/matching-groups/:groupId/join-requests/:memberId/reject', async ({ params }) => {
    const group = groups.find((g) => g.matchingGroupId === params.groupId);
    if (!group) return fail('Không tìm thấy nhóm ghép chuyến đi.', 404);
    const member = group.members.find((m) => m.matchingMemberId === params.memberId);
    if (!member) return fail('Không tìm thấy yêu cầu tham gia.', 404);
    member.status = 'REJECTED';
    return ok(member, 'Đã từ chối thành viên.');
  }),

  // GET /matching-groups/:groupId/join-requests
  http.get('*/matching-groups/:groupId/join-requests', async ({ params, request }) => {
    const group = groups.find((g) => g.matchingGroupId === params.groupId);
    if (!group) return fail('Không tìm thấy nhóm ghép chuyến đi.', 404);
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? '0');
    const size = Number(url.searchParams.get('size') ?? '10');
    const status = url.searchParams.get('status');

    let members = group.members.filter((m) => m.role === 'MEMBER');
    if (status) members = members.filter((m) => m.status === status);

    return ok(paginate(members, page, size));
  }),
];
