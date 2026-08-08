import { useQuery } from '@tanstack/react-query';
import { sessionOperationsService } from '../services/sessionOperationsService';
import { trackingService } from '../services/trackingService';

/** Poll trạng thái SOS khi còn tín hiệu chờ xử lý, để Coordinator thấy ngay lúc đội cứu hộ đóng ca. */
const SOS_STATUS_POLL_MS = 15_000;

export const sessionOperationsKeys = {
  all: ['coordinator-session-operations'] as const,
  detail: (sessionId: string) => ['coordinator-session-operations', 'detail', sessionId] as const,
  checkpoints: (tourId: string) =>
    ['coordinator-session-operations', 'checkpoints', tourId] as const,
  checkpointLogs: (sessionId: string) =>
    ['coordinator-session-operations', 'checkpoint-logs', sessionId] as const,
  sosStatus: (sessionId: string) =>
    ['coordinator-session-operations', 'sos-status', sessionId] as const,
};

/** Chi tiết phiên tour (tên, trạng thái, coordinator lead, thiết bị) — nguồn dữ liệu chính của trang Vận hành. */
export function useSessionDetail(sessionId: string | undefined) {
  return useQuery({
    queryKey: sessionOperationsKeys.detail(sessionId ?? ''),
    queryFn: () => sessionOperationsService.getSessionDetail(sessionId as string),
    enabled: Boolean(sessionId),
  });
}

/**
 * Lộ trình trạm dừng của tour — phụ thuộc `tourId` lấy từ `useSessionDetail`.
 * Chỉ dùng làm fallback khi phiên chưa bắt đầu (BE chưa khởi tạo nhật ký
 * checkpoint), vì API này không có trạng thái check-in.
 */
export function useTourCheckpoints(tourId: string | undefined) {
  return useQuery({
    queryKey: sessionOperationsKeys.checkpoints(tourId ?? ''),
    queryFn: () => sessionOperationsService.getTourCheckpoints(tourId as string),
    enabled: Boolean(tourId),
  });
}

/** Nhật ký checkpoint của phiên tour — trạm dừng kèm trạng thái check-in do BE lưu. */
export function useSessionCheckpointLogs(sessionId: string | undefined) {
  return useQuery({
    queryKey: sessionOperationsKeys.checkpointLogs(sessionId ?? ''),
    queryFn: () => trackingService.getCheckpointLogs(sessionId as string),
    enabled: Boolean(sessionId),
  });
}

/** Trạng thái SOS của phiên tour — tín hiệu còn chờ xử lý hay đã được giải quyết. */
export function useSessionSosStatus(sessionId: string | undefined) {
  return useQuery({
    queryKey: sessionOperationsKeys.sosStatus(sessionId ?? ''),
    queryFn: () => trackingService.getSosStatus(sessionId as string),
    enabled: Boolean(sessionId),
    refetchInterval: (query) =>
      query.state.data?.hasActiveSosAlert ? SOS_STATUS_POLL_MS : (false as const),
  });
}
