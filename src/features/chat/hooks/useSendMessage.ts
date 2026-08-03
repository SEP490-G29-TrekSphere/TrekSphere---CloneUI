import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService } from '../services/chatService';
import type { MessageCreateRequest } from '../types/types';

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MessageCreateRequest) => chatService.sendMessage(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['chatMessages', data.conversationId],
      });
      queryClient.invalidateQueries({
        queryKey: ['chatConversations'],
      });
    },
  });
}
