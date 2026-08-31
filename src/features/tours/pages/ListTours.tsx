import { useEffect, useMemo, useState } from 'react';
import TourCard from '@/features/tours/components/TourCard';
import TourFilterPanel from '@/features/tours/components/TourFilterPanel';
import TourPagination from '@/features/tours/components/TourPagination';
import TourResultsHeader from '@/features/tours/components/TourResultsHeader';
import TourSearchBar from '@/features/tours/components/TourSearchBar';
import { useTourPriceRange } from '@/features/tours/hooks/useTourPriceRange';
import { useTours } from '@/features/tours/hooks/useTours';
import type {
  ApiDifficulty,
  ApiSortDir,
  ApiSortField,
  TourFilter,
  TourListParams,
  TourSearchValues,
} from '@/features/tours/types';
import { useDebounce } from '@/shared/hooks';
import { AppButton } from '@/shared/ui';

/**
 * Map the UI sort key to the (sortBy, sortDir) pair the backend expects.
 */
function resolveSort(sortBy: TourFilter['sortBy']): { sortBy: ApiSortField; sortDir: ApiSortDir } {
  switch (sortBy) {
    case 'price-asc':
      return { sortBy: 'basePrice', sortDir: 'asc' };
    case 'price-desc':
      return { sortBy: 'basePrice', sortDir: 'desc' };
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
 * ListTours page. Handles responsive layout modes (list / grid).
 * Layout: left sidebar filters + centered max-width content container.
 *
 * Price filtering strategy:
 *  - Price bounds come from useTourPriceRange (2 x size=1 queries) — stable across page changes.
 *  - Pagination is always server-side; price filter narrows the *current page* client-side.
 *  - A page may legitimately render 0 cards while later pages still have matches; the empty
 *    state and pagination are both rendered so the user can navigate past it.
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
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [page, setPage] = useState(0);
  const [layout, setLayout] = useState<'list' | 'grid'>('grid');

  const debouncedKeyword = useDebounce(draft.keyword, 400);

  // biome-ignore lint/correctness/useExhaustiveDependencies: setPage is a stable useState setter — not a dep
  useEffect(() => {
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

  const handleDifficultySelect = (difficulty: ApiDifficulty | 'ALL') => {
    setFilters((prev) => ({
      ...prev,
      difficulty: difficulty === 'ALL' ? undefined : difficulty,
    }));
    setPage(0);
  };

  const handleSortChange = (sortBy: TourFilter['sortBy']) => {
    setFilters((prev) => ({ ...prev, sortBy }));
    setPage(0);
  };

  const handlePriceRangeChange = (val: [number, number]) => {
    setPriceRange(val);
    setPage(0);
  };

  const handleDepartureDateChange = (date: string) => {
    setFilters((prev) => ({ ...prev, departureDate: date }));
    setPage(0);
  };

  const handleReturnDateChange = (date: string) => {
    setFilters((prev) => ({ ...prev, returnDate: date }));
    setPage(0);
  };

  const handleResetFilters = () => {
    setDraft({ keyword: '', location: '', departureDate: '', budget: '' });
    setFilters({ sortBy: 'newest', departureDate: '', returnDate: '' });
    setPriceRange([0, 0]); // will be re-synced from useTourPriceRange
    setPage(0);
  };

  const handlePageChange = (next: number) => {
    setPage(next);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // --- Price range from dedicated hook (stable across page changes) ---
  const {
    minPrice,
    maxPrice,
    isLoading: isPriceRangeLoading,
  } = useTourPriceRange({
    keyword: debouncedKeyword,
    location: filters.location,
    difficulty: filters.difficulty,
  });

  // Sync priceRange to the API-sourced bounds on initial load or when bounds change (if no active filter).
  // "No active filter" means the range is still at the neutral [0,0] default.
  useEffect(() => {
    if (!isPriceRangeLoading && minPrice > 0 && priceRange[0] === 0 && priceRange[1] === 0) {
      setPriceRange([minPrice, maxPrice]);
    }
  }, [minPrice, maxPrice, isPriceRangeLoading, priceRange]);

  // Derived: is the user actively filtering by price?
  const isPriceFilterActive =
    (priceRange[0] > 0 || priceRange[1] > 0) &&
    (priceRange[0] > minPrice || priceRange[1] < maxPrice);

  // --- Server-side paginated query — always uses PAGE_SIZE ---
  const { sortBy, sortDir } = resolveSort(filters.sortBy);

  const queryParams = useMemo<TourListParams>(
    () => ({
      keyword: debouncedKeyword,
      location: filters.location,
      difficulty: filters.difficulty,
      departureDate: filters.departureDate,
      returnDate: filters.returnDate,
      page,
      size: PAGE_SIZE,
      sortBy,
      sortDir,
    }),
    [
      debouncedKeyword,
      filters.location,
      filters.difficulty,
      filters.departureDate,
      filters.returnDate,
      page,
      sortBy,
      sortDir,
    ]
  );

  const { tours, totalElements, totalPages, pageNumber, isLoading, error, refetch } =
    useTours(queryParams);

  // Client-side price filter narrows the current page only
  const filteredTours = useMemo(() => {
    if (!isPriceFilterActive || isLoading) return tours;
    return tours.filter((tour) => {
      if (!tour.basePrice) return true;
      return tour.basePrice >= priceRange[0] && tour.basePrice <= priceRange[1];
    });
  }, [tours, priceRange, isLoading, isPriceFilterActive]);

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Hero Section */}
      <section className="relative h-[350px] sm:h-[450px] w-full">
        <img
          src="/image1.jpg"
          alt="Khám phá các tour Trekking"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white px-4">
          <h1 className="mb-4 text-3xl font-bold sm:text-5xl lg:text-6xl text-white">
            Khám Phá Các Hành Trình Trekking
          </h1>
          <p className="max-w-2xl text-base sm:text-lg text-white/90">
            Tìm kiếm và lựa chọn những chuyến phiêu lưu tuyệt vời nhất cùng các chuyên gia hàng đầu.
          </p>
        </div>
      </section>

      <div className="relative z-20 -mt-16 sm:-mt-20">
        {/* Centered max-width container — aligns search bar and grid */}
        <div className="mx-auto max-w-[1400px] w-full px-4 sm:px-6 lg:px-8">
          <TourSearchBar
            onSearch={handleSearch}
            initialValues={draft}
            className="mx-auto"
            departureDate={filters.departureDate}
            returnDate={filters.returnDate}
            onDepartureDateChange={handleDepartureDateChange}
            onReturnDateChange={handleReturnDateChange}
          />

          {/* Grid Layout below Search: Left Sidebar Filters, Right Content Area */}
          <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12 sm:mt-14">
            {/* LEFT COLUMN: Sidebar Filters */}
            <aside className="lg:col-span-3 flex flex-col gap-6">
              <TourFilterPanel
                difficulty={filters.difficulty}
                priceRange={priceRange}
                minPrice={minPrice}
                maxPrice={maxPrice}
                isPriceRangeLoading={isPriceRangeLoading}
                onDifficultyChange={handleDifficultySelect}
                onPriceRangeChange={handlePriceRangeChange}
                onResetFilters={handleResetFilters}
              />
            </aside>

            {/* RIGHT COLUMN: Results header + cards + pagination */}
            <main className="lg:col-span-9">
              <TourResultsHeader
                totalElements={totalElements}
                filteredCount={filteredTours.length}
                pageCount={tours.length}
                isPriceFilterActive={isPriceFilterActive}
                sortBy={filters.sortBy}
                layout={layout}
                onSortChange={handleSortChange}
                onLayoutChange={setLayout}
              />

              {/* Main List Rendering */}
              {isLoading ? (
                <FeaturedToursSkeleton layout={layout} />
              ) : error ? (
                <FeaturedToursError onRetry={() => refetch()} />
              ) : filteredTours.length === 0 ? (
                <EmptyState
                  isPriceFilterActive={isPriceFilterActive}
                  pageNumber={pageNumber + 1}
                  onReset={handleResetFilters}
                />
              ) : (
                <div
                  className={
                    layout === 'grid'
                      ? 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3'
                      : 'flex flex-col gap-5'
                  }
                >
                  {filteredTours.map((tour) => (
                    <TourCard key={tour.id} tour={tour} layout={layout} />
                  ))}
                </div>
              )}

              {/* Pagination — always visible so user can navigate past price-empty pages */}
              <div className="mt-8">
                <TourPagination
                  pageNumber={pageNumber}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            </main>
          </div>
        </div>

        <div className="h-16 sm:h-24" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function EmptyState({
  isPriceFilterActive,
  onReset,
}: {
  isPriceFilterActive: boolean;
  pageNumber: number;
  onReset: () => void;
}) {
  if (isPriceFilterActive) {
    return (
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
        <h3 className="mb-2 text-lg font-semibold text-primary">
          Không có tour đáp ứng các tiêu chí lọc
        </h3>
        <AppButton onClick={onReset}>Xóa bộ lọc </AppButton>
      </div>
    );
  }

  return (
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
        Không có tour nào phù hợp với bộ lọc của bạn. Thử thay đổi các tiêu chí.
      </p>
      <AppButton onClick={onReset}>Xóa tất cả bộ lọc</AppButton>
    </div>
  );
}

function FeaturedToursSkeleton({ layout = 'list' }: { layout?: 'list' | 'grid' }) {
  if (layout === 'grid') {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length loading skeleton
            key={`featured-tour-skeleton-${i}`}
            className="flex flex-col rounded-2xl bg-white shadow-sm ring-1 ring-black/5"
          >
            <div className="aspect-[4/3] w-full animate-pulse bg-muted rounded-t-2xl" />
            <div className="flex flex-col p-4 gap-3">
              <div className="flex flex-col gap-2">
                <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
              </div>
              <div className="h-8 w-32 animate-pulse rounded-full bg-muted mt-2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

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
