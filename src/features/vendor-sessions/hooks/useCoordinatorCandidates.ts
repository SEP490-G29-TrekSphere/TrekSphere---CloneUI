import { useQuery } from '@tanstack/react-query';
import { vendorStaffService } from '@/features/vendor-manager/staff/services/vendorStaffService';
import type { CoordinatorCandidate } from '../types';

const PAGE_SIZE = 100;

/** Role BE gán cho nhân viên được phép dẫn đoàn (`UserResponse.roles`, uppercase). */
const COORDINATOR_ROLE = 'COORDINATOR';

/**
 * Ứng viên Coordinator cho dialog "Chỉ định thêm" — BE không có API "danh sách
 * coordinator" riêng, nên lấy từ Staff Directory (`GET /vendor-staff/me`).
 *
 * Dùng chung cho cả Vendor Manager lẫn Vendor Staff: 2 role gọi đúng cùng 1
 * endpoint, cùng cách lọc.
 *
 * Lọc 2 tầng, đều ở FE vì `/vendor-staff/me` không hỗ trợ query param nào theo
 * role/trạng thái:
 *   1. `isActive` — bỏ nhân viên đã bị khóa.
 *   2. `roles` chứa `COORDINATOR` — chỉ nhân viên giữ vai trò điều phối viên
 *      mới được phân công dẫn đoàn; VENDOR_STAFF/TREKKER thuần không hiện.
 *
 * `size=100`: công ty vendor thường không quá 100 nhân viên; vượt mốc này chỉ
 * hiện 100 người đầu (chấp nhận được cho v1).
 */
export function useCoordinatorCandidates() {
  return useQuery({
    queryKey: ['vendor-sessions', 'coordinator-candidates'],
    queryFn: async (): Promise<CoordinatorCandidate[]> => {
      const { staff } = await vendorStaffService.listMyStaff({}, 1, PAGE_SIZE);
      return staff
        .filter(
          (member) =>
            member.isActive && member.roles.some((role) => role.toUpperCase() === COORDINATOR_ROLE)
        )
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
