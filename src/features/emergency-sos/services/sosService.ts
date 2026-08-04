import { type ApiResponse, ApiService } from '@/config/apiClient';
import type { SosAlert, SosAlertPage } from '../types';

function unwrapResponse<T>(response: ApiResponse<T>): T {
  if (response.error) {
    throw new Error(response.error);
  }
  if (response.data === undefined) {
    throw new Error('Không nhận được dữ liệu từ máy chủ');
  }
  return response.data;
}

export const sosService = {
  /** `GET /tracking/sessions/sos/active` — danh sách SOS đang chờ xử lý (PENDING), phân trang. */
  async getActiveAlerts(page = 0, size = 20): Promise<SosAlertPage> {
    const response = await ApiService<SosAlertPage>(
      '/tracking/sessions/sos/active',
      'GET',
      undefined,
      { page: String(page), size: String(size) }
    );
    return unwrapResponse(response);
  },

  /** `PUT /tracking/sessions/sos/{sosId}/resolve` — đánh dấu đã tiếp nhận và cứu hộ thành công. */
  async resolveAlert(sosId: string): Promise<SosAlert> {
    const response = await ApiService<SosAlert>(`/tracking/sessions/sos/${sosId}/resolve`, 'PUT');
    return unwrapResponse(response);
  },
};
