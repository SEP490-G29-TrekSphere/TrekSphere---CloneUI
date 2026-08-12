import { type ApiResponse, ApiService } from '@/config/apiClient';
import type {
  AdminVendor,
  AdminVendorFilter,
  AdminVendorsResponse,
  VendorStatsResponse,
  VendorStatus,
} from '../types';

/**
 * Service gọi API liên quan tới quản lý Vendor (khu vực admin).
 *
 * Dùng 2 endpoint thật:
 *   GET /vendors               — danh sách Vendor (lọc theo keyword, phân trang)
 *   PUT /vendors/{vendorId}/status — đổi trạng thái ACTIVE/INACTIVE/REVOKED
 *
 * Lưu ý: `GET /vendors` theo OpenAPI hiện tại chỉ nhận `BaseFilterRequest`
 * (keyword/page/size/sortBy/sortDir) — KHÔNG có tham số lọc theo status.
 * FE vẫn gửi kèm `status` vào query (best-effort) để sẵn sàng khi BE bổ
 * sung hỗ trợ; nếu BE chưa nhận diện param này, filter/thống kê theo
 * status có thể chưa chính xác.
 */

/** Shape thô mà BE trả về trong `data` cho mỗi vendor (VendorResponse). */
interface VendorResponseDto {
  vendorId: string;
  companyName: string;
  description?: string | null;
  logoUrl?: string | null;
  contactEmail: string;
  contactPhone?: string | null;
  taxCode?: string | null;
  businessLicenseUrl?: string | null;
  status: VendorStatus;
  manager?: {
    userId: string;
    email: string;
    fullName: string;
    phone: string;
    dateOfBirth?: string | null;
    gender?: 'MALE' | 'FEMALE' | 'OTHER' | null;
    avatarUrl?: string | null;
    status: 'ACTIVE' | 'LOCKED' | 'DEACTIVATED';
    emailVerified: boolean;
    roles: string[];
  } | null;
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

function mapVendor(dto: VendorResponseDto): AdminVendor {
  return {
    id: dto.vendorId,
    companyName: dto.companyName,
    description: dto.description ?? undefined,
    logoUrl: dto.logoUrl ?? undefined,
    contactEmail: dto.contactEmail,
    contactPhone: dto.contactPhone ?? undefined,
    taxCode: dto.taxCode ?? undefined,
    businessLicenseUrl: dto.businessLicenseUrl ?? undefined,
    status: dto.status,
    manager: dto.manager
      ? {
          userId: dto.manager.userId,
          email: dto.manager.email,
          fullName: dto.manager.fullName,
          phone: dto.manager.phone,
          dateOfBirth: dto.manager.dateOfBirth ?? undefined,
          gender: dto.manager.gender ?? undefined,
          avatarUrl: dto.manager.avatarUrl ?? undefined,
          status: dto.manager.status,
          emailVerified: dto.manager.emailVerified,
          roles: dto.manager.roles,
        }
      : undefined,
  };
}

function buildListParams(filter: AdminVendorFilter, page: number, pageSize: number) {
  const params: Record<string, string> = {
    page: String(page - 1), // BE dùng page 0-based
    size: String(pageSize),
  };
  if (filter.search) {
    params.keyword = filter.search;
  }
  if (filter.status && filter.status !== 'ALL') {
    params.status = filter.status;
  }
  return params;
}

export const adminVendorService = {
  /** Lấy danh sách vendors với filter + pagination. */
  async listVendors(
    filter: AdminVendorFilter = {},
    page = 1,
    pageSize = 10
  ): Promise<AdminVendorsResponse> {
    const params = buildListParams(filter, page, pageSize);

    const response = await ApiService<PaginationResponseDto<VendorResponseDto>>(
      '/vendors',
      'GET',
      undefined,
      params
    );
    const data = unwrapResponse(response);

    return {
      vendors: data.content.map(mapVendor),
      total: data.totalElements,
      page,
      pageSize,
    };
  },

  /**
   * Tính số liệu thống kê tổng quan (Total/Active/Inactive/Revoked) bằng
   * cách gọi song song `GET /vendors?size=1` với từng bộ lọc status, đọc
   * `totalElements` — cùng pattern với `vendorBookingService.getStats()`.
   */
  async getStats(): Promise<VendorStatsResponse> {
    const [totalRes, activeRes, inactiveRes, revokedRes] = await Promise.all([
      ApiService<PaginationResponseDto<VendorResponseDto>>('/vendors', 'GET', undefined, {
        page: '0',
        size: '1',
      }),
      ApiService<PaginationResponseDto<VendorResponseDto>>('/vendors', 'GET', undefined, {
        page: '0',
        size: '1',
        status: 'ACTIVE',
      }),
      ApiService<PaginationResponseDto<VendorResponseDto>>('/vendors', 'GET', undefined, {
        page: '0',
        size: '1',
        status: 'INACTIVE',
      }),
      ApiService<PaginationResponseDto<VendorResponseDto>>('/vendors', 'GET', undefined, {
        page: '0',
        size: '1',
        status: 'REVOKED',
      }),
    ]);

    return {
      total: unwrapResponse(totalRes).totalElements ?? 0,
      active: unwrapResponse(activeRes).totalElements ?? 0,
      inactive: unwrapResponse(inactiveRes).totalElements ?? 0,
      revoked: unwrapResponse(revokedRes).totalElements ?? 0,
    };
  },

  /** Đổi trạng thái Vendor — ACTIVE, INACTIVE hoặc REVOKED. */
  async updateStatus(vendorId: string, status: VendorStatus): Promise<AdminVendor> {
    const response = await ApiService<VendorResponseDto>(`/vendors/${vendorId}/status`, 'PUT', {
      status,
    });
    return mapVendor(unwrapResponse(response));
  },
};
