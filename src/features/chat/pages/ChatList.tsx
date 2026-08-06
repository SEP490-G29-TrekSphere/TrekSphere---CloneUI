import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { queryClient } from '@/config/queryClient';
import { ChatDetailPane } from '@/features/chat/components/ChatDetailPane';
import { ConversationList } from '@/features/chat/components/ConversationList';
import type { Conversation, DetailMessage, MessageResponse } from '@/features/chat/types/types';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';
import { useChatWebSocket } from '../context/ChatWebSocketContext';
import { useChatConversations } from '../hooks/useChatConversations';
import { useChatMessages } from '../hooks/useChatMessages';
import { useMarkAsRead } from '../hooks/useMarkAsRead';
import { useSendMessage } from '../hooks/useSendMessage';

// ─── Main Component ───────────────────────────────────────────────────────────

interface ChatListProps {
  hideSidebar?: boolean;
}

export default function ChatList({ hideSidebar = false }: ChatListProps) {
  const { user } = useAppStore();
  const [page, _setPage] = useState(1);
  const [size, _setSize] = useState(10);
  const { data: apiResponse, isLoading, error } = useChatConversations({ page, size });
  const location = useLocation();
  const stateConversationId = location.state?.conversationId as string | undefined;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, _setSearchQuery] = useState('');

  const { client, isConnected } = useChatWebSocket();
  const { mutate: sendMessage, isPending: isSending } = useSendMessage();

  const {
    data: messagesResponse,
    isLoading: isLoadingMessages,
    error: messagesError,
  } = useChatMessages({
    id: selectedId || '',
    page: 1,
    size: 50,
  });

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
          unreadCount: item.unreadCount || 0,
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

  const { mutate: markAsRead } = useMarkAsRead();
  const markedAsReadRef = useRef<Set<string>>(new Set());
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

  // Handle window focus or active chat to mark messages as read
  useEffect(() => {
    const checkAndMarkRead = () => {
      if (selectedId && currentMessages.length > 0 && document.hasFocus()) {
        const targetConv = conversations.find((c) => c.id === selectedId);
        if (
          targetConv?.unreadCount &&
          targetConv.unreadCount > 0 &&
          !markedAsReadRef.current.has(selectedId)
        ) {
          markAsRead(selectedId);
          markedAsReadRef.current.add(selectedId);
          setConversations((prev) =>
            prev.map((c) => (c.id === selectedId ? { ...c, unread: false, unreadCount: 0 } : c))
          );
        }
      }
    };

    checkAndMarkRead();
    window.addEventListener('focus', checkAndMarkRead);
    return () => window.removeEventListener('focus', checkAndMarkRead);
  }, [conversations, selectedId, currentMessages.length, markAsRead]);

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
    const targetConv = conversations.find((c) => c.id === id);
    if (targetConv?.unreadCount && targetConv.unreadCount > 0) {
      markAsRead(id);
      markedAsReadRef.current.add(id);
    }
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: false, unreadCount: 0 } : c))
    );
  };

  const handleSendMessage = (msgText: string) => {
    if (!selectedId) return;

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
  };

  return (
    <div
      className={`flex w-full overflow-hidden bg-background text-foreground ${
        hideSidebar ? 'h-full' : 'h-screen'
      }`}
    >
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex flex-1 overflow-hidden">
          <ConversationList
            conversations={filteredConversations}
            isLoading={isLoading}
            selectedId={selectedId}
            onSelectConversation={handleSelectConversation}
          />
          <ChatDetailPane
            selectedConversation={selectedConversation}
            currentMessages={currentMessages}
            isLoadingMessages={isLoadingMessages}
            isSending={isSending}
            onSendMessage={handleSendMessage}
            onBack={() => setSelectedId(null)}
          />
        </div>
      </div>
    </div>
  );
}
