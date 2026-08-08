import { type ApiResponse, ApiService } from '@/config/apiClient';
import type {
  AddVendorStaffPayload,
  VendorStaffFilter,
  VendorStaffListResponse,
  VendorStaffMember,
  VendorStaffRole,
} from '../types';

/**
 * Service gọi API "Vendor Staff" (BE tag `Vendor Staff`).
 *
 *   GET   /vendor-staff/me            — danh sách nhân viên của vendor hiện tại
 *   GET   /vendor-staff/coordinators  — chỉ các Coordinator đang hoạt động
 *   POST  /vendor-staff               — thêm nhân viên (kèm `role` tuỳ chọn)
 *   PUT   /vendor-staff/{id}/status   — khóa/mở khóa
 *   PATCH /vendor-staff/{id}/role     — chuyển vai trò VENDOR_STAFF ⇄ COORDINATOR
 */

interface VendorStaffUserDto {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  roles: string[];
}

interface VendorStaffResponseDto {
  vendorStaffId: string;
  vendorId: string;
  user: VendorStaffUserDto;
  isActive: boolean;
  deactivatedAt?: string;
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

/** 8 ký tự đầu của id (bỏ dấu gạch ngang), viết hoa — BE không có mã nhân viên tuần tự. */
export function formatShortId(id: string): string {
  return id.replace(/-/g, '').slice(0, 8).toUpperCase();
}

/** Vai trò nghiệp vụ suy ra từ `user.roles` — BE trả cả role hệ thống nên chỉ cần biết có COORDINATOR hay không. */
function resolveRole(roles: string[]): VendorStaffRole {
  return roles.some((role) => role.toUpperCase() === 'COORDINATOR')
    ? 'COORDINATOR'
    : 'VENDOR_STAFF';
}

function mapVendorStaff(dto: VendorStaffResponseDto): VendorStaffMember {
  const roles = dto.user.roles ?? [];

  return {
    id: dto.vendorStaffId,
    shortId: formatShortId(dto.vendorStaffId),
    userId: dto.user.id,
    fullName: dto.user.fullName,
    email: dto.user.email,
    avatarUrl: dto.user.avatarUrl ?? undefined,
    roles,
    role: resolveRole(roles),
    isActive: dto.isActive,
    deactivatedAt: dto.deactivatedAt ?? undefined,
  };
}

/** `/vendor-staff/me` và `/vendor-staff/coordinators` cùng shape response + query param. */
async function fetchStaffPage(
  path: string,
  filter: VendorStaffFilter,
  page: number,
  pageSize: number
): Promise<VendorStaffListResponse> {
  const params: Record<string, string> = {
    page: String(page - 1), // BE dùng page 0-based
    size: String(pageSize),
  };
  if (filter.search) {
    params.keyword = filter.search;
  }

  const response = await ApiService<PaginationResponseDto<VendorStaffResponseDto>>(
    path,
    'GET',
    undefined,
    params
  );
  const data = unwrapResponse(response);

  return {
    staff: data.content.map(mapVendorStaff),
    total: data.totalElements,
    page,
    pageSize,
  };
}

export const vendorStaffService = {
  /** Lấy danh sách nhân viên của vendor hiện tại (filter + pagination). */
  listMyStaff(
    filter: VendorStaffFilter = {},
    page = 1,
    pageSize = 10
  ): Promise<VendorStaffListResponse> {
    return fetchStaffPage('/vendor-staff/me', filter, page, pageSize);
  },

  /**
   * Danh sách Coordinator đang hoạt động của vendor — BE đã lọc sẵn theo role
   * và trạng thái, gọi được bởi cả Vendor Manager và Vendor Staff.
   */
  listCoordinators(
    filter: VendorStaffFilter = {},
    page = 1,
    pageSize = 10
  ): Promise<VendorStaffListResponse> {
    return fetchStaffPage('/vendor-staff/coordinators', filter, page, pageSize);
  },

  /** Thêm nhân viên mới — BE tự gán user có sẵn hoặc tạo mới + gửi email kích hoạt. */
  async addStaff(payload: AddVendorStaffPayload): Promise<VendorStaffMember> {
    const response = await ApiService<VendorStaffResponseDto>('/vendor-staff', 'POST', payload);
    return mapVendorStaff(unwrapResponse(response));
  },

  /** Khóa/mở khóa nhân viên. */
  async updateStatus(staffId: string, isActive: boolean): Promise<VendorStaffMember> {
    const response = await ApiService<VendorStaffResponseDto>(
      `/vendor-staff/${staffId}/status`,
      'PUT',
      { isActive }
    );
    return mapVendorStaff(unwrapResponse(response));
  },

  /** Chuyển vai trò nghiệp vụ giữa VENDOR_STAFF và COORDINATOR. */
  async updateRole(staffId: string, role: VendorStaffRole): Promise<VendorStaffMember> {
    const response = await ApiService<VendorStaffResponseDto>(
      `/vendor-staff/${staffId}/role`,
      'PATCH',
      { role }
    );
    return mapVendorStaff(unwrapResponse(response));
  },
};
