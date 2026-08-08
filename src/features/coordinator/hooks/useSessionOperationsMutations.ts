import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getCurrentPosition } from '@/utils/geolocation';
import { trackingService } from '../services/trackingService';
import type { AttendanceType, ParticipantAttendanceItem } from '../types';
import { sessionOperationsKeys } from './useSessionOperations';

/**
 * Mutation cho toàn bộ hành động vận hành tour thực địa. Các hành động cần GPS
 * (start/end/check-in/sos) tự lấy vị trí hiện tại của trình duyệt trước khi gọi API.
 */
export function useSessionOperationsMutations(sessionId: string) {
  const queryClient = useQueryClient();
  const invalidateDetail = () =>
    queryClient.invalidateQueries({ queryKey: sessionOperationsKeys.detail(sessionId) });
  const invalidateCheckpointLogs = () =>
    queryClient.invalidateQueries({ queryKey: sessionOperationsKeys.checkpointLogs(sessionId) });
  const invalidateSosStatus = () =>
    queryClient.invalidateQueries({ queryKey: sessionOperationsKeys.sosStatus(sessionId) });

  // Start/end đều đổi trạng thái phiên và nhật ký checkpoint (start khởi tạo
  // nhật ký, end tự check-in trạm đích) nên phải làm mới cả hai.
  const startSession = useMutation({
    mutationFn: async (note?: string) => {
      const position = await getCurrentPosition();
      return trackingService.startSession(sessionId, { ...position, note });
    },
    onSuccess: () => {
      invalidateDetail();
      invalidateCheckpointLogs();
    },
  });

  const endSession = useMutation({
    mutationFn: async (note?: string) => {
      const position = await getCurrentPosition();
      return trackingService.endSession(sessionId, { ...position, note });
    },
    onSuccess: () => {
      invalidateDetail();
      invalidateCheckpointLogs();
    },
  });

  const checkinCheckpoint = useMutation({
    mutationFn: async (note?: string) => {
      const position = await getCurrentPosition();
      return trackingService.checkinCheckpoint(sessionId, { ...position, note });
    },
    onSuccess: invalidateCheckpointLogs,
  });

  const recordAttendance = useMutation({
    mutationFn: (payload: {
      attendanceType: AttendanceType;
      participants: ParticipantAttendanceItem[];
    }) => trackingService.recordAttendance(sessionId, payload.attendanceType, payload.participants),
  });

  const checkEquipment = useMutation({
    mutationFn: (payload: { sessionEquipmentId: string; isChecked: boolean }) =>
      trackingService.checkEquipment(payload.sessionEquipmentId, payload.isChecked),
  });

  const sendSos = useMutation({
    mutationFn: async (message?: string) => {
      const position = await getCurrentPosition();
      return trackingService.sendSos(sessionId, { ...position, message });
    },
    onSuccess: invalidateSosStatus,
  });

  const resolveSos = useMutation({
    mutationFn: (sosId: string) => trackingService.resolveSos(sosId),
    onSuccess: invalidateSosStatus,
  });

  return {
    startSession,
    endSession,
    checkinCheckpoint,
    recordAttendance,
    checkEquipment,
    sendSos,
    resolveSos,
  };
}
