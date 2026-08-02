import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tourService } from '@/features/tours/services/tourService';
import type { ReviewResponse } from '@/features/tours/types';

export function useAdminReviewMutations(tourId: string) {
  const queryClient = useQueryClient();

  return useMutation<ReviewResponse, Error, { reviewId: string; status: 'APPROVED' | 'HIDDEN' }>({
    mutationFn: ({ reviewId, status }) => tourService.updateReviewStatus(reviewId, status),
    onSuccess: () => {
      // Invalidate tour reviews to reload updated status
      queryClient.invalidateQueries({ queryKey: ['tourReviews', tourId] });
    },
  });
}
