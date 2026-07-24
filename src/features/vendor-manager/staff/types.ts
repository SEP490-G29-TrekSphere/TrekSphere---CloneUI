// src/features/vendor-manager/staff/types.ts
/**
 * Types cho khu vực Vendor Manager — Danh sách Nhân viên.
 * Mirror `VendorStaffResponse` từ BE (tag "Vendor Staff").
 */

export interface VendorStaffMember {
  id: string;
  /** 8 ký tự đầu của `id`, viết hoa — dùng hiển thị "ID: XXXXXXXX" (BE không có mã tuần tự). */
  shortId: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
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

/** Context truyền từ `VendorManagerLayout` xuống các trang con qua `<Outlet />`. */
export interface VendorManagerLayoutContext {
  searchValue: string;
}
