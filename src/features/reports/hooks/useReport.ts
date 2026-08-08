import { useMutation } from '@tanstack/react-query';
import { toast } from '@/store/useToastStore';
import { type CreateReportRequest, reportService } from '../services/reportService';

export function useCreateReport() {
  return useMutation({
    mutationFn: (data: CreateReportRequest) => reportService.createReport(data),
    onSuccess: () => {
      toast.success('Gửi báo cáo thành công. Cảm ơn đóng góp của bạn!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi gửi báo cáo');
    },
  });
}
