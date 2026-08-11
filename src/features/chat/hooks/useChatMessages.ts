import { useQuery } from '@tanstack/react-query';
import { chatService } from '../services/chatService';

interface UseChatMessagesParams {
  id: string;
  page?: number;
  size?: number;
}

export function useChatMessages(params: UseChatMessagesParams) {
  const page = params.page ?? 1;
  const size = params.size ?? 20;

  return useQuery({
    queryKey: ['chatMessages', params.id, page, size],
    queryFn: () => chatService.getMessages({ id: params.id, page, size }),
    enabled: Boolean(params.id),
    refetchOnMount: 'always',
    gcTime: 0,
  });
}
