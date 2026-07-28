import { type ApiResponse, ApiService } from '@/config/apiClient';
import type {
  CreateVendorPorterPayload,
  PorterGender,
  PorterStatus,
  UpdateVendorPorterPayload,
  VendorPorterFilter,
  VendorPorterItem,
  VendorPorterListResponse,
} from '../types';

/**
 * Service gọi API "Vendor Porter Profiles".
 *
 *   GET    /vendor/porters      — danh sách hồ sơ porter, phân trang + tìm kiếm.
 *   GET    /vendor/porters/list — toàn bộ hồ sơ porter, không phân trang — dùng để tính
 *                                  số liệu tổng hợp cho thẻ thống kê, không phải để hiển thị bảng.
 *   POST   /vendor/porters      — tạo hồ sơ porter mới (multipart/form-data).
 *   PUT    /vendor/porters/{id} — sửa hồ sơ porter (multipart/form-data).
 *   DELETE /vendor/porters/{id} — xóa mềm hồ sơ porter (chỉ Vendor Manager — gate ở UI).
 *
 *   Không có GET /vendor/porters/{id} đơn lẻ — trang Sửa phải nhận dữ liệu porter
 *   qua router state khi điều hướng từ danh sách (xem `PorterEdit.tsx`).
 */

interface PorterProfileDto {
  porterId: string;
  fullName: string;
  phone: string;
  gender?: PorterGender;
  dateOfBirth?: string;
  address?: string;
  avatarUrl?: string;
  joinedDate?: string;
  status: PorterStatus;
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

/** 8 ký tự đầu của id (bỏ dấu gạch ngang), viết hoa — BE không có mã porter tuần tự. */
export function formatShortId(id: string): string {
  return id.replace(/-/g, '').slice(0, 8).toUpperCase();
}

function mapPorterProfile(dto: PorterProfileDto): VendorPorterItem {
  return {
    id: dto.porterId,
    shortId: formatShortId(dto.porterId),
    fullName: dto.fullName,
    phone: dto.phone,
    gender: dto.gender,
    dateOfBirth: dto.dateOfBirth,
    address: dto.address,
    avatarUrl: dto.avatarUrl ?? undefined,
    joinedDate: dto.joinedDate,
    status: dto.status,
  };
}

/** Build FormData cho POST/PUT — cả 2 API đều nhận multipart/form-data. */
function buildPorterFormData(
  payload: CreateVendorPorterPayload | UpdateVendorPorterPayload
): FormData {
  const formData = new FormData();
  formData.append('fullName', payload.fullName);
  formData.append('phone', payload.phone);

  if ('status' in payload && payload.status) {
    formData.append('status', payload.status);
  }

  if (payload.avatarFile) {
    formData.append('avatarFile', payload.avatarFile);
  } else if ('avatarUrl' in payload && payload.avatarUrl) {
    formData.append('avatarUrl', payload.avatarUrl);
  }

  return formData;
}

export const vendorPorterService = {
  /** Lấy danh sách hồ sơ porter của vendor hiện tại (filter + pagination). */
  async listPorters(
    filter: VendorPorterFilter = {},
    page = 1,
    pageSize = 10
  ): Promise<VendorPorterListResponse> {
    const params: Record<string, string> = {
      page: String(page - 1), // BE dùng page 0-based
      size: String(pageSize),
    };
    if (filter.search) {
      params.keyword = filter.search;
    }

    const response = await ApiService<PaginationResponseDto<PorterProfileDto>>(
      '/vendor/porters',
      'GET',
      undefined,
      params
    );
    const data = unwrapResponse(response);

    return {
      porters: data.content.map(mapPorterProfile),
      total: data.totalElements,
      page,
      pageSize,
    };
  },

  /** Toàn bộ hồ sơ porter, không phân trang — dùng để tính số liệu tổng hợp (KHÔNG dùng để hiển thị bảng). */
  async listAllPorters(filter: VendorPorterFilter = {}): Promise<VendorPorterItem[]> {
    const params: Record<string, string> = {};
    if (filter.search) {
      params.keyword = filter.search;
    }

    const response = await ApiService<PorterProfileDto[]>(
      '/vendor/porters/list',
      'GET',
      undefined,
      params
    );
    return unwrapResponse(response).map(mapPorterProfile);
  },

  /** Tạo hồ sơ porter mới. */
  async createPorter(payload: CreateVendorPorterPayload): Promise<VendorPorterItem> {
    const response = await ApiService<PorterProfileDto>(
      '/vendor/porters',
      'POST',
      buildPorterFormData(payload)
    );
    return mapPorterProfile(unwrapResponse(response));
  },

  /** Sửa hồ sơ porter đã tồn tại. */
  async updatePorter(id: string, payload: UpdateVendorPorterPayload): Promise<VendorPorterItem> {
    const response = await ApiService<PorterProfileDto>(
      `/vendor/porters/${id}`,
      'PUT',
      buildPorterFormData(payload)
    );
    return mapPorterProfile(unwrapResponse(response));
  },

  /** Xóa mềm hồ sơ porter. */
  async deletePorter(id: string): Promise<void> {
    const response = await ApiService<void>(`/vendor/porters/${id}`, 'DELETE');
    if (response.error) {
      throw new Error(response.error);
    }
  },
};
