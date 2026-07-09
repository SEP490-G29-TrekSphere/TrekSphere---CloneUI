import { useQuery } from '@tanstack/react-query';
import { tourService } from '@/features/tours/services/tourService';
import type { TourDetailFromApi } from '@/features/tours/types';

/**
 * Fetch a single tour by its UUID.
 *
 * The query is disabled when `tourId` is falsy so that partial route
 * params (e.g. during navigation) don't trigger a request.
 */
export function useTourDetail(tourId: string | undefined) {
  return useQuery<TourDetailFromApi, Error>({
    queryKey: ['tourDetail', tourId],
    queryFn: () => tourService.getTourById(tourId!),
    enabled: !!tourId,
    staleTime: 5 * 60 * 1000,
  });
}
