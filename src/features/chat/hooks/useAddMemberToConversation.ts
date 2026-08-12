import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService } from '../services/chatService';

export const useAddMemberToConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, memberId }: { conversationId: string; memberId: string }) =>
      chatService.addMember(conversationId, memberId),
    onSuccess: (_, { conversationId }) => {
      // Invalidate conversation details and lists
      queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};
