import { useQuery } from '@tanstack/react-query';
import { vendorStaffService } from '@/features/vendor-manager/staff/services/vendorStaffService';
import type { CoordinatorCandidate } from '../types';

const PAGE_SIZE = 100;

/**
 * Ứng viên Coordinator cho dialog "Chỉ định thêm" — BE không có API "danh sách
 * coordinator" riêng, nên lấy từ Staff Directory (`GET /vendor-staff/me`) và
 * chỉ giữ nhân viên đang active. `size=100`: công ty vendor thường không quá
 * 100 nhân viên; vượt mốc này chỉ hiện 100 người đầu (chấp nhận được cho v1).
 */
export function useCoordinatorCandidates() {
  return useQuery({
    queryKey: ['vendor-sessions', 'coordinator-candidates'],
    queryFn: async (): Promise<CoordinatorCandidate[]> => {
      const { staff } = await vendorStaffService.listMyStaff({}, 1, PAGE_SIZE);
      return staff
        .filter((member) => member.isActive)
        .map((member) => ({
          userId: member.userId,
          fullName: member.fullName,
          email: member.email,
          avatarUrl: member.avatarUrl,
        }));
    },
    staleTime: 60_000,
  });
}
