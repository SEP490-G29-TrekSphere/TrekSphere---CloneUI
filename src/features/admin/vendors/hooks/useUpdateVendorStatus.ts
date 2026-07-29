import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminVendorService } from '../services/adminVendorService';
import type { VendorStatus } from '../types';
import { adminVendorKeys } from './useAdminVendors';

/**
 * Hook mutation cho thao tác đổi trạng thái Vendor (`PUT /vendors/{id}/status`).
 * Invalidate cả list lẫn stats khi thành công để 2 khối UI đồng bộ dữ liệu mới.
 */
export function useUpdateVendorStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ vendorId, status }: { vendorId: string; status: VendorStatus }) =>
      adminVendorService.updateStatus(vendorId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminVendorKeys.all });
    },
  });
}
