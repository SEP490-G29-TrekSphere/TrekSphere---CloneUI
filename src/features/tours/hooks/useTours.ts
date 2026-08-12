import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { type TourListResponse, tourService } from '@/features/tours/services/tourService';
import type { ApiDifficulty, Tour, TourApiItem, TourListParams } from '@/features/tours/types';

const DIFFICULTY_MAP: Record<ApiDifficulty, Tour['level']> = {
  EASY: 'Dễ',
  MODERATE: 'Trung bình',
  HARD: 'Khó',
  EXPERT: 'Khám phá', // LevelBadge renders 'Khám phá' as "Cực khó" with rose color
  BEGINNER: 'Dễ',
};

function formatPrice(price: number): string {
  return `${price.toLocaleString('vi-VN')}đ`;
}

export function mapApiItemToTour(item: TourApiItem): Tour {
  return {
    id: item.tourId,
    name: item.tourName,
    description: '',
    duration: `${item.durationDays} ngày`,
    level: DIFFICULTY_MAP[item.difficulty],
    price: formatPrice(item.basePrice),
    basePrice: item.basePrice,
    rating: item.averageRating ?? 0,
    reviewCount: item.totalReviews,
    image: item.coverImageUrl,
    slug: item.tourId,
    category: item.category || '',
    location: item.location,
    maxParticipants: 0,
    highlights: [],
    includes: [],
    isPopular: false,
    isNew: false,
  };
}

export interface UseToursResult {
  tours: Tour[];
  totalElements: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
  last: boolean;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: UseQueryResult<TourListResponse, Error>['refetch'];
}

export function useTours(params: TourListParams = {}): UseToursResult {
  const queryParams: TourListParams = {
    page: params.page ?? 0,
    size: params.size ?? 10,
    sortBy: params.sortBy ?? 'createdAt',
    sortDir: params.sortDir ?? 'desc',
    keyword: params.keyword,
    location: params.location,
    difficulty: params.difficulty,
    departureDate: params.departureDate,
    returnDate: params.returnDate,
  };

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['tours', queryParams],
    queryFn: () => tourService.getTours(queryParams),
  });

  return {
    tours: data?.content?.map(mapApiItemToTour) ?? [],
    totalElements: data?.totalElements ?? 0,
    totalPages: data?.totalPages ?? 0,
    pageNumber: data?.pageNumber ?? 0,
    pageSize: data?.pageSize ?? 0,
    last: data?.last ?? true,
    isLoading,
    isFetching,
    error: error instanceof Error ? error : null,
    refetch,
  };
}
