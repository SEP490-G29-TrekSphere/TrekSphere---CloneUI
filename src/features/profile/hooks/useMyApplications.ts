import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  type VendorApplicationFilter,
  type VendorApplicationsResponse,
  vendorApplicationService,
} from '@/features/admin/services/vendorApplicationService';

export const myVendorApplicationKeys = {
  all: ['profile', 'myVendorApplications'] as const,
  lists: () => [...myVendorApplicationKeys.all, 'list'] as const,
  list: (filter: VendorApplicationFilter) =>
    [...myVendorApplicationKeys.lists(), { filter }] as const,
};

/**
 * Hook lấy danh sách đơn đăng ký Vendor của chính user (Trekker).
 */
export function useMyVendorApplications(filter: VendorApplicationFilter) {
  return useQuery<VendorApplicationsResponse>({
    queryKey: myVendorApplicationKeys.list(filter),
    queryFn: () => vendorApplicationService.getMyApplications(filter),
    staleTime: 30 * 1000,
  });
}

/**
 * Hook mutation tạo đơn đăng ký bản nháp Vendor (Trekker).
 */
export function useCreateDraftApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => vendorApplicationService.createDraftApplication(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myVendorApplicationKeys.all });
    },
  });
}

/**
 * Hook mutation nộp đơn đăng ký Vendor từ DRAFT -> PENDING (Trekker).
 */
export function useSubmitVendorApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => vendorApplicationService.submitApplication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myVendorApplicationKeys.all });
    },
  });
}

/**
 * Hook mutation cập nhật thông tin đơn đăng ký (Trekker).
 */
export function useUpdateVendorApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      vendorApplicationService.updateApplication(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myVendorApplicationKeys.all });
    },
  });
}

/**
 * Hook mutation nộp lại đơn đăng ký Vendor từ REJECTED -> PENDING (Trekker).
 */
export function useResubmitVendorApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => vendorApplicationService.resubmitApplication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myVendorApplicationKeys.all });
    },
  });
}
