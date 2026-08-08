import apiClient from '@/config/apiClient';

export interface CreateReportRequest {
  targetType: string;
  targetId: string;
  reason: string;
}

export const reportService = {
  createReport: async (data: CreateReportRequest): Promise<void> => {
    const response = await apiClient.post('/reports', data);
    return response.data;
  },
};
