import { useQuery } from '@tanstack/react-query';
import { mapApiItemToTour } from '@/features/tours/hooks/useTours';
import { tourService } from '@/features/tours/services/tourService';
import type { Tour } from '@/features/tours/types';

/**
 * Số tour tối đa hiển thị ở section "Tour nổi bật".
 */
const FEATURED_LIMIT = 6;

/**
 * Kích thước trang khi quét tour ứng viên.
 *
 * `/api/v1/tours` không có filter "đã có đánh giá", nên phải lấy một lô lớn
 * rồi lọc ở client.
 *
 * Lưu ý: KHÔNG được gửi `sortBy=averageRating`. Entity `Tour` phía backend
 * không có thuộc tính này (điểm trung bình được tính từ bảng review), nên
 * Hibernate ném `UnknownPathException` → API trả 500. Sort theo `createdAt`
 * để lấy lô ứng viên, rồi xếp hạng theo rating ở client.
 */
const SCAN_PAGE_SIZE = 100;

async function fetchFeaturedTours(): Promise<Tour[]> {
  const response = await tourService.getTours({
    page: 0,
    size: SCAN_PAGE_SIZE,
    sortBy: 'createdAt',
    sortDir: 'desc',
  });

  return response.content
    .filter((item) => item.averageRating !== null && item.totalReviews > 0)
    .map(mapApiItemToTour)
    .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
    .slice(0, FEATURED_LIMIT);
}

export interface UseFeaturedToursResult {
  tours: Tour[];
  isLoading: boolean;
  error: Error | null;
}

/**
 * Tour nổi bật cho HomePage: chỉ những tour đã có lượt đánh giá,
 * xếp theo điểm trung bình rồi tới số lượt đánh giá.
 */
export function useFeaturedTours(): UseFeaturedToursResult {
  const { data, isLoading, error } = useQuery({
    queryKey: ['featured-tours', FEATURED_LIMIT],
    queryFn: fetchFeaturedTours,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    tours: data ?? [],
    isLoading,
    error: error instanceof Error ? error : null,
  };
}
