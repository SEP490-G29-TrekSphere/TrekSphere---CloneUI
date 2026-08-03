import { useQuery } from '@tanstack/react-query';
import { chatService } from '../services/chatService';
import type { ChatConversationsParams } from '../types/types';

export function useChatConversations(params: ChatConversationsParams = {}) {
  const page = params.page ?? 1;
  const size = params.size ?? 10;

  return useQuery({
    queryKey: ['chatConversations', page, size],
    queryFn: () => chatService.getConversations({ page, size }),
  });
}
