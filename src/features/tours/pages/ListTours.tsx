import { useEffect, useMemo, useState } from 'react';
import {
  TourCard,
  TourFilters,
  TourPagination,
  TourSearchBar,
  type TourSearchValues,
  ToursHero,
} from '@/features/tours';
import { useTours } from '@/features/tours/hooks/useTours';
import type { ApiSortDir, ApiSortField, TourFilter, TourListParams } from '@/features/tours/types';
import { useDebounce } from '@/shared/hooks';
import { AppButton } from '@/shared/ui';

/**
 * Map the UI sort key to the (sortBy, sortDir) pair the backend expects.
 * `popular` and `newest` both map to `createdAt desc` because the backend
 * has no "popularity" field; the UI label still conveys intent.
 */
function resolveSort(sortBy: TourFilter['sortBy']): { sortBy: ApiSortField; sortDir: ApiSortDir } {
  switch (sortBy) {
    case 'price-asc':
      return { sortBy: 'basePrice', sortDir: 'asc' };
    case 'price-desc':
      return { sortBy: 'basePrice', sortDir: 'desc' };
    case 'rating':
      return { sortBy: 'averageRating', sortDir: 'desc' };
    case 'newest':
      return { sortBy: 'createdAt', sortDir: 'desc' };
    case 'duration-asc':
      return { sortBy: 'durationDays', sortDir: 'asc' };
    case 'duration-desc':
      return { sortBy: 'durationDays', sortDir: 'desc' };
    case 'name-asc':
      return { sortBy: 'tourName', sortDir: 'asc' };
    default:
      return { sortBy: 'createdAt', sortDir: 'desc' };
  }
}

const PAGE_SIZE = 6;

/**
 * ListTours page.
 *
 * State architecture:
 *   - `draft`    — text inputs bound to the search bar, updated on every keystroke
 *   - `filters`  — committed filter object sent to the API (debounced keyword/location)
 *   - `page`     — 0-indexed page number
 *
 * The draft → filters copy happens via a debounced effect on the keyword and
 * a direct copy for the location (location is rarely typed char-by-char, so
 * we accept the submit-driven update).
 *
 * All server-side filtering/sorting is delegated to the API. The previous
 * client-side `useMemo` filter/sort block is gone — see `useTours`.
 */
export default function ListTours() {
  const [draft, setDraft] = useState<TourSearchValues>({
    keyword: '',
    location: '',
    departureDate: '',
    budget: '',
  });

  const [filters, setFilters] = useState<TourFilter>({
    sortBy: 'newest',
  });
  const [page, setPage] = useState(0);

  const debouncedKeyword = useDebounce(draft.keyword, 400);

  useEffect(() => {
    setFilters((prev) => {
      if (prev.keyword === debouncedKeyword) return prev;
      return { ...prev, keyword: debouncedKeyword };
    });
    setPage(0);
  }, [debouncedKeyword]);

  const handleSearch = (values: TourSearchValues) => {
    setDraft(values);
    setFilters((prev) => ({
      ...prev,
      keyword: values.keyword,
      location: values.location,
    }));
    setPage(0);
  };

  const handleFilterChange = (next: TourFilter) => {
    setFilters(next);
    setDraft({
      keyword: next.keyword || '',
      location: next.location || '',
      departureDate: '',
      budget: '',
    });
    setPage(0);
  };

  const handlePageChange = (next: number) => {
    setPage(next);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const { sortBy, sortDir } = resolveSort(filters.sortBy);

  const queryParams = useMemo<TourListParams>(
    () => ({
      keyword: filters.keyword,
      location: filters.location,
      difficulty: filters.difficulty,
      page,
      size: PAGE_SIZE,
      sortBy,
      sortDir,
    }),
    [filters.keyword, filters.location, filters.difficulty, page, sortBy, sortDir]
  );

  const { tours, totalElements, totalPages, pageNumber, isLoading, error, refetch } =
    useTours(queryParams);

  return (
    <div className="min-h-screen bg-background pt-16">
      <ToursHero />

      <div className="relative z-10">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <TourSearchBar onSearch={handleSearch} initialValues={draft} />

          <div className="mt-10 sm:mt-14">
            {isLoading ? (
              <FeaturedToursSkeleton />
            ) : error ? (
              <FeaturedToursError onRetry={() => refetch()} />
            ) : tours.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-8 w-8"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-primary">Không tìm thấy tour</h3>
                <p className="mb-6 max-w-sm text-sm text-muted-foreground">
                  Không có tour nào phù hợp với bộ lọc của bạn. Thử thay đổi các tiêu chí tìm kiếm.
                </p>
                <AppButton onClick={() => handleFilterChange({ sortBy: 'newest' })}>
                  Xóa tất cả
                </AppButton>
              </div>
            ) : (
              <FeaturedToursList
                tours={tours}
                filters={filters}
                onFilterChange={handleFilterChange}
                totalElements={totalElements}
              />
            )}

            <div className="mt-8">
              <TourPagination
                pageNumber={pageNumber}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        </div>

        <div className="h-16 sm:h-24" />
      </div>
    </div>
  );
}

interface FeaturedToursListProps {
  tours: ReturnType<typeof useTours>['tours'];
  filters: TourFilter;
  onFilterChange: (f: TourFilter) => void;
  totalElements: number;
}

function FeaturedToursList({
  tours,
  filters,
  onFilterChange,
  totalElements,
}: FeaturedToursListProps) {
  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      <TourFilters
        filters={filters}
        onFilterChange={onFilterChange}
        totalResults={totalElements}
        className="mb-1"
      />

      {tours.map((tour) => (
        <TourCard key={tour.id} tour={tour} />
      ))}
    </div>
  );
}

function FeaturedToursSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length placeholder list, index is stable
          key={`featured-tour-skeleton-${i}`}
          className="flex gap-4 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/5 sm:p-4"
        >
          <div className="h-44 w-full shrink-0 animate-pulse rounded-xl bg-muted sm:h-auto sm:w-[200px] lg:w-[220px]" />
          <div className="flex flex-1 flex-col justify-between gap-2 py-1">
            <div className="flex flex-col gap-2">
              <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
              <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-7 w-32 animate-pulse rounded-full bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

function FeaturedToursError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
        <svg
          className="h-10 w-10 text-destructive"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
      </div>
      <h3 className="mb-2 text-lg font-semibold text-primary">Đã xảy ra lỗi</h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">
        Không thể tải danh sách tour. Vui lòng thử lại.
      </p>
      <AppButton onClick={onRetry}>Thử lại</AppButton>
    </div>
  );
}
