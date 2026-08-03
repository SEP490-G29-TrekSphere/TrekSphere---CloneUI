import { type ApiResponse, ApiService } from '@/config/apiClient';
import type {
  CreateVoucherRequest,
  PaginationVoucherResponse,
  UpdateVoucherRequest,
  ValidateVoucherRequest,
  VendorActiveVouchersFilter,
  VendorVoucherFilter,
  VoucherResponse,
  VoucherValidationResponse,
} from '../types';

export const vendorVoucherService = {
  /**
   * Lấy danh sách các mã giảm giá (vouchers) của vendor hiện tại.
   * Endpoint: GET /api/v1/vendor/vouchers
   */
  async getVouchers(filter: VendorVoucherFilter): Promise<PaginationVoucherResponse> {
    const params: Record<string, string> = {};

    if (filter.discountType) {
      params.discountType = filter.discountType;
    }
    if (filter.status) {
      params.status = filter.status;
    }
    if (filter.validUntil) {
      params.validUntil = filter.validUntil;
    }
    if (filter.maxUsage !== undefined && filter.maxUsage !== null) {
      params.maxUsage = String(filter.maxUsage);
    }
    if (filter.keyword) {
      params.keyword = filter.keyword;
    }
    if (filter.page !== undefined && filter.page !== null) {
      params.page = String(filter.page);
    }
    if (filter.size !== undefined && filter.size !== null) {
      params.size = String(filter.size);
    }
    if (filter.sortBy) {
      params.sortBy = filter.sortBy;
    }
    if (filter.sortDir) {
      params.sortDir = filter.sortDir;
    }

    const response: ApiResponse<PaginationVoucherResponse> =
      await ApiService<PaginationVoucherResponse>('/vendor/vouchers', 'GET', undefined, params);

    if (response.error) {
      throw new Error(response.error);
    }

    if (!response.data) {
      throw new Error(response.message || 'Không nhận được dữ liệu từ máy chủ');
    }

    return response.data;
  },

  /**
   * Tạo mã giảm giá mới cho vendor hiện tại.
   * Endpoint: POST /api/v1/vendor/vouchers
   */
  async createVoucher(data: CreateVoucherRequest): Promise<VoucherResponse> {
    const response: ApiResponse<VoucherResponse> = await ApiService<VoucherResponse>(
      '/vendor/vouchers',
      'POST',
      data
    );

    if (response.error) {
      throw new Error(response.error);
    }

    if (!response.data) {
      throw new Error(response.message || 'Không thể tạo mã giảm giá');
    }

    return response.data;
  },

  /**
   * Cập nhật thông tin mã giảm giá.
   * Endpoint: PUT /api/v1/vendor/vouchers/{id}
   */
  async updateVoucher(id: string, data: UpdateVoucherRequest): Promise<VoucherResponse> {
    const response: ApiResponse<VoucherResponse> = await ApiService<VoucherResponse>(
      `/vendor/vouchers/${id}`,
      'PUT',
      data
    );

    if (response.error) {
      throw new Error(response.error);
    }

    if (!response.data) {
      throw new Error(response.message || 'Không thể cập nhật mã giảm giá');
    }

    return response.data;
  },

  /**
   * Xóa/Hủy mã giảm giá.
   * Endpoint: DELETE /api/v1/vendor/vouchers/{id}
   */
  async deleteVoucher(id: string): Promise<void> {
    const response: ApiResponse<void> = await ApiService<void>(`/vendor/vouchers/${id}`, 'DELETE');

    if (response.error) {
      throw new Error(response.error);
    }
  },

  /**
   * Lấy danh sách các mã giảm giá đang kích hoạt của Vendor.
   * Endpoint: GET /vouchers/vendor/{vendorId}
   */
  async getActiveVouchersByVendor(
    vendorId: string,
    filter: VendorActiveVouchersFilter
  ): Promise<PaginationVoucherResponse> {
    const params: Record<string, string> = {};

    if (filter.discountType) {
      params.discountType = filter.discountType;
    }
    if (filter.keyword) {
      params.keyword = filter.keyword;
    }
    if (filter.page !== undefined && filter.page !== null) {
      params.page = String(filter.page);
    }
    if (filter.size !== undefined && filter.size !== null) {
      params.size = String(filter.size);
    }
    if (filter.sortBy) {
      params.sortBy = filter.sortBy;
    }
    if (filter.sortDir) {
      params.sortDir = filter.sortDir;
    }

    const response: ApiResponse<PaginationVoucherResponse> =
      await ApiService<PaginationVoucherResponse>(
        `/vouchers/vendor/${vendorId}`,
        'GET',
        undefined,
        params
      );

    if (response.error) {
      throw new Error(response.error);
    }

    if (!response.data) {
      throw new Error(response.message || 'Không nhận được dữ liệu từ máy chủ');
    }

    return response.data;
  },

  /**
   * Kiểm tra tính hợp lệ của mã giảm giá khi Trekker nhập đặt tour.
   * Endpoint: POST /vouchers/validate
   */
  async validateVoucher(data: ValidateVoucherRequest): Promise<VoucherValidationResponse> {
    const response: ApiResponse<VoucherValidationResponse> =
      await ApiService<VoucherValidationResponse>('/vouchers/validate', 'POST', data);

    if (response.error) {
      throw new Error(response.error);
    }

    if (!response.data) {
      throw new Error(response.message || 'Không thể kiểm tra mã giảm giá');
    }

    return response.data;
  },
};
