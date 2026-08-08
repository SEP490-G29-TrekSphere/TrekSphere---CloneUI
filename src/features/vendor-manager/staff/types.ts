// src/features/vendor-manager/staff/types.ts
/**
 * Types cho khu vực Vendor Manager — Danh sách Nhân viên.
 * Mirror `VendorStaffResponse` từ BE (tag "Vendor Staff").
 */

/**
 * Vai trò nghiệp vụ của nhân viên trong vendor — enum BE dùng cho cả
 * `POST /vendor-staff` (`role`) và `PATCH /vendor-staff/{id}/role`.
 */
export type VendorStaffRole = 'VENDOR_STAFF' | 'COORDINATOR';

export const VENDOR_STAFF_ROLES: VendorStaffRole[] = ['VENDOR_STAFF', 'COORDINATOR'];

export const VENDOR_STAFF_ROLE_LABELS: Record<VendorStaffRole, string> = {
  VENDOR_STAFF: 'Nhân viên',
  COORDINATOR: 'Điều phối viên',
};

export interface VendorStaffMember {
  id: string;
  /** 8 ký tự đầu của `id`, viết hoa — dùng hiển thị "ID: XXXXXXXX" (BE không có mã tuần tự). */
  shortId: string;
  /** User id thật của nhân viên (khác `id`/`vendorStaffId`) — cần cho các API nhận `coordinatorId` (vd Vendor Logistics). */
  userId: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  /**
   * Roles của user, uppercase như BE trả (`VENDOR_STAFF`, `COORDINATOR`,
   * `TREKKER`...). BE trả cả role hệ thống lẫn role nghiệp vụ nên giữ nguyên
   * mảng gốc; muốn biết vai trò nghiệp vụ hiện tại thì dùng `role`.
   */
  roles: string[];
  /** Vai trò nghiệp vụ suy ra từ `roles` — có `COORDINATOR` thì là điều phối viên, còn lại là nhân viên. */
  role: VendorStaffRole;
  isActive: boolean;
  deactivatedAt?: string;
}

export interface VendorStaffFilter {
  search?: string;
}

export interface VendorStaffListResponse {
  staff: VendorStaffMember[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AddVendorStaffPayload {
  email: string;
  fullName?: string;
  /** Không truyền thì BE mặc định gán `VENDOR_STAFF`. */
  role?: VendorStaffRole;
}
