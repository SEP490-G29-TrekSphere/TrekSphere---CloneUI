/**
 * Types cho khu vực Admin — Quản lý Nhà cung cấp (Vendor Management).
 */

/** Trạng thái hoạt động của Vendor (mirror enum BE trả về ở `/vendors`). */
export type VendorStatus = 'ACTIVE' | 'INACTIVE' | 'REVOKED';

export interface VendorManager {
  userId: string;
  email: string;
  fullName: string;
  phone: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  avatarUrl?: string;
  status: 'ACTIVE' | 'LOCKED' | 'DEACTIVATED';
  emailVerified: boolean;
  roles: string[];
}

/** Thông tin 1 Vendor hiển thị trong bảng quản lý. */
export interface AdminVendor {
  id: string;
  companyName: string;
  description?: string;
  logoUrl?: string;
  contactEmail: string;
  contactPhone?: string;
  taxCode?: string;
  businessLicenseUrl?: string;
  status: VendorStatus;
  manager?: VendorManager;
}

/** Payload trả về từ API list vendors (pagination). */
export interface AdminVendorsResponse {
  vendors: AdminVendor[];
  total: number;
  page: number;
  pageSize: number;
}

/** Filter cho màn vendor list. */
export interface AdminVendorFilter {
  search?: string;
  status?: VendorStatus | 'ALL';
}

/** Số liệu thống kê tổng quan cho 4 thẻ overview. */
export interface VendorStatsResponse {
  total: number;
  active: number;
  inactive: number;
  revoked: number;
}

/** Labels tiếng Việt cho từng trạng thái. */
export const VENDOR_STATUS_LABELS: Record<VendorStatus, string> = {
  ACTIVE: 'Đang hoạt động',
  INACTIVE: 'Ngừng hoạt động',
  REVOKED: 'Đã thu hồi',
};

/** Options cho dropdown lọc trạng thái. */
export const VENDOR_STATUS_FILTER_OPTIONS: Array<{ value: VendorStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'Tất cả trạng thái' },
  { value: 'ACTIVE', label: 'Đang hoạt động' },
  { value: 'INACTIVE', label: 'Ngừng hoạt động' },
  { value: 'REVOKED', label: 'Đã thu hồi' },
];
