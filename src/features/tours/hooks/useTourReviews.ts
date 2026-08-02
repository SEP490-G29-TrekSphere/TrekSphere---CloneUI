import { useQuery } from '@tanstack/react-query';
import { tourService } from '@/features/tours/services/tourService';
import type { ReviewListParams, ReviewSummaryResponse } from '@/features/tours/types';

export function useTourReviews(tourId: string | undefined, params: ReviewListParams) {
  return useQuery<ReviewSummaryResponse, Error>({
    queryKey: ['tourReviews', tourId, params],
    queryFn: () => tourService.getTourReviews(tourId!, params),
    enabled: !!tourId,
    staleTime: 5 * 60 * 1000,
  });
}
