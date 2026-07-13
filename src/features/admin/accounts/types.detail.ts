/**
 * Types cho khu vực Admin — Chi tiết tài khoản.
 */

import type { AccountRole, AccountStatus } from './types';

/**
 * Thông tin chi tiết 1 tài khoản (dùng cho trang detail).
 * Mở rộng từ AdminAccount với các trường bổ sung.
 */
export interface AdminAccountDetail extends Record<string, unknown> {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role: AccountRole;
  status: AccountStatus;
  address?: string;
  createdAt: string;

  // Thống kê
  toursJoined: number;
  toursJoinedGrowth: number;
  totalSpent: number;
  averageRating: number;
  reviewCount: number;

  // Vị trí
  lastLocation?: {
    lat: number;
    lng: number;
    label: string;
  };
}

/** Labels tiếng Việt cho trạng thái. */
export const ACCOUNT_STATUS_LABELS: Record<AccountStatus, string> = {
  ACTIVE: 'Đang hoạt động',
  LOCKED: 'Bị khóa',
};
