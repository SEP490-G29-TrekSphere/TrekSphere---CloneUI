/**
 * Types cho khu vực Admin — Quản lý tài khoản.
 */

/** Trạng thái tài khoản trong hệ thống. */
export type AccountStatus = 'ACTIVE' | 'LOCKED';

/** Loại tài khoản (mirror các role trong `@/constants/roles`). */
export type AccountRole = 'trekker' | 'vendor_staff' | 'vendor_manager' | 'admin';

/** Thông tin 1 tài khoản hiển thị trong bảng quản lý. */
export interface AdminAccount {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  role: AccountRole;
  status: AccountStatus;
  createdAt: string;
}

/** Payload trả về từ API list accounts (pagination). */
export interface AdminAccountsResponse {
  accounts: AdminAccount[];
  total: number;
  page: number;
  pageSize: number;
}

/** Filter cho màn account list. */
export interface AdminAccountFilter {
  role?: AccountRole | 'ALL';
  search?: string;
}

/** Labels tiếng Việt cho các role, dùng để hiển thị badge. */
export const ACCOUNT_ROLE_LABELS: Record<AccountRole, string> = {
  trekker: 'Trekker',
  vendor_staff: 'Vendor Staff',
  vendor_manager: 'Vendor Manager',
  admin: 'Admin',
};

/** Labels cho filter "Lọc theo loại tài khoản". */
export const ACCOUNT_FILTER_OPTIONS = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'trekker', label: 'Trekker' },
  { value: 'vendor_staff', label: 'Vendor Staff' },
  { value: 'vendor_manager', label: 'Vendor Manager' },
  { value: 'admin', label: 'Admin' },
] as const;
