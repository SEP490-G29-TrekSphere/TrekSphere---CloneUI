/**
 * Types cho khu vực Vendor Profile — dùng chung Vendor Manager & Vendor Staff.
 */

export type VendorProfileStatus = 'ACTIVE' | 'INACTIVE' | 'REVOKED';

/** Hồ sơ Vendor đầy đủ, mirror `VendorProfileResponse` từ BE (`GET /vendors/profile`). */
export interface VendorProfileDetail {
  vendorId: string;
  companyName: string;
  description?: string;
  logoUrl?: string;
  contactEmail: string;
  contactPhone?: string;
  taxCode?: string;
  businessLicenseUrl?: string;
  status: VendorProfileStatus;
}

export interface UpdateVendorProfilePayload {
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
}

/** Labels tiếng Việt cho trạng thái Vendor. */
export const VENDOR_PROFILE_STATUS_LABELS: Record<VendorProfileStatus, string> = {
  ACTIVE: 'Đang hoạt động',
  INACTIVE: 'Ngừng hoạt động',
  REVOKED: 'Đã thu hồi',
};
