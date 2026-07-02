import { useState } from 'react';
import type { TourFilter } from '@/features/tours/types';
import { AppButton } from '@/shared/ui';
import { tourCategories } from '../data/tours';

interface TourFiltersProps {
  filters: TourFilter;
  onFilterChange: (filters: TourFilter) => void;
  totalResults: number;
}

const sortOptions = [
  { value: 'popular', label: 'Phổ biến nhất' },
  { value: 'price-asc', label: 'Giá: Thấp → Cao' },
  { value: 'price-desc', label: 'Giá: Cao → Thấp' },
  { value: 'rating', label: 'Đánh giá cao' },
  { value: 'newest', label: 'Mới nhất' },
];

const levelOptions = [
  { value: 'all', label: 'Tất cả mức độ' },
  { value: 'Dễ', label: 'Dễ' },
  { value: 'Trung bình', label: 'Trung bình' },
  { value: 'Khám phá', label: 'Khám phá' },
  { value: 'Khó', label: 'Khó' },
];

export default function TourFilters({ filters, onFilterChange, totalResults }: TourFiltersProps) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const handleCategoryChange = (categoryId: string) => {
    onFilterChange({
      ...filters,
      category: categoryId === 'all' ? undefined : categoryId,
    });
  };

  const handleSortChange = (sortBy: TourFilter['sortBy']) => {
    onFilterChange({ ...filters, sortBy });
  };

  const handleLevelChange = (level: string) => {
    onFilterChange({
      ...filters,
      level: level === 'all' ? undefined : (level as TourFilter['level']),
    });
  };

  const clearFilters = () => {
    onFilterChange({ sortBy: 'popular' });
  };

  const hasActiveFilters = filters.category || filters.level;

  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {tourCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => handleCategoryChange(category.id)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
                filters.category === category.id || (!filters.category && category.id === 'all')
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
              <span className="text-xs opacity-70">({category.count})</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {hasActiveFilters && (
            <AppButton variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
              Xóa lọc
            </AppButton>
          )}

          <select
            value={filters.sortBy || 'popular'}
            onChange={(e) => handleSortChange(e.target.value as TourFilter['sortBy'])}
            className="h-10 rounded-full border border-input bg-white px-4 pr-8 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer appearance-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236F7E72'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
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

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <select
          value={filters.level || 'all'}
          onChange={(e) => handleLevelChange(e.target.value)}
          className="h-9 rounded-full border border-input bg-white px-3 pr-8 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer appearance-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236F7E72'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 0.5rem center',
            backgroundSize: '0.875rem',
          }}
        >
          {levelOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <span className="text-sm text-muted-foreground">{totalResults} tour được tìm thấy</span>
      </div>

      {showMobileFilters && (
        // eslint-disable-next-line jsx-a11y/noStaticElementInteractions
        <div
          className="fixed inset-0 z-50 bg-black/50 lg:hidden"
          onClick={() => setShowMobileFilters(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setShowMobileFilters(false);
            }
          }}
          role="dialog"
          aria-modal="true"
        >
          {/* eslint-disable-next-line jsx-a11y/noStaticElementInteractions */}
          <div
            className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-white p-6"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="document"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-primary">Bộ lọc</h3>
              <button
                type="button"
                onClick={() => setShowMobileFilters(false)}
                className="p-2"
                aria-label="Đóng bộ lọc"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
