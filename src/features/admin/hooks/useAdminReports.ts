import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  adminReportService,
  type ReportFilterRequest,
  type ReportResponse,
  type ResolveReportRequest,
} from '../services/adminReportService';

export const adminReportKeys = {
  all: ['admin', 'reports'] as const,
  lists: () => [...adminReportKeys.all, 'list'] as const,
  list: (filter: ReportFilterRequest) => [...adminReportKeys.lists(), { filter }] as const,
  details: () => [...adminReportKeys.all, 'detail'] as const,
  detail: (id: string) => [...adminReportKeys.details(), id] as const,
};

/**
 * Hook lấy danh sách báo cáo với filter và phân trang
 */
export function useAdminReports(filter: ReportFilterRequest) {
  return useQuery({
    queryKey: adminReportKeys.list(filter),
    queryFn: () => adminReportService.getReports(filter),
    placeholderData: keepPreviousData, // Giữ data cũ khi chuyển trang giúp UX mượt hơn
  });
}

/**
 * Hook lấy chi tiết một báo cáo theo ID
 */
export function useAdminReportDetail(id?: string) {
  return useQuery({
    queryKey: adminReportKeys.detail(id || ''),
    queryFn: () => adminReportService.getReportDetail(id || ''),
    enabled: Boolean(id),
  });
}

/**
 * Hook mutation xử lý (resolve) báo cáo
 */
export function useResolveAdminReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ResolveReportRequest }) =>
      adminReportService.resolveReport(id, data),
    onSuccess: async (_, variables) => {
      // 1. Optimistic update: Cập nhật ngay data trong cache để UI phản hồi lập tức (tránh giật/khựng)
      queryClient.setQueryData(
        adminReportKeys.detail(variables.id),
        (old: ReportResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            status: variables.data.action === 'DISMISS' ? 'DISMISSED' : 'RESOLVED',
            resolutionNotes: variables.data.resolutionNotes,
            updatedAt: new Date().toISOString(),
          };
        }
      );

      // 2. Vẫn gọi lại API ngầm (background refetch) để đảm bảo đồng bộ dữ liệu tuyệt đối từ server
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminReportKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: adminReportKeys.detail(variables.id) }),
      ]);
    },
  });
}
