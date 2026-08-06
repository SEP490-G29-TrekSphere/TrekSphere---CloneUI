import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  BarChart3,
  CalendarRange,
  Compass,
  Download,
  FileText,
  HelpCircle,
  LayoutDashboard,
  MessageSquare,
  Plus,
  Send,
  Settings as SettingsIcon,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation } from 'react-router-dom';
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
import { Marker, MarkerContent } from '@/components/ui/marker';
import { Message, MessageAvatar, MessageContent, MessageFooter } from '@/components/ui/message';
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
  useMessageScroller,
} from '@/components/ui/message-scroller';
import { ScrollArea } from '@/components/ui/scroll-area';
import { queryClient } from '@/config/queryClient';
import { PATHS } from '@/constants';
import type { Conversation, DetailMessage, MessageResponse } from '@/features/chat/types/types';
import { AppSpinner } from '@/shared/ui';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';
import { useChatWebSocket } from '../context/ChatWebSocketContext';
import { useChatConversations } from '../hooks/useChatConversations';
import { useChatMessages } from '../hooks/useChatMessages';
import { useSendMessage } from '../hooks/useSendMessage';

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

// ─── Form schema ─────────────────────────────────────────────────────────────

const chatMessageSchema = z.object({
  message: z
    .string()
    .transform((val) => val.trim())
    .refine((val) => val.length > 0, { message: 'Tin nhắn không được để trống' }),
});

type ChatMessageFormValues = z.infer<typeof chatMessageSchema>;

