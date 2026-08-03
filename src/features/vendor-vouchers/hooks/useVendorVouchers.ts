import { useQuery } from '@tanstack/react-query';
import { vendorVoucherService } from '../services/vendorVoucherService';
import type { VendorVoucherFilter } from '../types';

export const vendorVoucherKeys = {
  all: ['vendor-vouchers'] as const,
  lists: () => [...vendorVoucherKeys.all, 'list'] as const,
  list: (filter: VendorVoucherFilter) => [...vendorVoucherKeys.lists(), filter] as const,
};

export function useVendorVouchers(filter: VendorVoucherFilter) {
  return useQuery({
    queryKey: vendorVoucherKeys.list(filter),
    queryFn: () => vendorVoucherService.getVouchers(filter),
  });
}
