import type { ApiDifficulty, TourFilter } from '@/features/tours/types';

interface TourFiltersProps {
  filters: TourFilter;
  onFilterChange: (filters: TourFilter) => void;
  totalResults: number;
  className?: string;
}

const sortOptions: { value: NonNullable<TourFilter['sortBy']>; label: string }[] = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price-asc', label: 'Giá: Thấp → Cao' },
  { value: 'price-desc', label: 'Giá: Cao → Thấp' },
  { value: 'duration-asc', label: 'Thời gian: Ngắn nhất' },
  { value: 'duration-desc', label: 'Thời gian: Dài nhất' },
  { value: 'name-asc', label: 'Tên: A → Z' },
];

const difficultyOptions: { value: ApiDifficulty; label: string }[] = [
  { value: 'EASY', label: 'Dễ' },
  { value: 'MODERATE', label: 'Trung bình' },
  { value: 'HARD', label: 'Khó' },
  { value: 'EXPERT', label: 'Chuyên gia' },
];

/**
 * Result count + sort + difficulty selector row for the List Tours page.
 *
 * Sits below the search bar and category row. Drives:
 *   - filters.sortBy    → forwarded to the API as (sortBy, sortDir)
 *   - filters.difficulty → forwarded to the API as the `difficulty` param
 */
export default function TourFilters({
  filters,
  onFilterChange,
  totalResults,
  className = '',
}: TourFiltersProps) {
  const handleSortChange = (sortBy: TourFilter['sortBy']) => {
    onFilterChange({ ...filters, sortBy });
  };

  const handleDifficultyChange = (difficulty: ApiDifficulty | undefined) => {
    onFilterChange({ ...filters, difficulty });
  };

  const handleClear = () => {
    onFilterChange({ sortBy: 'newest' });
  };

  const hasActiveFilters =
    Boolean(filters.keyword) ||
    Boolean(filters.location) ||
    Boolean(filters.difficulty) ||
    (filters.sortBy !== undefined && filters.sortBy !== 'newest');

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-sm font-semibold text-primary">Danh sách tour</span>
          <span className="ml-2 text-xs text-muted-foreground">
            (Hiển thị {totalResults} hành trình)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-muted-foreground sm:inline">Sắp xếp:</span>
          <select
            value={filters.sortBy || 'newest'}
            onChange={(e) => handleSortChange(e.target.value as TourFilter['sortBy'])}
            className="h-10 cursor-pointer appearance-none rounded-full border border-input bg-white pl-4 pr-9 text-sm font-semibold text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%231f3933'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.75rem center',
              backgroundSize: '1rem',
            }}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground">Độ khó:</span>
        <button
          type="button"
          onClick={() => handleDifficultyChange(undefined)}
          className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
            !filters.difficulty
              ? 'border-primary bg-primary text-white'
              : 'border-border bg-white text-foreground hover:border-primary/50'
          }`}
        >
          Tất cả
        </button>
        {difficultyOptions.map((opt) => {
          const isActive = filters.difficulty === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleDifficultyChange(opt.value)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                isActive
                  ? 'border-primary bg-primary text-white'
                  : 'border-border bg-white text-foreground hover:border-primary/50'
              }`}
            >
              {opt.label}
            </button>
          );
        })}

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClear}
            className="ml-auto rounded-full px-3 py-1 text-xs font-semibold text-primary underline-offset-4 hover:underline"
          >
            Xóa tất cả
          </button>
        )}
      </div>
    </div>
  );
}
