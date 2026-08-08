import { type ApiResponse, ApiService } from '@/config/apiClient';
import type {
  AttendanceType,
  CheckpointLogResult,
  SessionCheckpointStatus,
  SessionSosStatus,
  SosAlertResult,
  SosStatus,
  TourSessionStatus,
} from '../types';

/** Service gọi API tag "Tracking Management" — vận hành tour thực địa theo thời gian thực. */

function unwrapResponse<T>(response: ApiResponse<T>): T {
  if (response.error) {
    throw new Error(response.error);
  }
  if (response.data === undefined) {
    throw new Error('Không nhận được dữ liệu từ máy chủ');
  }
  return response.data;
}

interface GpsPayload {
  latitude: number;
  longitude: number;
  note?: string;
}

interface ParticipantAttendanceItem {
  participantId: string;
  isPresent: boolean;
}

interface SessionEquipmentCheckResultDto {
  sessionEquipmentId: string;
  isChecked: boolean;
}

/** `SessionCheckpointStatusResponse` — BE đặt tiền tố `checkpoint` cho toạ độ/độ cao. */
interface SessionCheckpointStatusDto {
  sessionCheckpointLogId?: string;
  checkpointId: string;
  checkpointName: string;
  checkpointDescription?: string;
  checkpointOrder: number;
  checkpointLatitude?: number;
  checkpointLongitude?: number;
  checkpointAltitude?: number;
  status: SessionCheckpointStatus['status'];
}

interface SessionSosStatusDto {
  tourSessionId: string;
  hasSosAlert: boolean;
  hasActiveSosAlert: boolean;
  resolved: boolean;
  status?: SosStatus;
  sosAlert?: {
    sosAlertId: string;
    senderName?: string;
    senderRole?: string;
    message?: string;
    status: SosStatus;
    createdAt: string;
    resolvedByName?: string;
  };
}

export const trackingService = {
  /** `POST /tracking/sessions/{sessionId}/start` */
  async startSession(
    sessionId: string,
    payload: GpsPayload
  ): Promise<{ status: TourSessionStatus; startedAt: string }> {
    const response = await ApiService<{ status: TourSessionStatus; startedAt: string }>(
      `/tracking/sessions/${sessionId}/start`,
      'POST',
      payload
    );
    return unwrapResponse(response);
  },

  /** `POST /tracking/sessions/{sessionId}/end` */
  async endSession(
    sessionId: string,
    payload: GpsPayload
  ): Promise<{ status: TourSessionStatus; endedAt: string }> {
    const response = await ApiService<{ status: TourSessionStatus; endedAt: string }>(
      `/tracking/sessions/${sessionId}/end`,
      'POST',
      payload
    );
    return unwrapResponse(response);
  },

  /**
   * `GET /tracking/sessions/{sessionId}/checkpoint-logs` — toàn bộ trạm dừng kèm
   * trạng thái check-in thật, đã sắp theo thứ tự hành trình (vẫn sort lại ở FE
   * cho chắc). Trước khi phiên tour bắt đầu, BE chưa khởi tạo nhật ký nên có thể
   * trả về mảng rỗng — caller tự fallback sang lộ trình tour công khai.
   */
  async getCheckpointLogs(sessionId: string): Promise<SessionCheckpointStatus[]> {
    const response = await ApiService<SessionCheckpointStatusDto[]>(
      `/tracking/sessions/${sessionId}/checkpoint-logs`,
      'GET'
    );
    const data = unwrapResponse(response) ?? [];

    return [...data]
      .sort((a, b) => a.checkpointOrder - b.checkpointOrder)
      .map((dto) => ({
        sessionCheckpointLogId: dto.sessionCheckpointLogId,
        checkpointId: dto.checkpointId,
        checkpointName: dto.checkpointName,
        description: dto.checkpointDescription,
        checkpointOrder: dto.checkpointOrder,
        latitude: dto.checkpointLatitude,
        longitude: dto.checkpointLongitude,
        altitude: dto.checkpointAltitude,
        status: dto.status,
      }));
  },

  /** `GET /tracking/sessions/{sessionId}/sos/status` — SOS của phiên đã được xử lý hay chưa. */
  async getSosStatus(sessionId: string): Promise<SessionSosStatus> {
    const response = await ApiService<SessionSosStatusDto>(
      `/tracking/sessions/${sessionId}/sos/status`,
      'GET'
    );
    const dto = unwrapResponse(response);

    return {
      tourSessionId: dto.tourSessionId,
      hasSosAlert: dto.hasSosAlert,
      hasActiveSosAlert: dto.hasActiveSosAlert,
      resolved: dto.resolved,
      status: dto.status,
      sosAlert: dto.sosAlert,
    };
  },

  /** `POST /tracking/sessions/{sessionId}/checkpoint-logs` — BE tự so khớp GPS với trạm kế tiếp. */
  async checkinCheckpoint(sessionId: string, payload: GpsPayload): Promise<CheckpointLogResult> {
    const response = await ApiService<CheckpointLogResult>(
      `/tracking/sessions/${sessionId}/checkpoint-logs`,
      'POST',
      payload
    );
    return unwrapResponse(response);
  },

  /** `POST /tracking/sessions/{sessionId}/attendance` */
  async recordAttendance(
    sessionId: string,
    attendanceType: AttendanceType,
    participants: ParticipantAttendanceItem[]
  ): Promise<void> {
    const response = await ApiService<unknown>(
      `/tracking/sessions/${sessionId}/attendance`,
      'POST',
      {
        attendanceType,
        participants,
      }
    );
    unwrapResponse(response);
  },

  /** `PUT /tracking/sessions/equipments/{id}/check` */
  async checkEquipment(
    sessionEquipmentId: string,
    isChecked: boolean
  ): Promise<SessionEquipmentCheckResultDto> {
    const response = await ApiService<SessionEquipmentCheckResultDto>(
      `/tracking/sessions/equipments/${sessionEquipmentId}/check`,
      'PUT',
      { isChecked }
    );
    return unwrapResponse(response);
  },

  /** `POST /tracking/sessions/sos` */
  async sendSos(
    tourSessionId: string,
    payload: GpsPayload & { message?: string }
  ): Promise<SosAlertResult> {
    const response = await ApiService<SosAlertResult>('/tracking/sessions/sos', 'POST', {
      tourSessionId,
      latitude: payload.latitude,
      longitude: payload.longitude,
      message: payload.message,
    });
    return unwrapResponse(response);
  },

  /** `PUT /tracking/sessions/sos/{sosId}/resolve` — đánh dấu đã tiếp nhận và cứu hộ thành công. */
  async resolveSos(sosId: string): Promise<SosAlertResult> {
    const response = await ApiService<SosAlertResult>(
      `/tracking/sessions/sos/${sosId}/resolve`,
      'PUT'
    );
    return unwrapResponse(response);
  },
};
