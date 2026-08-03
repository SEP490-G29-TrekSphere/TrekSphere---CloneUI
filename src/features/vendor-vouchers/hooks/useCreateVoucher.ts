import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorVoucherService } from '../services/vendorVoucherService';
import type { CreateVoucherRequest } from '../types';
import { vendorVoucherKeys } from './useVendorVouchers';

export function useCreateVoucher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVoucherRequest) => vendorVoucherService.createVoucher(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorVoucherKeys.all });
    },
  });
}
