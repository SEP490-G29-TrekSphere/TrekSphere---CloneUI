import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { tourService } from '@/features/tours/services/tourService';
import type { TourListParams } from '@/features/tours/types';

export interface TourPriceRange {
  minPrice: number;
  maxPrice: number;
}

interface UseTourPriceRangeResult extends TourPriceRange {
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: UseQueryResult<TourPriceRange, Error>['refetch'];
}

async function fetchAllTourPrices(
  params: Pick<TourListParams, 'keyword' | 'location' | 'difficulty'>
) {
  const [minResponse, maxResponse] = await Promise.all([
    tourService.getTours({
      keyword: params.keyword,
      location: params.location,
      difficulty: params.difficulty,
      page: 0,
      size: 1,
      sortBy: 'basePrice',
      sortDir: 'asc',
    }),
    tourService.getTours({
      keyword: params.keyword,
      location: params.location,
      difficulty: params.difficulty,
      page: 0,
      size: 1,
      sortBy: 'basePrice',
      sortDir: 'desc',
    }),
  ]);

  const minPrice = minResponse.content[0]?.basePrice ?? 0;
  const maxPrice = maxResponse.content[0]?.basePrice ?? 0;

  return {
    minPrice,
    maxPrice,
  };
}

export function useTourPriceRange(
  params: Pick<TourListParams, 'keyword' | 'location' | 'difficulty'> = {}
): UseTourPriceRangeResult {
  const queryKey = [
    'tour-price-range',
    params.keyword ?? '',
    params.location ?? '',
    params.difficulty ?? 'ALL',
  ] as const;

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey,
    queryFn: () => fetchAllTourPrices(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    minPrice: data?.minPrice ?? 0,
    maxPrice: data?.maxPrice ?? 0,
    isLoading,
    isFetching,
    error: error instanceof Error ? error : null,
    refetch,
  };
}
