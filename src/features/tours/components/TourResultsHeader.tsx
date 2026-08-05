import { LayoutGrid, List } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import type { TourFilter } from '@/features/tours/types';
import { cn } from '@/lib/utils';

interface TourResultsHeaderProps {
  totalElements: number;
  filteredCount: number;
  pageCount: number;
  isPriceFilterActive: boolean;
  sortBy: TourFilter['sortBy'];
  layout: 'list' | 'grid';
  onSortChange: (sortBy: TourFilter['sortBy']) => void;
  onLayoutChange: (layout: 'list' | 'grid') => void;
}

const sortOptions = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price-asc', label: 'Giá: Thấp → Cao' },
  { value: 'price-desc', label: 'Giá: Cao → Thấp' },
  { value: 'duration-asc', label: 'Thời gian: Ngắn nhất' },
  { value: 'duration-desc', label: 'Thời gian: Dài nhất' },
  { value: 'name-asc', label: 'Tên: A → Z' },
];

export default function TourResultsHeader({
  totalElements,
  filteredCount,
  pageCount,
  isPriceFilterActive,
  sortBy,
  layout,
  onSortChange,
  onLayoutChange,
}: TourResultsHeaderProps) {
  const currentSortLabel =
    sortOptions.find((o) => o.value === (sortBy || 'newest'))?.label || 'Mới nhất';

  const countLabel = isPriceFilterActive
    ? `Hiển thị ${filteredCount}/${pageCount} tour ở trang này`
    : `Hiển thị ${totalElements} hành trình`;

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
      <div>
        <h2 className="text-2xl font-bold text-primary">Danh sách tour</h2>
        <span className="text-xs text-muted-foreground">{countLabel}</span>
      </div>

      {/* Sorting and Layout Controls */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-muted-foreground sm:inline">Sắp xếp:</span>
          <Select
            value={sortBy || 'newest'}
            onValueChange={(val) => onSortChange(val as TourFilter['sortBy'])}
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
            onClick={() => onLayoutChange('list')}
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
            onClick={() => onLayoutChange('grid')}
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
  );
}
