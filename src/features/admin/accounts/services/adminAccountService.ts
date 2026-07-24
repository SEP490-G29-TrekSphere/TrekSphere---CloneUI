import { type ApiResponse, ApiService } from '@/config/apiClient';
import type {
  AccountRole,
  AccountStatus,
  AdminAccount,
  AdminAccountFilter,
  AdminAccountsResponse,
} from '../types';
import type { AccountGender, AdminAccountDetail } from '../types.detail';

/**
 * Service gọi API liên quan tới quản lý tài khoản (khu vực admin).
 *
 * Dùng 3 endpoint thật:
 *   GET  /users            — danh sách tài khoản (lọc, phân trang)
 *   GET  /users/{userId}   — chi tiết 1 tài khoản
 *   PUT  /users/{userId}/status — khóa/mở khóa tài khoản
 */

/** Shape thô mà BE trả về trong `data` cho mỗi user (UserProfileResponse). */
interface UserProfileResponseDto {
  userId: string;
  email: string;
  fullName: string;
  phone?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  avatarUrl?: string | null;
  status: AccountStatus;
  emailVerified: boolean;
  roles: string[];
}

interface PaginationResponseDto<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

function unwrapResponse<T>(response: ApiResponse<T>): T {
  if (response.error) {
    throw new Error(response.error);
  }
  if (response.data === undefined) {
    throw new Error('Không nhận được dữ liệu từ máy chủ');
  }
  return response.data;
}

/** Thứ tự ưu tiên khi 1 user có nhiều role — hiển thị role "cao" nhất. */
const ROLE_PRIORITY: AccountRole[] = ['admin', 'vendor_manager', 'vendor_staff', 'trekker'];

function pickPrimaryRole(roles: string[]): AccountRole {
  const owned = new Set(roles.map((r) => r.toLowerCase()));
  return ROLE_PRIORITY.find((role) => owned.has(role)) ?? 'trekker';
}

function toAccountGender(raw?: string | null): AccountGender | undefined {
  const upper = raw?.toUpperCase();
  if (upper === 'MALE' || upper === 'FEMALE' || upper === 'OTHER') return upper;
  return undefined;
}

function mapAccount(dto: UserProfileResponseDto): AdminAccount {
  return {
    id: dto.userId,
    fullName: dto.fullName,
    email: dto.email,
    avatarUrl: dto.avatarUrl ?? undefined,
    role: pickPrimaryRole(dto.roles ?? []),
    status: dto.status,
  };
}

function mapAccountDetail(dto: UserProfileResponseDto): AdminAccountDetail {
  return {
    ...mapAccount(dto),
    phone: dto.phone ?? undefined,
    gender: toAccountGender(dto.gender),
    dateOfBirth: dto.dateOfBirth ?? undefined,
    emailVerified: dto.emailVerified,
  };
}

export const adminAccountService = {
  /** Lấy danh sách accounts với filter + pagination. */
  async listAccounts(
    filter: AdminAccountFilter = {},
    page = 1,
    pageSize = 10
  ): Promise<AdminAccountsResponse> {
    const params: Record<string, string> = {
      page: String(page - 1), // BE dùng page 0-based
      size: String(pageSize),
    };
    if (filter.role && filter.role !== 'ALL') {
      params.roleName = filter.role.toUpperCase();
    }
    if (filter.search) {
      params.keyword = filter.search;
    }

    const response = await ApiService<PaginationResponseDto<UserProfileResponseDto>>(
      '/users',
      'GET',
      undefined,
      params
    );
    const data = unwrapResponse(response);

    return {
      accounts: data.content.map(mapAccount),
      total: data.totalElements,
      page,
      pageSize,
    };
  },

  /** Lấy chi tiết 1 account theo id. */
  async getAccountDetailById(id: string): Promise<AdminAccountDetail | null> {
    const response = await ApiService<UserProfileResponseDto>(`/users/${id}`, 'GET');
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) return null;
    return mapAccountDetail(response.data);
  },

  /** Khóa/mở khóa tài khoản — `status` là ACTIVE hoặc LOCKED. */
  async updateStatus(id: string, status: 'ACTIVE' | 'LOCKED'): Promise<void> {
    const response = await ApiService<void>(`/users/${id}/status`, 'PUT', undefined, { status });
    if (response.error) {
      throw new Error(response.error);
    }
  },
};
