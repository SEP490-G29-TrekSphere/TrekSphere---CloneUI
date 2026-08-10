import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  type ApplicationStatus,
  type VendorApplicationFilter,
  type VendorApplicationsResponse,
  vendorApplicationService,
} from '../services/vendorApplicationService';

export const vendorApplicationKeys = {
  all: ['admin', 'vendorApplications'] as const,
  lists: () => [...vendorApplicationKeys.all, 'list'] as const,
  list: (filter: VendorApplicationFilter) =>
    [...vendorApplicationKeys.lists(), { filter }] as const,
  details: () => [...vendorApplicationKeys.all, 'detail'] as const,
  detail: (id: string) => [...vendorApplicationKeys.details(), id] as const,
  stats: () => [...vendorApplicationKeys.all, 'stats'] as const,
};

/**
 * Hook lấy danh sách các đơn đăng ký nhà cung cấp với filter và phân trang.
 */
export function useVendorApplications(filter: VendorApplicationFilter) {
  return useQuery<VendorApplicationsResponse>({
    queryKey: vendorApplicationKeys.list(filter),
    queryFn: () => vendorApplicationService.getApplications(filter),
  });
}

/**
 * Hook lấy chi tiết một đơn đăng ký theo ID.
 */
export function useVendorApplicationDetail(id?: string) {
  return useQuery({
    queryKey: vendorApplicationKeys.detail(id || ''),
    queryFn: () => vendorApplicationService.getApplicationById(id || ''),
    enabled: Boolean(id),
  });
}

/**
 * Hook lấy thống kê số lượng đơn theo từng trạng thái.
 */
export function useVendorApplicationStats() {
  return useQuery({
    queryKey: vendorApplicationKeys.stats(),
    queryFn: () => vendorApplicationService.getStats(),
  });
}

/**
 * Hook mutation phê duyệt hoặc từ chối đơn đăng ký làm Vendor (Admin).
 */
export function useReviewVendorApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      rejectionReason,
    }: {
      id: string;
      status: ApplicationStatus;
      rejectionReason?: string;
    }) => vendorApplicationService.reviewApplication(id, { status, rejectionReason }),
    onSuccess: () => {
      // Invalidate toàn bộ cache liên quan đến đơn đăng ký của admin để làm mới dữ liệu
      queryClient.invalidateQueries({ queryKey: vendorApplicationKeys.all });
    },
  });
}
