import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getCurrentPosition } from '@/utils/geolocation';
import { trackingService } from '../services/trackingService';
import type { AttendanceType, ParticipantAttendanceItem } from '../types';
import { sessionOperationsKeys } from './useSessionOperations';

/**
 * Mutation cho toàn bộ hành động vận hành tour thực địa. Chỉ check-in và SOS
 * cần GPS; start/end chỉ chuyển trạng thái của phiên tour.
 */
export function useSessionOperationsMutations(sessionId: string) {
  const queryClient = useQueryClient();
  const invalidateDetail = () =>
    queryClient.invalidateQueries({ queryKey: sessionOperationsKeys.detail(sessionId) });
  const invalidateCheckpointLogs = () =>
    queryClient.invalidateQueries({ queryKey: sessionOperationsKeys.checkpointLogs(sessionId) });
  const invalidateSosStatus = () =>
    queryClient.invalidateQueries({ queryKey: sessionOperationsKeys.sosStatus(sessionId) });

  const startSession = useMutation({
    mutationFn: () => trackingService.startSession(sessionId),
    onSuccess: () => {
      invalidateDetail();
      invalidateCheckpointLogs();
    },
  });

  const endSession = useMutation({
    mutationFn: () => trackingService.endSession(sessionId),
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

  const skipCheckpoint = useMutation({
    mutationFn: (payload: { checkpointId: string; reason: string }) =>
      trackingService.skipCheckpoint(sessionId, payload.checkpointId, payload.reason),
    onSuccess: invalidateCheckpointLogs,
  });

  const recordAttendance = useMutation({
    mutationFn: (payload: {
      attendanceType: AttendanceType;
      participants: ParticipantAttendanceItem[];
    }) => trackingService.recordAttendance(sessionId, payload.attendanceType, payload.participants),
    onSuccess: invalidateDetail,
  });

  const checkEquipment = useMutation({
    mutationFn: (payload: { sessionEquipmentId: string; isChecked: boolean }) =>
      trackingService.checkEquipment(payload.sessionEquipmentId, payload.isChecked),
    onSuccess: invalidateDetail,
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
    skipCheckpoint,
    recordAttendance,
    checkEquipment,
    sendSos,
    resolveSos,
  };
}
