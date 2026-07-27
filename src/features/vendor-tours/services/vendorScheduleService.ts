import { type ApiResponse, ApiService } from '@/config/apiClient';
import type { CreateSchedulePayload, TourSchedule, UpdateSchedulePayload } from '../types';

/**
 * Service gọi API "Vendor Tour Schedule Management" — dùng chung cho cả Vendor
 * Manager và Vendor Staff. Nguồn tham chiếu: `https://api.treksphere.io.vn/v3/api-docs`.
 *
 *   POST   /vendor/tours/{tourId}/schedules        — tạo lịch khởi hành mới cho tour
 *   PUT    /vendor/tours/schedules/{scheduleId}     — sửa lịch (kể cả đổi status OPEN -> CLOSED)
 *   DELETE /vendor/tours/schedules/{scheduleId}     — hủy lịch, chỉ VendorManager, chỉ khi chưa có khách đặt
 *
 * KHÔNG có endpoint GET list lịch riêng cho vendor — danh sách lấy qua
 * `TourDetailFromApi.schedules` (đã có sẵn từ `vendorTourService.getTourDetail`).
 */
function unwrapResponse<T>(response: ApiResponse<T>): T {
  if (response.error) {
    throw new Error(response.error);
  }
  if (response.data === undefined) {
    throw new Error('Không nhận được dữ liệu từ máy chủ');
  }
  return response.data;
}

export const vendorScheduleService = {
  /** Tạo lịch khởi hành mới cho 1 tour. */
  async createSchedule(tourId: string, payload: CreateSchedulePayload): Promise<TourSchedule> {
    const response = await ApiService<TourSchedule>(
      `/vendor/tours/${tourId}/schedules`,
      'POST',
      payload
    );
    return unwrapResponse(response);
  },

  /** Sửa lịch khởi hành đã tồn tại — gửi nguyên payload hiện tại của form (không diff field). */
  async updateSchedule(scheduleId: string, payload: UpdateSchedulePayload): Promise<TourSchedule> {
    const response = await ApiService<TourSchedule>(
      `/vendor/tours/schedules/${scheduleId}`,
      'PUT',
      payload
    );
    return unwrapResponse(response);
  },

  /** Hủy lịch khởi hành — chỉ VendorManager, BE tự chặn nếu đã có khách đặt. */
  async deleteSchedule(scheduleId: string): Promise<void> {
    const response = await ApiService<void>(`/vendor/tours/schedules/${scheduleId}`, 'DELETE');
    if (response.error) {
      throw new Error(response.error);
    }
  },
};
