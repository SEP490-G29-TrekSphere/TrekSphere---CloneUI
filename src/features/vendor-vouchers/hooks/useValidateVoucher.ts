import { useMutation } from '@tanstack/react-query';
import { vendorVoucherService } from '../services/vendorVoucherService';
import type { ValidateVoucherRequest } from '../types';

export function useValidateVoucher() {
  return useMutation({
    mutationFn: (data: ValidateVoucherRequest) => vendorVoucherService.validateVoucher(data),
  });
}
