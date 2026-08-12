import { ApiService } from '@/config/apiClient';
import type {
  ChatConversationsParams,
  ChatMessagesParams,
  ConversationCreateRequest,
  ConversationMember,
  ConversationResponse,
  MessageCreateRequest,
  MessageResponse,
  PaginationResponse,
} from '../types/types';

export const chatService = {
  getConversations: async (
    params: ChatConversationsParams
  ): Promise<PaginationResponse<ConversationResponse>> => {
    const queryParams: Record<string, string> = {};
    if (params.page !== undefined) {
      queryParams.page = String(params.page);
    }
    if (params.size !== undefined) {
      queryParams.size = String(params.size);
    }

    const response = await ApiService<PaginationResponse<ConversationResponse>>(
      '/chat/conversations',
      'GET',
      undefined,
      queryParams
    );

    if (response.error) {
      throw new Error(response.error);
    }

    if (!response.data) {
      throw new Error('No data returned from chat conversations API');
    }

    return response.data;
  },

  getMessages: async (params: ChatMessagesParams): Promise<PaginationResponse<MessageResponse>> => {
    const queryParams: Record<string, string> = {};
    if (params.page !== undefined) {
      queryParams.page = String(params.page);
    }
    if (params.size !== undefined) {
      queryParams.size = String(params.size);
    }

    const response = await ApiService<PaginationResponse<MessageResponse>>(
      `/chat/conversations/${params.id}/messages`,
      'GET',
      undefined,
      queryParams
    );

    if (response.error) {
      throw new Error(response.error);
    }

    if (!response.data) {
      throw new Error('No data returned from chat messages API');
    }

    return response.data;
  },

  createConversation: async (data: ConversationCreateRequest): Promise<ConversationResponse> => {
    const response = await ApiService<ConversationResponse>('/chat/conversations', 'POST', data);

    if (response.error) {
      throw new Error(response.error);
    }

    if (!response.data) {
      throw new Error('No data returned from create conversation API');
    }

    return response.data;
  },

  sendMessage: async (data: MessageCreateRequest): Promise<MessageResponse> => {
    const response = await ApiService<MessageResponse>('/chat/messages', 'POST', data);

    if (response.error) {
      throw new Error(response.error);
    }

    if (!response.data) {
      throw new Error('No data returned from send message API');
    }

    return response.data;
  },

  markAsRead: async (id: string): Promise<void> => {
    const response = await ApiService<void>(`/chat/conversations/${id}/read`, 'PUT');

    if (response.error) {
      throw new Error(response.error);
    }
  },

  deleteConversation: async (id: string): Promise<void> => {
    const response = await ApiService<void>(`/chat/conversations/${id}`, 'DELETE');
    if (response.error) {
      throw new Error(response.error);
    }
  },

  removeMember: async (conversationId: string, memberId: string): Promise<void> => {
    const response = await ApiService<void>(
      `/chat/conversations/${conversationId}/members/${memberId}`,
      'DELETE'
    );
    if (response.error) {
      throw new Error(response.error);
    }
  },

  addMember: async (conversationId: string, memberId: string): Promise<void> => {
    const response = await ApiService<void>(
      `/chat/conversations/${conversationId}/members/${memberId}`,
      'POST'
    );
    if (response.error) {
      throw new Error(response.error);
    }
  },

  getConversationMembers: async (conversationId: string): Promise<ConversationMember[]> => {
    const response = await ApiService<ConversationMember[]>(
      `/chat/conversations/${conversationId}/members`,
      'GET'
    );
    if (response.error || !response.data) {
      throw new Error(response.error || 'Failed to fetch conversation members');
    }
    return response.data;
  },
};
