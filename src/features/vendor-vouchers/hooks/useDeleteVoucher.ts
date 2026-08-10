import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorVoucherService } from '../services/vendorVoucherService';
import { activeVendorVoucherKeys } from './useVendorActiveVouchers';
import { vendorVoucherKeys } from './useVendorVouchers';

export function useDeleteVoucher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => vendorVoucherService.deleteVoucher(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorVoucherKeys.all });
      queryClient.invalidateQueries({ queryKey: activeVendorVoucherKeys.all });
    },
  });
}
