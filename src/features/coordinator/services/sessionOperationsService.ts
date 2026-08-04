import { type ApiResponse, ApiService } from '@/config/apiClient';
import type { CoordinatorSessionDetail, SessionTrekker, TourCheckpoint } from '../types';

/**
 * Service đọc dữ liệu cho trang Vận hành Tour Thực địa. Danh sách Trekkers lấy
 * từ `GET /coordinator/schedules/{tourSessionId}/logistics-info` — API dành
 * riêng cho Coordinator (tag "Coordinator Schedule Management"), thay thế
 * hoàn toàn cách ghép `/vendor/bookings` + `/bookings/{id}` cũ (Coordinator
 * không có quyền xem booking).
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

interface AllocationCoordinatorDto {
  coordinatorScheduleId: string;
  coordinatorId: string;
  fullName: string;
  isLead: boolean;
}

interface AllocationEquipmentDto {
  sessionEquipmentId: string;
  equipmentId: string;
  equipmentName: string;
  quantity: number;
  note?: string;
}

interface SessionAllocationDto {
  sessionId: string;
  status: CoordinatorSessionDetail['status'];
  startedAt?: string;
  endedAt?: string;
  tourId: string;
  tourName: string;
  departureDate: string;
  returnDate: string;
  coordinators: AllocationCoordinatorDto[];
  equipments: AllocationEquipmentDto[];
}

interface TourCheckpointDto {
  checkpointId: string;
  checkpointName: string;
  description?: string;
  altitude?: number;
  checkpointOrder: number;
}

interface LogisticsPassengerDto {
  participantId: string;
  fullName: string;
}

interface PaginationDto<T> {
  content: T[];
}

export const sessionOperationsService = {
  /** `GET /vendor/sessions/{id}/allocations` — thông tin chính của phiên tour. */
  async getSessionDetail(sessionId: string): Promise<CoordinatorSessionDetail> {
    const response = await ApiService<SessionAllocationDto>(
      `/vendor/sessions/${sessionId}/allocations`,
      'GET'
    );
    const dto = unwrapResponse(response);

    return {
      sessionId: dto.sessionId,
      status: dto.status,
      startedAt: dto.startedAt,
      endedAt: dto.endedAt,
      tourId: dto.tourId,
      tourName: dto.tourName,
      departureDate: dto.departureDate,
      returnDate: dto.returnDate,
      coordinators: dto.coordinators ?? [],
      equipments: dto.equipments ?? [],
    };
  },

  /** `GET /tours/{tourId}/checkpoints` — lộ trình trạm dừng (public, sắp theo thứ tự). */
  async getTourCheckpoints(tourId: string): Promise<TourCheckpoint[]> {
    const response = await ApiService<TourCheckpointDto[]>(`/tours/${tourId}/checkpoints`, 'GET');
    const data = unwrapResponse(response) ?? [];

    return [...data]
      .sort((a, b) => a.checkpointOrder - b.checkpointOrder)
      .map((cp) => ({
        checkpointId: cp.checkpointId,
        checkpointName: cp.checkpointName,
        description: cp.description,
        altitude: cp.altitude,
        checkpointOrder: cp.checkpointOrder,
      }));
  },

  /** `GET /coordinator/schedules/{tourSessionId}/logistics-info` — danh sách Trekkers thật của phiên tour. */
  async getSessionTrekkers(tourSessionId: string): Promise<SessionTrekker[]> {
    const response = await ApiService<PaginationDto<LogisticsPassengerDto>>(
      `/coordinator/schedules/${tourSessionId}/logistics-info`,
      'GET',
      undefined,
      { page: '0', size: '100' }
    );
    const passengers = unwrapResponse(response).content ?? [];

    return passengers.map((p) => ({
      participantId: p.participantId,
      fullName: p.fullName,
    }));
  },
};
