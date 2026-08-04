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

  const startSession = useMutation({
    mutationFn: async (note?: string) => {
      const position = await getCurrentPosition();
      return trackingService.startSession(sessionId, { ...position, note });
    },
    onSuccess: invalidateDetail,
  });

  const endSession = useMutation({
    mutationFn: async (note?: string) => {
      const position = await getCurrentPosition();
      return trackingService.endSession(sessionId, { ...position, note });
    },
    onSuccess: invalidateDetail,
  });

  const checkinCheckpoint = useMutation({
    mutationFn: async (note?: string) => {
      const position = await getCurrentPosition();
      return trackingService.checkinCheckpoint(sessionId, { ...position, note });
    },
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
  });

  const resolveSos = useMutation({
    mutationFn: (sosId: string) => trackingService.resolveSos(sosId),
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
