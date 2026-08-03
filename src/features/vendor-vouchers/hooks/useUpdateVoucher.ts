import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorVoucherService } from '../services/vendorVoucherService';
import type { UpdateVoucherRequest } from '../types';
import { vendorVoucherKeys } from './useVendorVouchers';

export function useUpdateVoucher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVoucherRequest }) =>
      vendorVoucherService.updateVoucher(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorVoucherKeys.all });
    },
  });
}
