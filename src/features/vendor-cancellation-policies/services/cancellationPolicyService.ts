import { type ApiResponse, ApiService } from '@/config/apiClient';
import type { CancellationPolicy, CancellationPolicyPayload } from '../types';

/**
 * Service gọi API "Vendor Cancellation Policy Management".
 *
 *   GET    /vendor/cancellation-policies       — danh sách chính sách của vendor hiện tại
 *   POST   /vendor/cancellation-policies       — tạo mới (Vendor Manager)
 *   PUT    /vendor/cancellation-policies/{id}  — cập nhật (Vendor Manager)
 *   DELETE /vendor/cancellation-policies/{id}  — xóa (Vendor Manager)
 *
 * Vendor Staff chỉ được gọi endpoint GET — UI ẩn các thao tác còn lại.
 */

interface CancellationPolicyResponseDto {
  cancellationPolicyId: string;
  cancelBeforeDays: number;
  refundPercentage: number;
  description?: string | null;
  isActive: boolean;
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

function mapPolicy(dto: CancellationPolicyResponseDto): CancellationPolicy {
  return {
    cancellationPolicyId: dto.cancellationPolicyId,
    cancelBeforeDays: dto.cancelBeforeDays,
    refundPercentage: dto.refundPercentage,
    description: dto.description ?? undefined,
    isActive: dto.isActive,
  };
}

export const cancellationPolicyService = {
  /** Toàn bộ chính sách hủy của vendor hiện tại (không phân trang). */
  async list(): Promise<CancellationPolicy[]> {
    const response = await ApiService<CancellationPolicyResponseDto[]>(
      '/vendor/cancellation-policies',
      'GET'
    );
    return (unwrapResponse(response) ?? []).map(mapPolicy);
  },

  async create(payload: CancellationPolicyPayload): Promise<CancellationPolicy> {
    const response = await ApiService<CancellationPolicyResponseDto>(
      '/vendor/cancellation-policies',
      'POST',
      payload
    );
    return mapPolicy(unwrapResponse(response));
  },

  async update(id: string, payload: CancellationPolicyPayload): Promise<CancellationPolicy> {
    const response = await ApiService<CancellationPolicyResponseDto>(
      `/vendor/cancellation-policies/${id}`,
      'PUT',
      payload
    );
    return mapPolicy(unwrapResponse(response));
  },

  /** Xóa chính sách — BE trả `ApiResponseVoid` nên không unwrap `data`. */
  async remove(id: string): Promise<void> {
    const response = await ApiService<void>(`/vendor/cancellation-policies/${id}`, 'DELETE');
    if (response.error) {
      throw new Error(response.error);
    }
  },
};
