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
  latitude?: number;
  longitude?: number;
  altitude?: number;
  checkpointOrder: number;
}

export type EquipmentReturnStatus =
  | 'NOT_RETURNED'
  | 'PENDING_CONFIRMATION'
  | 'CONFIRMED'
  | 'REJECTED';

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
  isChecked?: boolean;
  returnedQuantity?: number;
  missingQuantity?: number;
  returnStatus?: EquipmentReturnStatus;
  submittedByName?: string;
  submittedAt?: string;
  confirmedByName?: string;
  confirmedAt?: string;
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

export type CheckpointProgressStatus = 'PENDING' | 'REACHED' | 'SKIPPED';

/**
 * 1 trạm dừng kèm trạng thái check-in thật của phiên tour —
 * `GET /tracking/sessions/{sessionId}/checkpoint-logs`. Đây là nguồn dữ liệu
 * chính của Lộ trình Check-in: trạng thái do BE lưu, không còn suy đoán từ state
 * cục bộ của trình duyệt nên refresh trang vẫn giữ đúng tiến độ.
 */
export interface SessionCheckpointStatus {
  /** Chỉ có khi BE đã khởi tạo nhật ký (sau khi phiên tour bắt đầu). */
  sessionCheckpointLogId?: string;
  checkpointId: string;
  checkpointName: string;
  description?: string;
  checkpointOrder: number;
  latitude?: number;
  longitude?: number;
  altitude?: number;
  status: CheckpointProgressStatus;
  note?: string;
}

export interface CheckpointLogResult {
  checkpointId: string;
  checkpointName: string;
  checkpointOrder: number;
  status: CheckpointProgressStatus;
  reachedAt?: string;
  note?: string;
}

export type SosStatus = 'PENDING' | 'RESOLVED';

export interface SosAlertResult {
  sosAlertId: string;
  status: SosStatus;
  createdAt: string;
}

/** Chi tiết tín hiệu SOS gắn với phiên tour — subset của `SosAlertResponse` mà màn Vận hành cần. */
export interface SessionSosAlert {
  sosAlertId: string;
  senderName?: string;
  senderRole?: string;
  message?: string;
  status: SosStatus;
  createdAt: string;
  resolvedByName?: string;
}

/**
 * Trạng thái SOS của phiên tour — `GET /tracking/sessions/{sessionId}/sos/status`.
 * Cho Coordinator biết tín hiệu mình gửi đã được đội cứu hộ xử lý hay chưa.
 */
export interface SessionSosStatus {
  tourSessionId: string;
  /** Phiên tour từng có tín hiệu SOS nào chưa. */
  hasSosAlert: boolean;
  /** Còn tín hiệu đang chờ xử lý (PENDING). */
  hasActiveSosAlert: boolean;
  /** Tín hiệu gần nhất đã được giải quyết. */
  resolved: boolean;
  status?: SosStatus;
  sosAlert?: SessionSosAlert;
}

// ---------------------------------------------------------------------------
// Tracking Offline — offline pack, event queue, GPS backlog và reconcile
// ---------------------------------------------------------------------------

export type TrackingEventType =
  | 'EQUIPMENT_CHECKED'
  | 'ATTENDANCE_START_RECORDED'
  | 'ATTENDANCE_END_RECORDED'
  | 'SESSION_STARTED'
  | 'CHECKPOINT_REACHED'
  | 'CHECKPOINT_SKIPPED'
  | 'SOS_CREATED'
  | 'SOS_RESOLVED'
  | 'SESSION_ENDED';

export type TrackingEventResultStatus =
  | 'ACCEPTED'
  | 'DUPLICATE'
  | 'CONFLICT'
  | 'REJECTED'
  | 'RETRYABLE';

export interface TrackingSnapshotParticipant {
  participantId: string;
  fullName: string;
  isPresentStart?: boolean;
  startAttendedAt?: string;
  isPresentEnd?: boolean;
  endAttendedAt?: string;
}

export interface TrackingSnapshotEquipment {
  sessionEquipmentId: string;
  equipmentId: string;
  equipmentName: string;
  quantity: number;
  isChecked: boolean;
  note?: string;
}

export interface TrackingSnapshotCheckpoint {
  checkpointId: string;
  checkpointName: string;
  checkpointOrder: number;
  latitude?: number;
  longitude?: number;
  status: CheckpointProgressStatus;
  reachedAt?: string;
}

export interface TrackingSnapshotSos {
  sosAlertId: string;
  status: SosStatus;
  latitude: number;
  longitude: number;
  message?: string;
  createdAt: string;
}

export interface TrackingSnapshot {
  sessionId: string;
  status: TourSessionStatus;
  startedAt?: string;
  endedAt?: string;
  revision: number;
  participants: TrackingSnapshotParticipant[];
  equipments: TrackingSnapshotEquipment[];
  checkpoints: TrackingSnapshotCheckpoint[];
  latestSos?: TrackingSnapshotSos;
}

export interface TrackingOfflinePack {
  deviceSessionId: string;
  deviceId: string;
  actorId: string;
  leadCoordinator: boolean;
  issuedAt: string;
  expiresAt: string;
  serverTime: string;
  maxEventBatchSize: number;
  maxLocationBatchSize: number;
  gpsIntervalSeconds: number;
  snapshot: TrackingSnapshot;
}

export interface TrackingSyncEvent {
  clientEventId: string;
  sequenceNumber: number;
  type: TrackingEventType;
  occurredAt: string;
  baseRevision: number;
  payload: Record<string, unknown>;
}

export interface TrackingEventResult {
  clientEventId: string;
  sequenceNumber: number;
  status: TrackingEventResultStatus;
  code?: string;
  message?: string;
  resourceType?: string;
  resourceId?: string;
  resultRevision?: number;
}

export interface TrackingSyncResponse {
  sessionId: string;
  revision: number;
  serverTime: string;
  results: TrackingEventResult[];
  snapshot: TrackingSnapshot;
}

export interface TrackingSyncStateResponse {
  revision: number;
  fullSnapshot: boolean;
  changes: TrackingEventResult[];
  snapshot: TrackingSnapshot;
}

export interface TrackingLocationSample {
  sampleId: string;
  recordedAt: string;
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  speedMetersPerSecond?: number;
  headingDegrees?: number;
}

export interface TrackingLocationRejectedSample {
  sampleId: string;
  code: string;
  message: string;
}

export interface TrackingLocationBatchResponse {
  acceptedSampleIds: string[];
  duplicateSampleIds: string[];
  rejectedSamples: TrackingLocationRejectedSample[];
}

export interface TrackingLocation {
  sampleId: string;
  sessionId: string;
  actorId: string;
  deviceId: string;
  recordedAt: string;
  receivedAt: string;
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  speedMetersPerSecond?: number;
  headingDegrees?: number;
  validationStatus: 'VALID' | 'LOW_ACCURACY' | 'OUTLIER';
  late: boolean;
  stale: boolean;
}

export interface TrackingFailedItem {
  id: string;
  kind: 'EVENT' | 'LOCATION';
  code: string;
  message: string;
  failedAt: string;
}

export interface TrackingOfflineRecord {
  sessionId: string;
  pack: TrackingOfflinePack;
  sessionMeta?: CoordinatorSessionDetail;
  pendingEvents: TrackingSyncEvent[];
  pendingLocations: TrackingLocationSample[];
  failedItems: TrackingFailedItem[];
  nextSequenceNumber: number;
  lastSyncedAt?: string;
  updatedAt: string;
}
