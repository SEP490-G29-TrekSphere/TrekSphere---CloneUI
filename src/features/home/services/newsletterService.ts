import { ApiService } from '@/config/apiClient';

export const newsletterService = {
  subscribe: async (email: string) => {
    return ApiService<{ message: string }>('/newsletter/subscribe', 'POST', { email });
  },
};
