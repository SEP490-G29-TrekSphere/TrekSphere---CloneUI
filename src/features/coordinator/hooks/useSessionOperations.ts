import { useQuery } from '@tanstack/react-query';
import { sessionOperationsService } from '../services/sessionOperationsService';

export const sessionOperationsKeys = {
  all: ['coordinator-session-operations'] as const,
  detail: (sessionId: string) => ['coordinator-session-operations', 'detail', sessionId] as const,
  checkpoints: (tourId: string) =>
    ['coordinator-session-operations', 'checkpoints', tourId] as const,
};

/** Chi tiết phiên tour (tên, trạng thái, coordinator lead, thiết bị) — nguồn dữ liệu chính của trang Vận hành. */
export function useSessionDetail(sessionId: string | undefined) {
  return useQuery({
    queryKey: sessionOperationsKeys.detail(sessionId ?? ''),
    queryFn: () => sessionOperationsService.getSessionDetail(sessionId as string),
    enabled: Boolean(sessionId),
  });
}

/** Lộ trình trạm dừng của tour — phụ thuộc `tourId` lấy từ `useSessionDetail`. */
export function useTourCheckpoints(tourId: string | undefined) {
  return useQuery({
    queryKey: sessionOperationsKeys.checkpoints(tourId ?? ''),
    queryFn: () => sessionOperationsService.getTourCheckpoints(tourId as string),
    enabled: Boolean(tourId),
  });
}
