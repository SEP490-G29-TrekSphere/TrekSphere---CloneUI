import { useQuery } from '@tanstack/react-query';
import { vendorSessionService } from '../services/vendorSessionService';
import type { VendorSessionFilter } from '../types';

export const vendorSessionKeys = {
  all: ['vendor-sessions'] as const,
  list: (filter: VendorSessionFilter, page: number, pageSize: number) =>
    ['vendor-sessions', 'list', filter, page, pageSize] as const,
  allocations: (sessionId: string) => ['vendor-sessions', 'allocations', sessionId] as const,
};

/** Danh sách phiên tour (bảng chính) — phân trang theo filter/page hiện tại. */
export function useVendorSessionList(filter: VendorSessionFilter, page: number, pageSize: number) {
  return useQuery({
    queryKey: vendorSessionKeys.list(filter, page, pageSize),
    queryFn: () => vendorSessionService.listSessions(filter, page, pageSize),
  });
}
