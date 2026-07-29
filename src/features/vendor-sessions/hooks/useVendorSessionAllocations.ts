import { useQuery } from '@tanstack/react-query';
import { vendorSessionService } from '../services/vendorSessionService';
import { vendorSessionKeys } from './useVendorSessionList';

/** Chi tiết phân bổ nhân sự + thiết bị của 1 phiên tour — nguồn dữ liệu chính của trang Detail. */
export function useVendorSessionAllocations(sessionId: string | undefined) {
  return useQuery({
    queryKey: vendorSessionKeys.allocations(sessionId ?? ''),
    queryFn: () => vendorSessionService.getAllocations(sessionId as string),
    enabled: Boolean(sessionId),
  });
}
