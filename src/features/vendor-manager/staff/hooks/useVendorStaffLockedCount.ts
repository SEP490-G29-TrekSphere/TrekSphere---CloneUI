import { useQuery } from '@tanstack/react-query';
import { vendorStaffService } from '../services/vendorStaffService';

/** BE không có endpoint thống kê theo trạng thái — fetch 1 lần với size lớn rồi đếm. */
const LOCKED_COUNT_SAMPLE_SIZE = 1000;

export const vendorStaffLockedCountKeys = {
  all: ['vendor-staff', 'locked-count'] as const,
};

/** Số nhân viên đang bị khóa — dùng cho thẻ thống kê "Đã khóa", độc lập với filter/trang đang xem. */
export function useVendorStaffLockedCount() {
  return useQuery({
    queryKey: vendorStaffLockedCountKeys.all,
    queryFn: async () => {
      const { staff } = await vendorStaffService.listMyStaff({}, 1, LOCKED_COUNT_SAMPLE_SIZE);
      return staff.filter((member) => !member.isActive).length;
    },
    staleTime: 60_000,
  });
}
