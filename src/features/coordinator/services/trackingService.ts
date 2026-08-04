import { type ApiResponse, ApiService } from '@/config/apiClient';
import type {
  AttendanceType,
  CheckpointLogResult,
  SosAlertResult,
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