function ChatAutoScroller({ dependencies }: { dependencies: unknown[] }) {
  const { scrollToBottom } = useMessageScroller();

  useEffect(
    () => {
      // Small timeout to allow DOM to update before scrolling
      const timeoutId = setTimeout(() => {
        scrollToBottom();
      }, 10);
      return () => clearTimeout(timeoutId);
    },
    // biome-ignore lint/correctness/useExhaustiveDependencies: Custom dependency array passed as prop
    dependencies
  );

  return null;
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface ChatListProps {
  hideSidebar?: boolean;
}

export default function ChatList({ hideSidebar = false }: ChatListProps) {
  const { user } = useAppStore();
  const [page, _setPage] = useState(1);
  const [size, _setSize] = useState(10);
  const { data: apiResponse, isLoading, error } = useChatConversations({ page, size });
  const sendMessageMutation = useSendMessage();
  const location = useLocation();
  const stateConversationId = location.state?.conversationId as string | undefined;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [_localMessages, _setLocalMessages] = useState<Record<string, DetailMessage[]>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, _setSearchQuery] = useState('');

  const { client, isConnected } = useChatWebSocket();
  const { mutate: sendMessage } = useSendMessage();

  const {
    data: messagesResponse,
    isLoading: isLoadingMessages,
    error: messagesError,
  } = useChatMessages({
    id: selectedId || '',
    page: 1,
    size: 50,
  });

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

  // WebSocket Subscription
  useEffect(() => {
    if (!client || !isConnected || !selectedId) return;

    const subscription = client.subscribe(
      `/topic/chat/conversations/${selectedId}/messages`,
      (message) => {
        if (message.body) {
          try {
            const parsed = JSON.parse(message.body);

            // Cập nhật React Query cache
            // biome-ignore lint/suspicious/noExplicitAny: React Query cache structure
            queryClient.setQueryData(['chatMessages', selectedId, 1, 50], (oldData: any) => {
              if (!oldData) return oldData;

              // Tránh duplicate tin nhắn
              const isExist = oldData.content?.some(
                (msg: MessageResponse) => msg.messageId === parsed.messageId
              );
              if (isExist) return oldData;

              return {
                ...oldData,
                content: [parsed, ...oldData.content],
              };
            });

            // Cập nhật last message trong danh sách conversation
            setConversations((prev) =>
              prev.map((c) =>
                c.id === selectedId
                  ? {
                      ...c,
                      lastMessage:
                        parsed.content?.length > 22
                          ? `${parsed.content.substring(0, 22)}...`
                          : parsed.content,
                      lastMessageTime: new Date(parsed.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      }),
                      timestamp: parsed.createdAt,
                    }
                  : c
              )
            );
          } catch (e) {
            console.error('Failed to parse incoming message', e);
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [client, isConnected, selectedId]);

  // Sync API response to local state
  useEffect(() => {
    if (apiResponse?.content) {
      const mapped: Conversation[] = apiResponse.content.map((item) => {
        const date = new Date(item.lastMessageAt);
        const lastMessageTime = !Number.isNaN(date.getTime())
          ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : '';

        return {
          id: item.conversationId,
          userName: item.title,
          avatarUrl: item.avatarUrl || '',
          lastMessage: item.lastMessageContent || '',
          lastMessageTime,
          unread: item.unreadCount > 0,
          timestamp: item.lastMessageAt,
          online: false,
          startDate: undefined,
          tag: {
            text: item.conversationType === 'DIRECT' ? 'DIRECT' : 'GROUP',
            variant: item.conversationType === 'DIRECT' ? 'secondary' : 'accent',
          },
        };
      });
      setConversations(mapped);

      if (mapped.length > 0) {
        setSelectedId((prev) => {
          if (stateConversationId && mapped.some((c) => c.id === stateConversationId))
            return stateConversationId;
          if (prev && mapped.some((c) => c.id === prev)) return prev;
          return mapped[0].id;
        });
      } else {
        setSelectedId(null);
      }
    }
  }, [apiResponse, stateConversationId]);

  // Error toast feedback
  useEffect(() => {
    if (error) {
      toast.error('Không thể tải danh sách phòng chat');
    }
  }, [error]);

  useEffect(() => {
    if (messagesError) {
      toast.error('Không thể tải lịch sử tin nhắn');
    }
  }, [messagesError]);

  const selectedConversation = conversations.find((c) => c.id === selectedId);

  const currentMessages = useMemo(() => {
    if (!selectedId) return [];

    const apiMsgs: DetailMessage[] = (messagesResponse?.content || [])
      .map((msg) => {
        const date = new Date(msg.createdAt);
        const time = !Number.isNaN(date.getTime())
          ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : '';

        const isSelf = user?.id === msg.senderId;
        const sender: 'user' | 'agent' = isSelf ? 'agent' : 'user';

        return {
          id: msg.messageId,
          sender,
          text: msg.content,
          time,
          isSeen: msg.isRead,
        };
      })
      .reverse();

    return apiMsgs;
  }, [messagesResponse, selectedId, user?.id]);

  const filteredConversations = conversations
    .filter((c) => {
      const matchesSearch =
        c.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const handleSelectConversation = (id: string) => {
    setSelectedId(id);
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, unread: false } : c)));
  };

  const onSubmitMessage = (data: ChatMessageFormValues) => {
    if (!selectedId) return;
    const msgText = data.message;

    // Gọi API để gửi tin nhắn
    sendMessage({
      conversationId: selectedId,
      content: msgText,
    });

    // Optimistic UI updates
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

    // Xóa nội dung trên trường tin nhắn sau khi gửi
    reset({ message: '' });
  };

  return (
    <div
      className={`flex w-full overflow-hidden bg-background text-foreground ${hideSidebar ? 'h-full' : 'h-screen'}`}
    >
      {/* ── 1. Sidebar ─────────────────────────────────────────────────── */}
      {!hideSidebar && (
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
      )}

      {/* ── Main Content ────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* ── 3. Split View ───────────────────────────────────────────── */}
        <div className="flex flex-1 overflow-hidden">
          {/* ── Conversation List ──────────────────────────────────────── */}
          <div
            className={`w-full flex-col border-r border-border bg-background md:w-80 lg:w-96 flex-shrink-0 ${selectedId ? 'hidden md:flex' : 'flex'}`}
          >
            <div className="px-6 py-4">
              <h1 className="text-2xl font-bold tracking-tight">Phòng Chat</h1>
            </div>

            {/* Conversation list */}
            <ScrollArea className="flex-1">
              {isLoading ? (
                <div className="flex h-32 items-center justify-center">
                  <AppSpinner size="lg" className="text-primary" />
                </div>
              ) : filteredConversations.length === 0 ? (
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
                  </div>
                </div>

                {/* ── Messages ─────────────────────────────────────────── */}
                <MessageScrollerProvider autoScroll>
                  <ChatAutoScroller
                    dependencies={[currentMessages.length, selectedId, isLoadingMessages]}
                  />
                  <MessageScroller className="flex-1 bg-muted/5">
                    <MessageScrollerViewport className="px-6 py-6">
                      <MessageScrollerContent>
                        {isLoadingMessages ? (
                          <div className="flex h-32 items-center justify-center">
                            <AppSpinner size="lg" className="text-primary" />
                          </div>
                        ) : (
                          <>
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
                                        <Bubble
                                          variant={isAgent ? 'default' : 'muted'}
                                          align={align}
                                        >
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
                          </>
                        )}
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
                    {/* Text area + send */}
                    <div className="flex items-end gap-3">
                      <textarea
                        rows={2}
                        placeholder={
                          sendMessageMutation.isPending
                            ? 'Đang gửi...'
                            : 'Nhập tin nhắn của bạn tại đây...'
                        }
                        {...register('message')}
                        disabled={sendMessageMutation.isPending}
                        aria-invalid={errors.message ? 'true' : 'false'}
                        aria-describedby={errors.message ? 'chat-message-error' : undefined}
                        className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground py-1 disabled:opacity-50"
                      />
                      <Button
                        type="submit"
                        size="icon"
                        aria-label="Gửi"
                        disabled={sendMessageMutation.isPending}
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
