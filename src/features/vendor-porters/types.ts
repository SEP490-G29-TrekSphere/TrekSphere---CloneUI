// src/features/vendor-porters/types.ts
/**
 * Types cho khu vực quản lý Hồ sơ Porter — dùng chung cho Vendor Manager và
 * Vendor Staff. BE (`Vendor Porter Profiles`) dùng chung 1 bộ endpoint cho cả
 * 2 role, chỉ khác UI/route (giống pattern vendor-equipment).
 *
 * Lưu ý: `PorterProfileDto`/`PorterProfileRequest` của BE KHÔNG có field cho
 * CCCD, khu vực hoạt động, kinh nghiệm, "có tài khoản hệ thống" — các field
 * này bị lược khỏi UI vì không có nơi lưu.
 */

export type PorterGender = 'MALE' | 'FEMALE' | 'OTHER';
export type PorterStatus = 'ACTIVE' | 'INACTIVE';

export interface VendorPorterItem {
  id: string;
  /** 8 ký tự đầu của `id` (bỏ dấu gạch ngang), viết hoa — BE không có mã porter tuần tự. */
  shortId: string;
  fullName: string;
  phone: string;
  gender?: PorterGender;
  dateOfBirth?: string;
  address?: string;
  avatarUrl?: string;
  joinedDate?: string;
  status: PorterStatus;
}

/** `GET /vendor/porters` chỉ hỗ trợ lọc theo `keyword` phía server (chưa dùng filter status trên UI). */
export interface VendorPorterFilter {
  search?: string;
}

export interface VendorPorterListResponse {
  porters: VendorPorterItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateVendorPorterPayload {
  fullName: string;
  phone: string;
  avatarFile?: File;
}

/** `PUT /vendor/porters/{id}` — gửi `avatarFile` khi đổi ảnh mới, ngược lại giữ `avatarUrl` cũ. */
export interface UpdateVendorPorterPayload {
  fullName: string;
  phone: string;
  status: PorterStatus;
  avatarFile?: File;
  avatarUrl?: string;
}
