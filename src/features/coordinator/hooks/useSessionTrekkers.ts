import { useQuery } from '@tanstack/react-query';
import { sessionOperationsService } from '../services/sessionOperationsService';

export const sessionTrekkersKeys = {
  list: (tourSessionId: string) =>
    ['coordinator-session-operations', 'trekkers', tourSessionId] as const,
};

/** Danh sách Trekkers thật của phiên tour (xem `sessionOperationsService`). */
export function useSessionTrekkers(tourSessionId: string | undefined) {
  return useQuery({
    queryKey: sessionTrekkersKeys.list(tourSessionId ?? ''),
    queryFn: () => sessionOperationsService.getSessionTrekkers(tourSessionId as string),
    enabled: Boolean(tourSessionId),
  });
}
