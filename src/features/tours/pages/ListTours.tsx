import { LayoutGrid, List } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import {
  TourCard,
  TourPagination,
  TourSearchBar,
  type TourSearchValues,
  ToursHero,
} from '@/features/tours';
import { useTourPriceRange } from '@/features/tours/hooks/useTourPriceRange';
import { useTours } from '@/features/tours/hooks/useTours';
import type {
  ApiDifficulty,
  ApiSortDir,
  ApiSortField,
  TourFilter,
  TourListParams,
} from '@/features/tours/types';
import { cn } from '@/lib/utils';
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

const difficultyOptions: { value: ApiDifficulty | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Tất cả độ khó' },
  { value: 'EASY', label: 'Dễ' },
  { value: 'MODERATE', label: 'Trung bình' },
  { value: 'HARD', label: 'Khó' },
  { value: 'EXPERT', label: 'Cực thách thức' },
];

const sortOptions = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price-asc', label: 'Giá: Thấp → Cao' },
  { value: 'price-desc', label: 'Giá: Cao → Thấp' },
  { value: 'duration-asc', label: 'Thời gian: Ngắn nhất' },
  { value: 'duration-desc', label: 'Thời gian: Dài nhất' },
  { value: 'name-asc', label: 'Tên: A → Z' },
];

function formatShortPrice(val: number): string {
  if (val <= 0) return '0';
  if (val >= 1000000) {
    return `${(val / 1000000).toFixed(val % 1000000 === 0 ? 0 : 1)}M`;
  }
  if (val >= 1000) {
    return `${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}K`;
  }
  return String(val);
}

