import { type ApiResponse, ApiService } from '@/config/apiClient';
import type {
  AddVendorStaffPayload,
  VendorStaffFilter,
  VendorStaffListResponse,
  VendorStaffMember,
} from '../types';

/**
 * Service gọi API "Vendor Staff" (BE tag `Vendor Staff`).
 *
 *   GET  /vendor-staff/me          — danh sách nhân viên của vendor hiện tại
 *   POST /vendor-staff              — thêm nhân viên
 *   PUT  /vendor-staff/{id}/status  — khóa/mở khóa
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

function mapVendorStaff(dto: VendorStaffResponseDto): VendorStaffMember {
  return {
    id: dto.vendorStaffId,
    shortId: formatShortId(dto.vendorStaffId),
    fullName: dto.user.fullName,
    email: dto.user.email,
    avatarUrl: dto.user.avatarUrl ?? undefined,
    isActive: dto.isActive,
    deactivatedAt: dto.deactivatedAt ?? undefined,
  };
}

export const vendorStaffService = {
  /** Lấy danh sách nhân viên của vendor hiện tại (filter + pagination). */
  async listMyStaff(
    filter: VendorStaffFilter = {},
    page = 1,
    pageSize = 10
  ): Promise<VendorStaffListResponse> {
    const params: Record<string, string> = {
      page: String(page - 1), // BE dùng page 0-based
      size: String(pageSize),
    };
    if (filter.search) {
      params.keyword = filter.search;
    }

    const response = await ApiService<PaginationResponseDto<VendorStaffResponseDto>>(
      '/vendor-staff/me',
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
};
