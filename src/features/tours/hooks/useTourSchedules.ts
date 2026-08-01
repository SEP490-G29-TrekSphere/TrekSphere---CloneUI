import { useQuery } from '@tanstack/react-query';
import { tourService } from '@/features/tours/services/tourService';
import type { TourDetailScheduleApi } from '@/features/tours/types';

/**
 * Fetch upcoming schedules of a single tour by its UUID.
 *
 * The query is disabled when `tourId` is falsy so that partial route
 * params don't trigger a request.
 */
export function useTourSchedules(tourId: string | undefined) {
  return useQuery<TourDetailScheduleApi[], Error>({
    queryKey: ['tourSchedules', tourId],
    queryFn: () => tourService.getTourSchedules(tourId!),
    enabled: !!tourId,
    staleTime: 5 * 60 * 1000,
  });
}
