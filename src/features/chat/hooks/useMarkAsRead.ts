import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService } from '../services/chatService';

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => chatService.markAsRead(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: ['chatMessages', id],
      });
      queryClient.invalidateQueries({
        queryKey: ['chatConversations'],
      });
    },
  });
}
