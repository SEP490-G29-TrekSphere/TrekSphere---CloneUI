import { type ApiResponse, ApiService } from '@/config/apiClient';
import type { CoordinatorScheduleFilter, CoordinatorScheduleListResponse } from '../types';

function unwrapResponse<T>(response: ApiResponse<T>): T {
  if (response.error) {
    throw new Error(response.error);
  }
  if (response.data === undefined) {
    throw new Error('Không nhận được dữ liệu từ máy chủ');
  }
  return response.data;
}

export const coordinatorScheduleService = {
  /**
   * Lấy danh sách các phiên đi tour được phân công cho Coordinator.
   * API Endpoint: GET /api/v1/coordinator/schedules
   */
  async getAssignedSchedules(
    filter: CoordinatorScheduleFilter = {}
  ): Promise<CoordinatorScheduleListResponse> {
    const params: Record<string, string> = {};

    if (filter.status) {
      params.status = filter.status;
    }
    if (filter.isCancelled !== undefined) {
      params.isCancelled = String(filter.isCancelled);
    }
    if (filter.departureDateFrom) {
      params.departureDateFrom = filter.departureDateFrom;
    }
    if (filter.departureDateTo) {
      params.departureDateTo = filter.departureDateTo;
    }
    if (filter.keyword) {
      params.keyword = filter.keyword;
    }
    if (filter.page !== undefined) {
      params.page = String(filter.page);
    }
    if (filter.size !== undefined) {
      params.size = String(filter.size);
    }
    if (filter.sortBy) {
      params.sortBy = filter.sortBy;
    }
    if (filter.sortDir) {
      params.sortDir = filter.sortDir;
    }

    const response = await ApiService<CoordinatorScheduleListResponse>(
      '/coordinator/schedules',
      'GET',
      undefined,
      params
    );

    return unwrapResponse(response);
  },
};
