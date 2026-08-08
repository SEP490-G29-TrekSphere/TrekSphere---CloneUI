// src/features/vendor-manager/staff/types.ts
/**
 * Types cho khu vực Vendor Manager — Danh sách Nhân viên.
 * Mirror `VendorStaffResponse` từ BE (tag "Vendor Staff").
 */

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
   * `TREKKER`...). Dùng để lọc ứng viên theo vai trò (vd chỉ lấy `COORDINATOR`
   * cho dialog phân công dẫn đoàn) — `GET /vendor-staff/me` không có query
   * param lọc theo role nên phải lọc phía FE.
   */
  roles: string[];
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
}
