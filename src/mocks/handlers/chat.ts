import { http } from 'msw';
import { findUserById, mockUsers } from '../data/users';
import { created, fail, ok } from '../envelope';

/**
 * Mock cho `chatService.ts` + `useCheckConversation.ts` — phần HTTP (REST) của chat.
 *
 * LƯU Ý QUAN TRỌNG: gửi/nhận tin nhắn real-time trong app thật đi qua STOMP-over-SockJS
 * (`@stomp/stompjs` + `sockjs-client`), kết nối WebSocket tới `/ws`. MSW chỉ chặn được
 * fetch/XHR (HTTP), KHÔNG chặn được WebSocket/SockJS — nên tầng real-time đó sẽ không
 * kết nối được trong bản demo này (kết nối lỗi trong console, chấp nhận được vì UI các
 * màn hình chat vẫn tải danh sách hội thoại / lịch sử tin nhắn qua REST như bình thường).
 * Không có tệp `stompClient`/`socket` nào trong `chat` service cần mock ở đây — chỉ các
 * hàm gọi `ApiService` bên dưới.
 */

const TREKKER = mockUsers.find((u) => u.id === 'user-trekker-1')!;
const COORDINATOR = mockUsers.find((u) => u.id === 'user-coordinator-1')!;

interface Conversation {
  conversationId: string;
  title: string;
  avatarUrl?: string;
  conversationType: 'DIRECT' | 'GROUP';
  participantIds: string[];
  unreadCount: number;
  isGroupLeader?: boolean;
}

interface Message {
  messageId: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

let idSeq = 200;
function nextId(prefix: string) {
  idSeq += 1;
  return `${prefix}-${idSeq}`;
}

const conversations: Conversation[] = [
  {
    conversationId: 'conv-1',
    title: 'Phạm Thị Điều Phối',
    avatarUrl: COORDINATOR.avatarUrl,
    conversationType: 'DIRECT',
    participantIds: [TREKKER.id, COORDINATOR.id],
    unreadCount: 2,
  },
  {
    conversationId: 'conv-2',
    title: 'Nhóm Săn mây Fansipan cuối tháng 10',
    avatarUrl: 'https://i.pravatar.cc/150?u=fansipan-group',
    conversationType: 'GROUP',
    participantIds: [TREKKER.id, 'user-demo-hoangnam', 'user-demo-thanhha'],
    unreadCount: 0,
    isGroupLeader: false,
  },
  {
    conversationId: 'conv-3',
    title: 'Pù Luông mùa lúa — tự túc tiết kiệm',
    avatarUrl: 'https://i.pravatar.cc/150?u=puluong-group',
    conversationType: 'GROUP',
    participantIds: [TREKKER.id, 'user-demo-tuankiet'],
    unreadCount: 1,
    isGroupLeader: true,
  },
];

const messagesByConversation: Record<string, Message[]> = {
  'conv-1': [
    {
      messageId: nextId('msg'),
      conversationId: 'conv-1',
      senderId: COORDINATOR.id,
      content: 'Chào bạn, ngày mai đoàn tập trung tại chân núi lúc 6h00 nhé.',
      isRead: true,
      createdAt: '2026-08-28T23:00:00.000Z',
    },
    {
      messageId: nextId('msg'),
      conversationId: 'conv-1',
      senderId: COORDINATOR.id,
      content: 'Nhớ mang đủ nước và áo mưa, dự báo có mưa nhẹ buổi chiều.',
      isRead: false,
      createdAt: '2026-08-29T01:10:00.000Z',
    },
  ],
  'conv-2': [
    {
      messageId: nextId('msg'),
      conversationId: 'conv-2',
      senderId: 'user-demo-hoangnam',
      content: 'Mọi người ơi mình vừa chốt xong lịch trình chi tiết, để trong file đính kèm nhé.',
      isRead: true,
      createdAt: '2026-08-20T04:00:00.000Z',
    },
  ],
  'conv-3': [
    {
      messageId: nextId('msg'),
      conversationId: 'conv-3',
      senderId: 'user-demo-tuankiet',
      content: 'Bạn ơi cho mình xin thêm thông tin về điểm cắm trại đêm đầu tiên nhé.',
      isRead: false,
      createdAt: '2026-08-27T10:00:00.000Z',
    },
  ],
};

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

function toConversationResponse(c: Conversation) {
  const msgs = messagesByConversation[c.conversationId] ?? [];
  const last = msgs[msgs.length - 1];
  return {
    conversationId: c.conversationId,
    title: c.title,
    avatarUrl: c.avatarUrl,
    conversationType: c.conversationType,
    lastMessageAt: last?.createdAt ?? '',
    lastMessageContent: last?.content ?? '',
    unreadCount: c.unreadCount,
    isNew: false,
    isGroupLeader: c.isGroupLeader,
  };
}

function toMessageResponse(m: Message) {
  const sender = findUserById(m.senderId);
  return {
    messageId: m.messageId,
    conversationId: m.conversationId,
    senderId: m.senderId,
    senderName: sender?.fullName ?? 'Người dùng ẩn danh',
    senderAvatarUrl: sender?.avatarUrl,
    content: m.content,
    isRead: m.isRead,
    createdAt: m.createdAt,
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
    isLast: start + size >= items.length,
  };
}

export const chatHandlers = [
  // POST /chat/conversations/check — phải đứng TRƯỚC POST /chat/conversations
  http.post('*/chat/conversations/check', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as {
      conversationType?: 'DIRECT' | 'GROUP';
      participantIds?: string[];
      matchingGroupId?: string;
    };
    const user = currentUser(request);
    const targetIds = new Set([user.id, ...(body.participantIds ?? [])]);
    const existing = conversations.find(
      (c) =>
        c.conversationType === (body.conversationType ?? 'DIRECT') &&
        c.participantIds.length === targetIds.size &&
        c.participantIds.every((id) => targetIds.has(id))
    );
    return ok(existing ? toConversationResponse(existing) : null);
  }),

