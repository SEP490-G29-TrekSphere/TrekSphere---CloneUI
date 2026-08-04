export type CoordinatorScheduleStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface CoordinatorScheduleFilter {
  status?: CoordinatorScheduleStatus;
  isCancelled?: boolean;
  departureDateFrom?: string;
  departureDateTo?: string;
  keyword?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
}

export interface CoordinatorScheduleItem {
  coordinatorScheduleId: string;
  isLead: boolean;
  isCancelled: boolean;
  tourSessionId: string;
  sessionStatus: CoordinatorScheduleStatus;
  tourId: string;
  tourName: string;
  departureDate: string;
  returnDate: string;
}

export interface CoordinatorScheduleListResponse {
  content: CoordinatorScheduleItem[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// ---------------------------------------------------------------------------
// Trang Vận hành Tour Thực địa (Coordinator Session Operations)
// ---------------------------------------------------------------------------

export type TourSessionStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

/** Trạm dừng theo lộ trình tour — `GET /tours/{tourId}/checkpoints` (public). */
export interface TourCheckpoint {
  checkpointId: string;
  checkpointName: string;
  description?: string;
  altitude?: number;
  checkpointOrder: number;
}

export interface SessionCoordinatorAllocation {
  coordinatorScheduleId: string;
  coordinatorId: string;
  fullName: string;
  isLead: boolean;
}

export interface SessionEquipmentAllocation {
  sessionEquipmentId: string;
  equipmentId: string;
  equipmentName: string;
  quantity: number;
  note?: string;
}

/** Chi tiết 1 phiên tour — `GET /vendor/sessions/{id}/allocations`. */
export interface CoordinatorSessionDetail {
  sessionId: string;
  status: TourSessionStatus;
  startedAt?: string;
  endedAt?: string;
  tourId: string;
  tourName: string;
  departureDate: string;
  returnDate: string;
  coordinators: SessionCoordinatorAllocation[];
  equipments: SessionEquipmentAllocation[];
}

/** 1 người tham gia tour — `GET /coordinator/schedules/{tourSessionId}/logistics-info`. */
export interface SessionTrekker {
  participantId: string;
  fullName: string;
}

export type AttendanceType = 'START' | 'END';

export interface ParticipantAttendanceItem {
  participantId: string;
  isPresent: boolean;
}

/** Trạng thái check-in cục bộ của 1 trạm dừng trong phiên xem hiện tại (không persist qua BE). */
export type CheckpointProgressStatus = 'PENDING' | 'REACHED';

export interface CheckpointLogResult {
  checkpointId: string;
  checkpointName: string;
  checkpointOrder: number;
  status: 'PENDING' | 'REACHED' | 'SKIPPED';
  reachedAt?: string;
}

export interface SosAlertResult {
  sosAlertId: string;
  status: 'PENDING' | 'RESOLVED';
  createdAt: string;
}
