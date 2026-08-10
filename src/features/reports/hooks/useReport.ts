import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from '@/store/useToastStore';
import { type CreateReportRequest, reportService } from '../services/reportService';

export function useCreateReport() {
  return useMutation({
    mutationFn: (data: CreateReportRequest) => reportService.createReport(data),
    onSuccess: () => {
      toast.success('Gửi báo cáo thành công. Cảm ơn đóng góp của bạn!');
    },
    onError: (error: unknown) => {
      const message =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : 'Có lỗi xảy ra khi gửi báo cáo';
      toast.error(message);
    },
  });
}
