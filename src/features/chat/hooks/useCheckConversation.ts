import { useMutation } from '@tanstack/react-query';
import { ApiService } from '@/config/apiClient';
import type { ConversationCreateRequest, ConversationResponse } from '../types/types';

export const useCheckConversation = () => {
  return useMutation({
    mutationFn: async (request: ConversationCreateRequest) => {
      const response = await ApiService<ConversationResponse>(
        '/chat/conversations/check',
        'POST',
        request
      );
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data; // Can be null/undefined if 204 No Content
    },
  });
};
