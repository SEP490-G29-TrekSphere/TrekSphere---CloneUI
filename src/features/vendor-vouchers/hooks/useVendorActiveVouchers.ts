import { useQuery } from '@tanstack/react-query';
import { vendorVoucherService } from '../services/vendorVoucherService';
import type { VendorActiveVouchersFilter } from '../types';

export const activeVendorVoucherKeys = {
  all: ['vendor-active-vouchers'] as const,
  lists: () => [...activeVendorVoucherKeys.all, 'list'] as const,
  list: (vendorId: string, filter: VendorActiveVouchersFilter) =>
    [...activeVendorVoucherKeys.lists(), vendorId, filter] as const,
};

export function useVendorActiveVouchers(vendorId: string, filter: VendorActiveVouchersFilter) {
  return useQuery({
    queryKey: activeVendorVoucherKeys.list(vendorId, filter),
    queryFn: () => vendorVoucherService.getActiveVouchersByVendor(vendorId, filter),
    enabled: !!vendorId,
  });
}
