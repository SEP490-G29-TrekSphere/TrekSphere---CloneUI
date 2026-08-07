import { useQuery } from '@tanstack/react-query';
import { coordinatorScheduleService } from '../services/coordinatorScheduleService';
import type { CoordinatorScheduleFilter } from '../types';

export const coordinatorKeys = {
  all: ['coordinator'] as const,
  /** Prefix của mọi query lịch dẫn đoàn — invalidate key này là refresh mọi bộ lọc. */
  schedulesRoot: ['coordinator', 'schedules'] as const,
  schedules: (filter: CoordinatorScheduleFilter) => ['coordinator', 'schedules', filter] as const,
};

/** Hook lấy danh sách lịch dẫn đoàn được phân công cho coordinator */
export function useCoordinatorSchedules(filter: CoordinatorScheduleFilter = {}) {
  return useQuery({
    queryKey: coordinatorKeys.schedules(filter),
    queryFn: () => coordinatorScheduleService.getAssignedSchedules(filter),
  });
}
