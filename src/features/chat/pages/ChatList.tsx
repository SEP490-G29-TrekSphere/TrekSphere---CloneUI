import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  BarChart3,
  Bell,
  Bold,
  CalendarRange,
  Compass,
  Download,
  FileText,
  HelpCircle,
  Image as ImageIcon,
  Italic,
  LayoutDashboard,
  List,
  MessageSquare,
  MoreVertical,
  Paperclip,
  Plus,
  Search,
  Send,
  Settings as SettingsIcon,
  Smile,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import * as z from 'zod';
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from '@/components/ui/attachment';
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Bubble, BubbleContent } from '@/components/ui/bubble';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Marker, MarkerContent } from '@/components/ui/marker';
import { Message, MessageAvatar, MessageContent, MessageFooter } from '@/components/ui/message';
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from '@/components/ui/message-scroller';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PATHS } from '@/constants';
import type { Conversation, DetailMessage } from '@/features/chat/types/types';
import { toast } from '@/store/useToastStore';

// ─── Helpers ────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

function getBadgeVariant(
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'accent'
): React.ComponentProps<typeof Badge>['variant'] {
  switch (variant) {
    case 'accent':
      return 'default';
    case 'outline':
      return 'outline';
    case 'destructive':
      return 'destructive';
    case 'secondary':
      return 'secondary';
    default:
      return 'secondary';
  }
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const mockConversations: Conversation[] = [
  {
    id: '1',
    userName: 'Nguyễn Văn A',
    avatarUrl: '',
    lastMessage: 'Cảm ơn, mình đã nhận...',
    lastMessageTime: '2m',
    unread: false,
    tag: { text: 'TÀ NĂNG - PHAN DŨNG', variant: 'accent' },
    timestamp: '2026-07-13T10:45:00Z',
    online: true,
    startDate: 'Oct 12, 2025',
  },
  {
    id: '2',
    userName: 'Lê Thị B',
    avatarUrl: '',
    lastMessage: 'Khi nào đoàn mình xuất phát vậy ạ?',
    lastMessageTime: '1h',
    unread: true,
    tag: { text: 'CHUẨN BỊ', variant: 'accent' },
    timestamp: '2026-07-13T09:12:00Z',
    online: false,
    startDate: 'Oct 14, 2025',
  },
  {
    id: '3',
    userName: 'Trần Văn C',
    avatarUrl: '',
    lastMessage: 'Tôi muốn nâng cấp gói bảo hiểm du lịch...',
    lastMessageTime: '4h',
    unread: false,
    tag: { text: 'FEEDBACK', variant: 'outline' },
    timestamp: '2026-07-13T06:20:00Z',
    online: true,
    startDate: 'Oct 15, 2025',
  },
];

const initialMockMessages: Record<string, DetailMessage[]> = {
  '1': [
    {
      id: 'm1_1',
      sender: 'user',
      text: 'Chào bạn, mình muốn xác nhận lại lịch trình Tour Tà Năng - Phan Dũng vào cuối tuần này.',
      time: '10:30 AM',
    },
    {
      id: 'm1_2',
      sender: 'agent',
      text: 'Chào anh A! TrekSphere đã nhận được yêu cầu của anh. Em gửi anh bản lịch trình chi tiết đã được cập nhật nhé.',
      time: '10:32 AM',
    },
    {
      id: 'm1_3',
      sender: 'agent',
      time: '10:32 AM',
      isSeen: true,
      attachment: {
        name: 'Lich-trinh-Ta-Nang.pdf',
        size: '2.4 MB',
        type: 'PDF Document',
      },
    },
    {
      id: 'm1_4',
      sender: 'user',
      text: 'Cảm ơn, mình đã nhận được file. Cho mình hỏi thêm về danh sách đồ dùng cá nhân cần mang theo được không?',
      time: '10:35 AM',
    },
  ],
  '2': [
    {
      id: 'm2_1',
      sender: 'user',
      text: 'Khi nào đoàn mình xuất phát vậy ạ?',
      time: '09:12 AM',
    },
  ],
  '3': [
    {
      id: 'm3_1',
      sender: 'user',
      text: 'Tôi muốn nâng cấp gói bảo hiểm du lịch lên hạng VIP được không?',
      time: '06:20 AM',
    },
  ],
};

// ─── Form schema ─────────────────────────────────────────────────────────────

const chatMessageSchema = z.object({
  message: z
    .string()
    .transform((val) => val.trim())
    .refine((val) => val.length > 0, { message: 'Tin nhắn không được để trống' }),
});

type ChatMessageFormValues = z.infer<typeof chatMessageSchema>;

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ChatList() {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [messagesMap, setMessagesMap] =
    useState<Record<string, DetailMessage[]>>(initialMockMessages);
  const [selectedId, setSelectedId] = useState<string | null>('1');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChatMessageFormValues>({
    resolver: zodResolver(chatMessageSchema),
    defaultValues: { message: '' },
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: Clear draft on conversation change.
  useEffect(() => {
    reset({ message: '' });
  }, [selectedId, reset]);

  const selectedConversation = conversations.find((c) => c.id === selectedId);
  const currentMessages = selectedId ? messagesMap[selectedId] || [] : [];

  const filteredConversations = conversations
    .filter((c) => {
      const matchesSearch =
        c.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
      return activeTab === 'unread' ? matchesSearch && c.unread : matchesSearch;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const handleSelectConversation = (id: string) => {
    setSelectedId(id);
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, unread: false } : c)));
  };

  const onSubmitMessage = (data: ChatMessageFormValues) => {
    if (!selectedId) return;
    const msgText = data.message;
    const newMsg: DetailMessage = {
      id: `m_${selectedId}_${Date.now()}`,
      sender: 'agent',
      text: msgText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSeen: false,
    };
    setMessagesMap((prev) => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] || []), newMsg],
    }));
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedId
          ? {
              ...c,
              lastMessage: msgText.length > 22 ? `${msgText.substring(0, 22)}...` : msgText,
              lastMessageTime: 'Vừa xong',
              timestamp: new Date().toISOString(),
            }
          : c
      )
    );
    reset({ message: '' });
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* ── 1. Sidebar ─────────────────────────────────────────────────── */}
      <aside className="hidden w-64 flex-col border-r border-border bg-background p-6 md:flex">
        {/* Logo */}
        <div className="mb-6 flex flex-col gap-1">
          <span className="text-3xl font-extrabold tracking-tight text-primary">TrekSphere</span>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            TRANG NHÂN VIÊN
          </span>
        </div>

        {/* New journey button */}
        <Button
          className="mb-8 w-full rounded-full"
          onClick={() => toast.info('Tính năng Hành trình Mới đang được phát triển.')}
        >
          <Plus data-icon="inline-start" />
          Hành trình Mới
        </Button>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-1">
          {[
            { to: PATHS.DASHBOARD, icon: LayoutDashboard, label: 'Bảng điều khiển' },
            { to: PATHS.TOURS, icon: Compass, label: 'Tour du lịch' },
            { to: PATHS.DASHBOARD, icon: CalendarRange, label: 'Đặt chỗ' },
            { to: PATHS.DASHBOARD, icon: BarChart3, label: 'Báo cáo' },
          ].map(({ to, icon: Icon, label }) => (
            <Link
              key={label}
              to={to}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
          <Link
            to={PATHS.CHAT}
            className="relative flex items-center gap-3 rounded-xl bg-muted px-4 py-3 text-sm font-bold text-primary transition-all"
          >
            <MessageSquare className="h-5 w-5" />
            Trò chuyện
            <span className="absolute right-4 top-1/2 h-4 w-1 -translate-y-1/2 rounded-full bg-primary" />
          </Link>
        </nav>

        {/* Footer */}
        <div className="border-t border-border pt-4 flex flex-col gap-1">
          {[
            { to: PATHS.SETTINGS, icon: SettingsIcon, label: 'Cài đặt' },
            { to: PATHS.DASHBOARD, icon: HelpCircle, label: 'Hỗ trợ' },
          ].map(({ to, icon: Icon, label }) => (
            <Link
              key={label}
              to={to}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
        </div>
      </aside>

      {/* ── Main Content ────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* ── 2. Header ───────────────────────────────────────────────── */}
        <header className="flex h-16 w-full items-center justify-between border-b border-border bg-background px-6">
          {/* Search */}
          <div className="relative w-full max-w-md">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Tìm kiếm cuộc trò chuyện..."
              aria-label="Tìm kiếm cuộc trò chuyện"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-full pl-10"
            />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Notifications"
              className="relative rounded-full"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Help" className="rounded-full">
              <HelpCircle className="h-5 w-5" />
            </Button>

            {/* Profile */}
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right">
                <p className="text-sm font-bold text-foreground leading-tight">Minh Tran</p>
                <p className="text-[10px] text-muted-foreground font-semibold leading-none">
                  Tour Manager
                </p>
              </div>
              <Avatar size="lg" className="bg-primary text-primary-foreground font-bold">
                <AvatarFallback>MT</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* ── 3. Split View ───────────────────────────────────────────── */}
        <div className="flex flex-1 overflow-hidden">
          {/* ── Conversation List ──────────────────────────────────────── */}
          <div
            className={`w-full flex-col border-r border-border bg-background md:w-80 lg:w-96 flex-shrink-0 ${selectedId ? 'hidden md:flex' : 'flex'}`}
          >
            <div className="px-6 py-4">
              <h1 className="text-2xl font-bold tracking-tight">Phòng Chat</h1>
            </div>

            {/* Tab filter */}
            <div className="px-6 mb-4">
              <Tabs
                value={activeTab}
                onValueChange={(val) => setActiveTab(val as 'all' | 'unread')}
                className="w-full"
              >
                <TabsList className="w-full">
                  <TabsTrigger value="all" className="flex-1">
                    Tất cả
                  </TabsTrigger>
                  <TabsTrigger value="unread" className="flex-1">
                    Chưa đọc
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Conversation list */}
            <ScrollArea className="flex-1">
              {filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                  <MessageSquare className="mb-2 h-8 w-8 stroke-1" />
                  <p className="text-sm">Không tìm thấy cuộc trò chuyện nào</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredConversations.map((item) => {
                    const isSelected = item.id === selectedId;
                    const initials = getInitials(item.userName);
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => handleSelectConversation(item.id)}
                        className={`w-full text-left relative flex cursor-pointer gap-4 p-5 transition-all hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${isSelected ? 'bg-muted/60' : ''}`}
                      >
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          <Avatar size="lg" className="bg-primary/10 text-primary font-bold">
                            {item.avatarUrl ? (
                              <AvatarImage src={item.avatarUrl} alt={item.userName} />
                            ) : null}
                            <AvatarFallback>{initials}</AvatarFallback>
                            {item.unread && <AvatarBadge className="bg-accent" />}
                            {item.online && !item.unread && (
                              <AvatarBadge className="bg-emerald-500" />
                            )}
                          </Avatar>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3
                              className={`text-sm truncate ${item.unread ? 'font-bold' : 'font-semibold'}`}
                            >
                              {item.userName}
                            </h3>
                            <span className="text-xs text-muted-foreground flex-shrink-0">
                              {item.lastMessageTime}
                            </span>
                          </div>
                          <p
                            className={`text-xs truncate ${item.unread ? 'text-foreground font-medium' : 'text-muted-foreground'}`}
                          >
                            {item.lastMessage}
                          </p>
                          {item.tag && (
                            <div className="mt-2">
                              <Badge
                                variant={getBadgeVariant(item.tag.variant)}
                                className="text-[10px] uppercase tracking-wide"
                              >
                                {item.tag.text}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* ── Chat Detail Pane ───────────────────────────────────────── */}
          <div className={`flex-1 flex-col bg-muted/10 ${selectedId ? 'flex' : 'hidden md:flex'}`}>
            {selectedConversation ? (
              <div className="flex h-full flex-col bg-background">
                {/* Chat Header */}
                <div className="flex min-h-20 h-auto py-3 flex-col gap-3 sm:flex-row sm:items-center justify-between border-b border-border px-6">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden rounded-full"
                      onClick={() => setSelectedId(null)}
                      aria-label="Quay lại danh sách"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="relative">
                      <Avatar size="lg" className="bg-primary/10 text-primary font-bold">
                        {selectedConversation.avatarUrl ? (
                          <AvatarImage
                            src={selectedConversation.avatarUrl}
                            alt={selectedConversation.userName}
                          />
                        ) : null}
                        <AvatarFallback>
                          {getInitials(selectedConversation.userName)}
                        </AvatarFallback>
                        {selectedConversation.online && <AvatarBadge className="bg-emerald-500" />}
                      </Avatar>
                    </div>
                    <div>
                      <h2 className="text-sm font-bold leading-tight">
                        {selectedConversation.userName}
                      </h2>
                      {selectedConversation.online ? (
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Trực tuyến
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                          Ngoại tuyến
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Header actions */}
                  <div className="flex items-center gap-3 flex-wrap">
                    {selectedConversation.tag?.text && (
                      <Badge
                        variant={getBadgeVariant(selectedConversation.tag.variant)}
                        className="gap-1.5 rounded-full px-3.5 py-1.5 text-xs"
                      >
                        <Compass className="h-4 w-4" />
                        {selectedConversation.tag.text}
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      className="rounded-full"
                      onClick={() => toast.info('Xem chi tiết đặt chỗ')}
                    >
                      Xem chi tiết đặt chỗ
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Tùy chọn khác"
                      className="rounded-full size-8"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* ── Messages ─────────────────────────────────────────── */}
                <MessageScrollerProvider autoScroll>
                  <MessageScroller className="flex-1 bg-muted/5">
                    <MessageScrollerViewport className="px-6 py-6">
                      <MessageScrollerContent>
                        {/* Date divider */}
                        {selectedConversation.startDate && (
                          <MessageScrollerItem messageId="start-marker">
                            <Marker variant="separator">
                              <MarkerContent className="text-[11px] font-bold">
                                Cuộc hội thoại bắt đầu • {(() => {
                                  const d = new Date(selectedConversation.startDate!);
                                  return Number.isNaN(d.getTime())
                                    ? selectedConversation.startDate
                                    : new Intl.DateTimeFormat('vi-VN').format(d);
                                })()}
                              </MarkerContent>
                            </Marker>
                          </MessageScrollerItem>
                        )}

                        {/* Messages */}
                        {currentMessages.map((msg) => {
                          const isAgent = msg.sender === 'agent';
                          const align = isAgent ? 'end' : 'start';

                          return (
                            <MessageScrollerItem
                              key={msg.id}
                              messageId={msg.id}
                              scrollAnchor={!isAgent}
                            >
                              <Message align={align}>
                                {/* Avatar (user/customer side only) */}
                                {!isAgent && (
                                  <MessageAvatar>
                                    <Avatar className="bg-primary/10 text-primary font-bold text-xs">
                                      {selectedConversation.avatarUrl ? (
                                        <AvatarImage
                                          src={selectedConversation.avatarUrl}
                                          alt={selectedConversation.userName}
                                        />
                                      ) : null}
                                      <AvatarFallback>
                                        {getInitials(selectedConversation.userName)}
                                      </AvatarFallback>
                                    </Avatar>
                                  </MessageAvatar>
                                )}

                                <MessageContent>
                                  {/* Attachment message */}
                                  {msg.attachment ? (
                                    <Attachment state="done">
                                      <AttachmentMedia
                                        variant="icon"
                                        className="bg-red-100 text-red-600"
                                      >
                                        <FileText />
                                      </AttachmentMedia>
                                      <AttachmentContent>
                                        <AttachmentTitle>{msg.attachment.name}</AttachmentTitle>
                                        <AttachmentDescription>
                                          {msg.attachment.size} · {msg.attachment.type}
                                        </AttachmentDescription>
                                      </AttachmentContent>
                                      <AttachmentActions>
                                        <AttachmentAction aria-label="Tải về">
                                          <Download />
                                        </AttachmentAction>
                                      </AttachmentActions>
                                    </Attachment>
                                  ) : (
                                    /* Text message bubble */
                                    <Bubble variant={isAgent ? 'default' : 'muted'} align={align}>
                                      <BubbleContent>{msg.text}</BubbleContent>
                                    </Bubble>
                                  )}

                                  {/* Timestamp footer */}
                                  <MessageFooter>
                                    {msg.time}
                                    {isAgent && msg.isSeen && ' · SEEN'}
                                  </MessageFooter>
                                </MessageContent>
                              </Message>
                            </MessageScrollerItem>
                          );
                        })}
                      </MessageScrollerContent>
                    </MessageScrollerViewport>
                    <MessageScrollerButton />
                  </MessageScroller>
                </MessageScrollerProvider>

                {/* ── Composer ──────────────────────────────────────────── */}
                <div className="p-6 bg-background border-t border-border">
                  <form
                    onSubmit={handleSubmit(onSubmitMessage)}
                    className="flex flex-col rounded-2xl border border-border bg-muted/10 p-3"
                  >
                    {/* Toolbar */}
                    <div className="flex items-center justify-between border-b border-border/60 pb-2 mb-2">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        {[
                          { icon: Bold, title: 'In đậm' },
                          { icon: Italic, title: 'In nghiêng' },
                          { icon: List, title: 'Danh sách' },
                        ].map(({ icon: Icon, title }) => (
                          <button
                            key={title}
                            type="button"
                            title={title}
                            aria-label={title}
                            disabled
                            className="p-1.5 rounded-md opacity-40 cursor-not-allowed"
                          >
                            <Icon className="h-4 w-4" />
                          </button>
                        ))}
                        <span className="mx-2 h-4 w-px bg-border" />
                        {[
                          { icon: ImageIcon, title: 'Chèn ảnh' },
                          { icon: Paperclip, title: 'Đính kèm tệp' },
                          { icon: Smile, title: 'Biểu cảm' },
                        ].map(({ icon: Icon, title }) => (
                          <button
                            key={title}
                            type="button"
                            title={title}
                            aria-label={title}
                            disabled
                            className="p-1.5 rounded-md opacity-40 cursor-not-allowed"
                          >
                            <Icon className="h-4 w-4" />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Text area + send */}
                    <div className="flex items-end gap-3">
                      <textarea
                        rows={2}
                        placeholder="Nhập tin nhắn của bạn tại đây..."
                        {...register('message')}
                        aria-invalid={errors.message ? 'true' : 'false'}
                        aria-describedby={errors.message ? 'chat-message-error' : undefined}
                        className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground py-1"
                      />
                      <Button
                        type="submit"
                        size="icon"
                        aria-label="Gửi"
                        className="rounded-full flex-shrink-0 transition-transform hover:scale-105 active:scale-95"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    {errors.message?.message && (
                      <p
                        id="chat-message-error"
                        className="text-xs text-destructive mt-1 font-medium"
                      >
                        {errors.message.message}
                      </p>
                    )}
                  </form>
                </div>
              </div>
            ) : (
              /* Empty state */
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <MessageSquare className="mb-4 h-12 w-12 stroke-1" />
                <h3 className="text-lg font-bold">Chưa chọn cuộc trò chuyện nào</h3>
                <p className="text-sm">
                  Chọn một phòng chat ở thanh bên trái để bắt đầu cuộc trò chuyện.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
