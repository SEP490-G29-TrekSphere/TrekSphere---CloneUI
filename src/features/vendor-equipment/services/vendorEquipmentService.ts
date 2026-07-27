import { type ApiResponse, ApiService } from '@/config/apiClient';
import type {
  CreateVendorEquipmentPayload,
  UpdateVendorEquipmentPayload,
  VendorEquipmentFilter,
  VendorEquipmentItem,
  VendorEquipmentListResponse,
} from '../types';

/**
 * Service gọi API "Vendor Equipment" (BE controller `vendor-equipment-controller`).
 *
 *   GET    /vendor/equipments      — danh sách dụng cụ/thiết bị trong kho, phân trang + tìm kiếm.
 *   GET    /vendor/equipments/list — toàn bộ dụng cụ, không phân trang — dùng để tính số liệu tổng hợp
 *                                    (tổng số lượng tồn kho) cho thẻ thống kê, không phải để hiển thị bảng.
 *   POST   /vendor/equipments      — thêm dụng cụ mới vào kho.
 *   PUT    /vendor/equipments/{id} — sửa thông tin dụng cụ (tên, mô tả, số lượng).
 *   DELETE /vendor/equipments/{id} — xóa dụng cụ khỏi kho (chỉ Vendor Manager — gate ở UI).
 */

interface VendorEquipmentDto {
  equipmentId: string;
  vendorId: string;
  equipmentName: string;
  description?: string;
  totalQuantity: number;
  createdAt: string;
  updatedAt: string;
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

function mapVendorEquipment(dto: VendorEquipmentDto): VendorEquipmentItem {
  return {
    id: dto.equipmentId,
    name: dto.equipmentName,
    description: dto.description ?? undefined,
    totalQuantity: dto.totalQuantity,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

export const vendorEquipmentService = {
  /** Lấy danh sách dụng cụ trong kho của vendor hiện tại (filter + pagination). */
  async listEquipments(
    filter: VendorEquipmentFilter = {},
    page = 1,
    pageSize = 10
  ): Promise<VendorEquipmentListResponse> {
    const params: Record<string, string> = {
      page: String(page - 1), // BE dùng page 0-based
      size: String(pageSize),
    };
    if (filter.search) {
      params.keyword = filter.search;
    }

    const response = await ApiService<PaginationResponseDto<VendorEquipmentDto>>(
      '/vendor/equipments',
      'GET',
      undefined,
      params
    );
    const data = unwrapResponse(response);

    return {
      equipments: data.content.map(mapVendorEquipment),
      total: data.totalElements,
      page,
      pageSize,
    };
  },

  /** Toàn bộ dụng cụ, không phân trang — dùng để tính số liệu tổng hợp (KHÔNG dùng để hiển thị bảng). */
  async listAllEquipments(filter: VendorEquipmentFilter = {}): Promise<VendorEquipmentItem[]> {
    const params: Record<string, string> = {};
    if (filter.search) {
      params.keyword = filter.search;
    }

    const response = await ApiService<VendorEquipmentDto[]>(
      '/vendor/equipments/list',
      'GET',
      undefined,
      params
    );
    return unwrapResponse(response).map(mapVendorEquipment);
  },

  /** Thêm dụng cụ mới vào kho. */
  async createEquipment(payload: CreateVendorEquipmentPayload): Promise<VendorEquipmentItem> {
    const response = await ApiService<VendorEquipmentDto>('/vendor/equipments', 'POST', payload);
    return mapVendorEquipment(unwrapResponse(response));
  },

  /** Sửa thông tin dụng cụ đã tồn tại — gửi nguyên payload hiện tại của form (không diff field). */
  async updateEquipment(
    id: string,
    payload: UpdateVendorEquipmentPayload
  ): Promise<VendorEquipmentItem> {
    const response = await ApiService<VendorEquipmentDto>(
      `/vendor/equipments/${id}`,
      'PUT',
      payload
    );
    return mapVendorEquipment(unwrapResponse(response));
  },

  /** Xóa dụng cụ khỏi kho. */
  async deleteEquipment(id: string): Promise<void> {
    const response = await ApiService<void>(`/vendor/equipments/${id}`, 'DELETE');
    if (response.error) {
      throw new Error(response.error);
    }
  },
};
