import { useQuery } from '@tanstack/react-query';
import { tourService } from '@/features/tours/services/tourService';
import type { TourCheckpoint } from '@/features/tours/types';

/**
 * Fetch checkpoints of a single tour by its UUID.
 *
 * The query is disabled when `tourId` is falsy so that partial route
 * params don't trigger a request.
 */
export function useTourCheckpoints(tourId: string | undefined) {
  return useQuery<TourCheckpoint[], Error>({
    queryKey: ['tourCheckpoints', tourId],
    queryFn: () => tourService.getTourCheckpoints(tourId!),
    enabled: !!tourId,
    staleTime: 5 * 60 * 1000,
  });
}
