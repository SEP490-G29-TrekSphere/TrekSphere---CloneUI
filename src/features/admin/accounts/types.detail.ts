/**
 * Types cho khu vực Admin — Chi tiết tài khoản.
 */

import type { AccountRole, AccountStatus } from './types';

/** Giới tính (mirror enum BE: MALE/FEMALE/OTHER). */
export type AccountGender = 'MALE' | 'FEMALE' | 'OTHER';

/**
 * Thông tin chi tiết 1 tài khoản (dùng cho trang detail).
 * Mở rộng từ AdminAccount với các trường bổ sung — chỉ gồm những trường
 * thật sự có trong `UserProfileResponse` của BE (`GET /users/{userId}`).
 */
export interface AdminAccountDetail extends Record<string, unknown> {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role: AccountRole;
  status: AccountStatus;
  gender?: AccountGender;
  dateOfBirth?: string;
  emailVerified: boolean;
}

/** Labels tiếng Việt cho trạng thái. */
export const ACCOUNT_STATUS_LABELS: Record<AccountStatus, string> = {
  ACTIVE: 'Đang hoạt động',
  LOCKED: 'Bị khóa',
  DEACTIVATED: 'Đã vô hiệu hóa',
};

/** Labels tiếng Việt cho giới tính. */
export const ACCOUNT_GENDER_LABELS: Record<AccountGender, string> = {
  MALE: 'Nam',
  FEMALE: 'Nữ',
  OTHER: 'Khác',
};
