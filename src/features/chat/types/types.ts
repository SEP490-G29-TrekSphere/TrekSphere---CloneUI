export interface Tag {
  text: string;
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'accent';
}

export interface Conversation {
  id: string;
  userName: string;
  avatarUrl?: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: boolean;
  unreadCount?: number;
  tag?: Tag;
  tourName?: string;
  timestamp: string;
  online?: boolean;
  startDate?: string;
  isVirtual?: boolean;
  virtualData?: VirtualConversationData;
}

export interface VirtualConversationData {
  participantIds: string[];
  type: 'DIRECT' | 'GROUP';
  userName: string;
  avatarUrl?: string;
  matchingGroupId?: string;
  title?: string;
}

export interface DetailMessage {
  id: string;
  sender: 'user' | 'agent';
  text?: string;
  time: string;
  isSeen?: boolean;
  attachment?: {
    name: string;
    size: string;
    type: string;
  };
}

export interface ConversationResponse {
  conversationId: string;
  title: string;
  avatarUrl?: string;
  conversationType: 'DIRECT' | 'GROUP';
  lastMessageAt: string;
  lastMessageContent: string;
  unreadCount: number;
  isNew?: boolean;
}

export interface PaginationResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ChatConversationsParams {
  page?: number;
  size?: number;
}

export interface MessageResponse {
  messageId: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatarUrl?: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface ChatMessagesParams {
  id: string;
  page?: number;
  size?: number;
}

export interface ConversationCreateRequest {
  conversationType: 'DIRECT' | 'GROUP';
  title?: string;
  participantIds: string[];
  matchingGroupId?: string;
}

export interface MessageCreateRequest {
  conversationId: string;
  content: string;
}