/**
 * ListTours page. Handles responsive layout modes (list / grid).
 * Layout rearranged: Sidebar filters on the left, Tour content grid on the right.
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
  const [isPriceFilterActive, setIsPriceFilterActive] = useState(false);
  const [page, setPage] = useState(0);
  const [layout, setLayout] = useState<'list' | 'grid'>('grid'); // Default to grid layout to match mockup

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
    setIsPriceFilterActive(true);
    setPage(0);
  };

  const handleResetFilters = () => {
    setDraft({
      keyword: '',
      location: '',
      departureDate: '',
      budget: '',
    });
    setFilters({
      sortBy: 'newest',
    });
    setPriceRange([minPrice, maxPrice]);
    setIsPriceFilterActive(false);
    setPage(0);
  };

  const handlePageChange = (next: number) => {
    setPage(next);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const { sortBy, sortDir } = resolveSort(filters.sortBy);

  const {
    minPrice,
    maxPrice,
    isLoading: isPriceRangeLoading,
  } = useTourPriceRange({
    keyword: filters.keyword,
    location: filters.location,
    difficulty: filters.difficulty,
  });

  const queryParams = useMemo<TourListParams>(
    () => ({
      keyword: filters.keyword,
      location: filters.location,
      difficulty: filters.difficulty,
      page: isPriceFilterActive ? 0 : page,
      size: isPriceFilterActive ? 100 : PAGE_SIZE,
      sortBy,
      sortDir,
    }),
    [
      filters.keyword,
      filters.location,
      filters.difficulty,
      page,
      sortBy,
      sortDir,
      isPriceFilterActive,
    ]
  );

  const { tours, totalPages, pageNumber, isLoading, error, refetch } = useTours(queryParams);

  useEffect(() => {
    if (isPriceRangeLoading) return;
    setPriceRange([minPrice, maxPrice]);
  }, [minPrice, maxPrice, isPriceRangeLoading]);

  // Client-side price filtering (since API does not support price query range yet)
  const filteredTours = useMemo(() => {
    return tours.filter((tour) => {
      if (
        !isPriceFilterActive ||
        isPriceRangeLoading ||
        (priceRange[0] === 0 && priceRange[1] === 0)
      ) {
        return true;
      }
      if (!tour.basePrice) return true;
      return tour.basePrice >= priceRange[0] && tour.basePrice <= priceRange[1];
    });
  }, [tours, priceRange, isPriceRangeLoading, isPriceFilterActive]);

  const activeTotalCount = isLoading ? 0 : filteredTours.length;

  const currentSortLabel =
    sortOptions.find((option) => option.value === (filters.sortBy || 'newest'))?.label ||
    'Mới nhất';

  return (
    <div className="min-h-screen bg-background pt-16">
      <ToursHero />

      <div className="relative z-10">
        <div className="mx-auto max-w-none w-full px-4 sm:px-6">
          <TourSearchBar onSearch={handleSearch} initialValues={draft} />

          {/* Grid Layout below Search: Left Sidebar Filters, Right Content Area */}
          <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12 sm:mt-14">
            {/* LEFT COLUMN: Sidebar Filters & Contact Widget */}
            <aside className="lg:col-span-3 flex flex-col gap-6">
              {/* Filter Panel Card */}
              <div className="rounded-2xl border border-border bg-white p-5 shadow-xs">
                <h3 className="mb-5 text-lg font-bold text-primary">Bộ lọc</h3>

                {/* Section: Độ khó */}
                <div className="mb-6">
                  <span className="mb-3 block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                    Độ khó
                  </span>
                  <div className="flex flex-col gap-2.5">
                    {difficultyOptions.map((opt) => {
                      const isActive =
                        opt.value === 'ALL'
                          ? filters.difficulty === undefined
                          : filters.difficulty === opt.value;

                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleDifficultySelect(opt.value)}
                          aria-pressed={isActive}
                          className="flex items-center gap-3 text-left transition-colors hover:text-primary"
                        >
                          <span
                            className={cn(
                              'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all',
                              isActive
                                ? 'border-primary bg-primary text-white'
                                : 'border-input bg-transparent'
                            )}
                          >
                            {isActive && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                          </span>
                          <span
                            className={cn(
                              'text-sm transition-all',
                              isActive ? 'font-semibold text-primary' : 'text-muted-foreground'
                            )}
                          >
                            {opt.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <hr className="my-5 border-border" />

                {/* Section: Khoảng giá */}
                <div className="mb-6">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                      Khoảng giá (VND)
                    </span>
                    <span className="text-xs font-bold text-primary">
                      {isPriceRangeLoading
                        ? 'Đang tải...'
                        : `${formatShortPrice(priceRange[0])} - ${formatShortPrice(priceRange[1])}`}
                    </span>
                  </div>
                  <div className="px-1 py-4">
                    <Slider
                      value={priceRange}
                      onValueChange={(val) => handlePriceRangeChange(val as [number, number])}
                      min={minPrice}
                      max={maxPrice > minPrice ? maxPrice : minPrice + 1}
                      step={Math.max(1, Math.round((maxPrice - minPrice) / 100) || 1)}
                      disabled={isPriceRangeLoading || (minPrice === 0 && maxPrice === 0)}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-semibold text-muted-foreground">
                    <span>{formatShortPrice(minPrice)}</span>
                    <span>{formatShortPrice(maxPrice)}</span>
                  </div>
                </div>

                {/* Clear/Reset Button */}
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="w-full rounded-xl border border-input py-2 text-center text-xs font-semibold text-primary transition-all hover:bg-muted"
                >
                  Làm mới bộ lọc
                </button>
              </div>
            </aside>

            {/* RIGHT COLUMN: Results list & Sort options */}
            <main className="lg:col-span-9">
              {/* Header Info Row */}
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-primary">Danh sách tour</h2>
                  <span className="text-xs text-muted-foreground">
                    Hiển thị {activeTotalCount} hành trình
                  </span>
                </div>

                {/* Sorting and Layout Controls */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="hidden text-xs text-muted-foreground sm:inline">Sắp xếp:</span>
                    <Select
                      value={filters.sortBy || 'newest'}
                      onValueChange={(val) => handleSortChange(val as TourFilter['sortBy'])}
                    >
                      <SelectTrigger className="h-10 rounded-full bg-white px-4 text-sm font-semibold text-primary hover:border-primary/50">
                        <span>{currentSortLabel}</span>
                      </SelectTrigger>
                      <SelectContent>
                        {sortOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Layout switcher buttons */}
                  <div className="flex items-center gap-1 rounded-full border border-input bg-white p-1">
                    <button
                      type="button"
                      onClick={() => setLayout('list')}
                      aria-pressed={layout === 'list'}
                      className={cn(
                        'rounded-full p-1.5 transition-colors',
                        layout === 'list'
                          ? 'bg-primary text-white font-semibold'
                          : 'text-muted-foreground hover:bg-muted'
                      )}
                      aria-label="Hiển thị danh sách"
                    >
                      <List className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setLayout('grid')}
                      aria-pressed={layout === 'grid'}
                      className={cn(
                        'rounded-full p-1.5 transition-colors',
                        layout === 'grid'
                          ? 'bg-primary text-white font-semibold'
                          : 'text-muted-foreground hover:bg-muted'
                      )}
                      aria-label="Hiển thị lưới"
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Main List Rendering */}
              {isLoading ? (
                <FeaturedToursSkeleton layout={layout} />
              ) : error ? (
                <FeaturedToursError onRetry={() => refetch()} />
              ) : filteredTours.length === 0 ? (
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
                    Không có tour nào phù hợp với bộ lọc hoặc khoảng giá của bạn. Thử thay đổi các
                    tiêu chí.
                  </p>
                  <AppButton onClick={handleResetFilters}>Xóa tất cả bộ lọc</AppButton>
                </div>
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

              {/* Pagination controls */}
              {!isPriceFilterActive && (
                <div className="mt-8">
                  <TourPagination
                    pageNumber={pageNumber}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </main>
          </div>
        </div>

        <div className="h-16 sm:h-24" />
      </div>
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
