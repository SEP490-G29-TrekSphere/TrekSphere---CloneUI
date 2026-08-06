import { MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Conversation } from '@/features/chat/types/types';
import { AppSpinner } from '@/shared/ui';

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  isLoading: boolean;
  onSelectConversation: (id: string) => void;
}

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

export function ConversationList({
  conversations,
  selectedId,
  isLoading,
  onSelectConversation,
}: ConversationListProps) {
  return (
    <div
      className={`w-full flex-col border-r border-border bg-background md:w-80 lg:w-96 flex-shrink-0 ${
        selectedId ? 'hidden md:flex' : 'flex'
      }`}
    >
      <div className="px-6 py-4">
        <h1 className="text-2xl font-bold tracking-tight">Phòng Chat</h1>
      </div>

      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <AppSpinner size="lg" className="text-primary" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
            <MessageSquare className="mb-2 h-8 w-8 stroke-1" />
            <p className="text-sm">Không tìm thấy cuộc trò chuyện nào</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {conversations.map((item) => {
              const isSelected = item.id === selectedId;
              const initials = getInitials(item.userName);
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => onSelectConversation(item.id)}
                  className={`w-full text-left relative flex cursor-pointer gap-4 p-5 transition-all hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${
                    isSelected ? 'bg-muted/60' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <Avatar size="lg" className="bg-primary/10 text-primary font-bold">
                      {item.avatarUrl ? (
                        <AvatarImage src={item.avatarUrl} alt={item.userName} />
                      ) : null}
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3
                        className={`text-sm truncate ${
                          item.unread ? 'font-bold' : 'font-semibold'
                        }`}
                      >
                        {item.userName}
                      </h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {item.unread && <div className="h-2.5 w-2.5 rounded-full bg-destructive" />}
                        <span className="text-xs text-muted-foreground">
                          {item.lastMessageTime}
                        </span>
                      </div>
                    </div>
                    <p
                      className={`text-xs truncate ${
                        item.unread ? 'text-foreground font-medium' : 'text-muted-foreground'
                      }`}
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
  );
}