  http.get('*/chat/conversations', async ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? '0');
    const size = Number(url.searchParams.get('size') ?? '10');
    const user = currentUser(request);
    const list = conversations.filter((c) => c.participantIds.includes(user.id));
    return ok(paginate(list.map(toConversationResponse), page, size));
  }),

  http.get('*/chat/conversations/:id/messages', async ({ params, request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? '0');
    const size = Number(url.searchParams.get('size') ?? '20');
    const msgs = [...(messagesByConversation[params.id as string] ?? [])].reverse();
    return ok(paginate(msgs.map(toMessageResponse), page, size));
  }),

  http.post('*/chat/conversations', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as {
      conversationType?: 'DIRECT' | 'GROUP';
      title?: string;
      participantIds?: string[];
      matchingGroupId?: string;
    };
    const user = currentUser(request);
    const conv: Conversation = {
      conversationId: nextId('conv'),
      title: body.title ?? 'Cuộc trò chuyện mới',
      conversationType: body.conversationType ?? 'DIRECT',
      participantIds: Array.from(new Set([user.id, ...(body.participantIds ?? [])])),
      unreadCount: 0,
    };
    conversations.push(conv);
    messagesByConversation[conv.conversationId] = [];
    return created(
      { ...toConversationResponse(conv), isNew: true },
      'Tạo cuộc trò chuyện thành công.'
    );
  }),

  http.post('*/chat/messages', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as {
      conversationId?: string;
      content?: string;
    };
    if (!body.conversationId || !body.content) {
      return fail('Thiếu nội dung tin nhắn.', 400);
    }
    const user = currentUser(request);
    const msg: Message = {
      messageId: nextId('msg'),
      conversationId: body.conversationId,
      senderId: user.id,
      content: body.content,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    if (!messagesByConversation[body.conversationId]) {
      messagesByConversation[body.conversationId] = [];
    }
    messagesByConversation[body.conversationId].push(msg);
    return created(toMessageResponse(msg), 'Đã gửi tin nhắn.');
  }),

  http.put('*/chat/conversations/:id/read', async ({ params }) => {
    const conv = conversations.find((c) => c.conversationId === params.id);
    if (conv) conv.unreadCount = 0;
    const msgs = messagesByConversation[params.id as string] ?? [];
    for (const m of msgs) m.isRead = true;
    return ok(null, 'Đã đánh dấu đã đọc.');
  }),

  http.delete('*/chat/conversations/:id', async ({ params }) => {
    const idx = conversations.findIndex((c) => c.conversationId === params.id);
    if (idx === -1) return fail('Không tìm thấy cuộc trò chuyện.', 404);
    conversations.splice(idx, 1);
    delete messagesByConversation[params.id as string];
    return ok(null, 'Đã xoá cuộc trò chuyện.');
  }),

  http.delete('*/chat/conversations/:conversationId/members/:memberId', async ({ params }) => {
    const conv = conversations.find((c) => c.conversationId === params.conversationId);
    if (!conv) return fail('Không tìm thấy cuộc trò chuyện.', 404);
    conv.participantIds = conv.participantIds.filter((id) => id !== params.memberId);
    return ok(null, 'Đã xoá thành viên khỏi nhóm chat.');
  }),

  http.post('*/chat/conversations/:conversationId/members/:memberId', async ({ params }) => {
    const conv = conversations.find((c) => c.conversationId === params.conversationId);
    if (!conv) return fail('Không tìm thấy cuộc trò chuyện.', 404);
    if (!conv.participantIds.includes(params.memberId as string)) {
      conv.participantIds.push(params.memberId as string);
    }
    return ok(null, 'Đã thêm thành viên vào nhóm chat.');
  }),

  http.get('*/chat/conversations/:conversationId/members', async ({ params }) => {
    const conv = conversations.find((c) => c.conversationId === params.conversationId);
    if (!conv) return fail('Không tìm thấy cuộc trò chuyện.', 404);
    const members = conv.participantIds
      .map((id) => findUserById(id))
      .filter((u): u is NonNullable<typeof u> => Boolean(u))
      .map((u) => ({ id: u.id, email: u.email, fullName: u.fullName, avatarUrl: u.avatarUrl }));
    return ok(members);
  }),
];
