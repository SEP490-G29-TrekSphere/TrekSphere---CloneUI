import { useQuery } from '@tanstack/react-query';
import { tourService } from '@/features/tours/services/tourService';

const FALLBACK_LOCATIONS = [
  'Lào Cai',
  'Lai Châu',
  'Lâm Đồng',
  'Cao Bằng',
  'Yên Bái',
  'Hòa Bình',
  'Hà Giang',
];

async function fetchAllTourLocations(): Promise<string[]> {
  const firstPage = await tourService.getTours({
    page: 0,
    size: 100,
  });

  const pages = [firstPage.content];

  if (firstPage.totalPages > 1) {
    const remainingPages = await Promise.all(
      Array.from({ length: firstPage.totalPages - 1 }, (_, index) =>
        tourService.getTours({
          page: index + 1,
          size: firstPage.pageSize,
        })
      )
    );

    pages.push(...remainingPages.map((page) => page.content));
  }

  const rawLocations = pages.flatMap((page) => page.map((t) => t.location).filter(Boolean));
  const splitLocations = rawLocations.flatMap((loc) =>
    loc
      .split(/[-–—]+/)
      .map((part) => part.trim())
      .filter(Boolean)
  );
  const unique = Array.from(new Set(splitLocations)) as string[];
  return unique.length > 0 ? unique : FALLBACK_LOCATIONS;
}

export function useTourLocations() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['tour-locations'],
    queryFn: fetchAllTourLocations,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    locations: data ?? FALLBACK_LOCATIONS,
    isLoading,
    error,
  };
}
