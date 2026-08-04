import { type ApiResponse, ApiService } from '@/config/apiClient';
import type {
  AssignCoordinatorPayload,
  AssignEquipmentPayload,
  AssignPorterPayload,
  SessionAllocation,
  SessionStatus,
  VendorSessionFilter,
  VendorSessionListResponse,
  VendorSessionSummary,
} from '../types';

/**
 * Service gọi API "Vendor Logistics" (BE tag `Vendor Logistics`, Module 5C).
 *
 *   GET    /vendor/sessions                            — danh sách phiên tour, phân trang + lọc tourId/status.
 *   GET    /vendor/sessions/{id}/allocations             — chi tiết phân bổ nhân sự + thiết bị.
 *   POST   /vendor/sessions/{id}/coordinators             — gán điều phối viên.
 *   DELETE /vendor/sessions/coordinators/{scheduleId}     — gỡ điều phối viên.
 *   POST   /vendor/sessions/{id}/porters                   — gán porter.
 *   DELETE /vendor/sessions/porters/{porterScheduleId}    — gỡ porter.
 *   POST   /vendor/sessions/{id}/equipments                 — cấp thiết bị.
 *   DELETE /vendor/sessions/equipments/{sessionEquipmentId} — thu hồi thiết bị, hoàn kho.
 *
 *   Khác các module khác trong app: `GET /vendor/sessions` dùng `page` 1-based
 *   (BE default `page=1`), KHÔNG trừ 1 như `/vendor/porters`, `/vendor-staff/me`...
 */

interface TourSessionSummaryDto {
  sessionId: string;
  status: SessionStatus;
  startedAt?: string;
  endedAt?: string;
  tourId: string;
  tourName: string;
  departureDate: string;
  returnDate: string;
}

interface CoordinatorAllocationDto {
  coordinatorScheduleId: string;
  coordinatorId: string;
  fullName: string;
  phone?: string;
  email?: string;
  avatar?: string;
  isLead: boolean;
}

interface PorterAllocationDto {
  porterScheduleId: string;
  porterId: string;
  fullName: string;
  phone?: string;
  note?: string;
}

interface EquipmentAllocationDto {
  sessionEquipmentId: string;
  equipmentId: string;
  equipmentName: string;
  quantity: number;
  note?: string;
}

interface TourSessionAllocationDto extends TourSessionSummaryDto {
  coordinators?: CoordinatorAllocationDto[];
  porters?: PorterAllocationDto[];
  equipments?: EquipmentAllocationDto[];
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

function throwIfError(response: ApiResponse<unknown>): void {
  if (response.error) {
    throw new Error(response.error);
  }
}

/** 8 ký tự đầu của id (bỏ dấu gạch ngang), viết hoa — BE không có mã phiên tuần tự. */
export function formatShortId(id: string): string {
  return id.replace(/-/g, '').slice(0, 8).toUpperCase();
}

function mapSessionSummary(dto: TourSessionSummaryDto): VendorSessionSummary {
  return {
    sessionId: dto.sessionId,
    status: dto.status,
    startedAt: dto.startedAt ?? undefined,
    endedAt: dto.endedAt ?? undefined,
    tourId: dto.tourId,
    tourName: dto.tourName,
    departureDate: dto.departureDate,
    returnDate: dto.returnDate,
  };
}

function mapAllocation(dto: TourSessionAllocationDto): SessionAllocation {
  return {
    ...mapSessionSummary(dto),
    coordinators: dto.coordinators ?? [],
    porters: dto.porters ?? [],
    equipments: dto.equipments ?? [],
  };
}

export const vendorSessionService = {
  /** Danh sách phiên tour của vendor hiện tại (filter + pagination, page 1-based). */
  async listSessions(
    filter: VendorSessionFilter = {},
    page = 1,
    pageSize = 10
  ): Promise<VendorSessionListResponse> {
    const params: Record<string, string> = {
      page: String(page),
      size: String(pageSize),
    };
    if (filter.tourId) params.tourId = filter.tourId;
    if (filter.status) params.status = filter.status;

    const response = await ApiService<PaginationResponseDto<TourSessionSummaryDto>>(
      '/vendor/sessions',
      'GET',
      undefined,
      params
    );
    const data = unwrapResponse(response);

    return {
      sessions: data.content.map(mapSessionSummary),
      total: data.totalElements,
      page,
      pageSize,
    };
  },

  /** Chi tiết phân bổ nhân sự + thiết bị của 1 phiên tour. */
  async getAllocations(sessionId: string): Promise<SessionAllocation> {
    const response = await ApiService<TourSessionAllocationDto>(
      `/vendor/sessions/${sessionId}/allocations`,
      'GET'
    );
    return mapAllocation(unwrapResponse(response));
  },

  /** Gán điều phối viên (Coordinator) dẫn đoàn cho phiên tour. */
  async assignCoordinator(sessionId: string, payload: AssignCoordinatorPayload): Promise<void> {
    const response = await ApiService<void>(
      `/vendor/sessions/${sessionId}/coordinators`,
      'POST',
      payload
    );
    throwIfError(response);
  },

  /** Gỡ điều phối viên đã gán khỏi phiên tour. */
  async removeCoordinator(scheduleId: string): Promise<void> {
    const response = await ApiService<void>(
      `/vendor/sessions/coordinators/${scheduleId}`,
      'DELETE'
    );
    throwIfError(response);
  },

  /** Gán porter hỗ trợ cho phiên tour, kèm ghi chú nhiệm vụ. */
  async assignPorter(sessionId: string, payload: AssignPorterPayload): Promise<void> {
    const response = await ApiService<void>(
      `/vendor/sessions/${sessionId}/porters`,
      'POST',
      payload
    );
    throwIfError(response);
  },

  /** Gỡ porter đã gán khỏi phiên tour. */
  async removePorter(porterScheduleId: string): Promise<void> {
    const response = await ApiService<void>(
      `/vendor/sessions/porters/${porterScheduleId}`,
      'DELETE'
    );
    throwIfError(response);
  },

  /** Cấp/phân bổ trang thiết bị từ kho cho phiên tour. */
  async assignEquipment(sessionId: string, payload: AssignEquipmentPayload): Promise<void> {
    const response = await ApiService<void>(
      `/vendor/sessions/${sessionId}/equipments`,
      'POST',
      payload
    );
    throwIfError(response);
  },

  /** Thu hồi trang thiết bị đã cấp, hoàn trả lại kho. */
  async removeEquipment(sessionEquipmentId: string): Promise<void> {
    const response = await ApiService<void>(
      `/vendor/sessions/equipments/${sessionEquipmentId}`,
      'DELETE'
    );
    throwIfError(response);
  },

  /**
   * Đánh dấu đã kiểm tra/mang theo thiết bị đi tour thành công.
   * Thuộc BE tag "Tracking Management" (không phải "Vendor Logistics" như các
   * hàm khác trong file này) — chỉ Vendor Staff (không phải Manager) được cấp
   * quyền gọi API này.
   */
  async checkEquipment(
    sessionEquipmentId: string,
    isChecked: boolean
  ): Promise<{ sessionEquipmentId: string; isChecked: boolean }> {
    const response = await ApiService<{ sessionEquipmentId: string; isChecked: boolean }>(
      `/tracking/sessions/equipments/${sessionEquipmentId}/check`,
      'PUT',
      { isChecked }
    );
    return unwrapResponse(response);
  },
};
