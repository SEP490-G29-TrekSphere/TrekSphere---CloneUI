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
  tag?: Tag;
  tourName?: string;
  timestamp: string;
  online?: boolean;
  startDate?: string;
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
