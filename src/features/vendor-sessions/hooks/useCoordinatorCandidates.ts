import { useQuery } from '@tanstack/react-query';
import { vendorStaffService } from '@/features/vendor-manager/staff/services/vendorStaffService';
import type { CoordinatorCandidate } from '../types';

const PAGE_SIZE = 100;

/**
 * Ứng viên Coordinator cho dialog "Chỉ định thêm" — lấy từ
 * `GET /vendor-staff/coordinators`, endpoint riêng của BE chỉ trả về các
 * Coordinator đang hoạt động thuộc vendor hiện tại. Trước đây phải gọi
 * `/vendor-staff/me` rồi tự lọc `roles`/`isActive` ở FE; giờ BE lọc sẵn nên bỏ
 * hết logic đó.
 *
 * Dùng chung cho cả Vendor Manager lẫn Vendor Staff: 2 role gọi đúng cùng 1
 * endpoint.
 *
 * `size=100`: công ty vendor thường không quá 100 điều phối viên; vượt mốc này
 * chỉ hiện 100 người đầu (chấp nhận được cho v1).
 */
export function useCoordinatorCandidates() {
  return useQuery({
    queryKey: ['vendor-sessions', 'coordinator-candidates'],
    queryFn: async (): Promise<CoordinatorCandidate[]> => {
      const { staff } = await vendorStaffService.listCoordinators({}, 1, PAGE_SIZE);
      return staff.map((member) => ({
        userId: member.userId,
        fullName: member.fullName,
        email: member.email,
        avatarUrl: member.avatarUrl,
      }));
    },
    staleTime: 60_000,
  });
}
