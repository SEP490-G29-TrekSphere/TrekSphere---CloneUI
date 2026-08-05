import { Slider } from '@/components/ui/slider';
import type { ApiDifficulty, TourFilter } from '@/features/tours/types';
import { cn } from '@/lib/utils';

interface TourFilterPanelProps {
  difficulty: TourFilter['difficulty'];
  priceRange: [number, number];
  minPrice: number;
  maxPrice: number;
  isPriceRangeLoading: boolean;
  onDifficultyChange: (difficulty: ApiDifficulty | 'ALL') => void;
  onPriceRangeChange: (range: [number, number]) => void;
  onResetFilters: () => void;
}

const difficultyOptions: { value: ApiDifficulty | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Tất cả độ khó' },
  { value: 'EASY', label: 'Dễ' },
  { value: 'MODERATE', label: 'Trung bình' },
  { value: 'HARD', label: 'Khó' },
  { value: 'EXPERT', label: 'Cực thách thức' },
];

function formatShortPrice(val: number): string {
  if (val <= 0) return '0';
  if (val >= 1_000_000) {
    return `${(val / 1_000_000).toFixed(val % 1_000_000 === 0 ? 0 : 1)}M`;
  }
  if (val >= 1_000) {
    return `${(val / 1_000).toFixed(val % 1_000 === 0 ? 0 : 1)}K`;
  }
  return String(val);
}

export default function TourFilterPanel({
  difficulty,
  priceRange,
  minPrice,
  maxPrice,
  isPriceRangeLoading,
  onDifficultyChange,
  onPriceRangeChange,
  onResetFilters,
}: TourFilterPanelProps) {
  return (
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
              opt.value === 'ALL' ? difficulty === undefined : difficulty === opt.value;

            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onDifficultyChange(opt.value)}
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
            onValueChange={(val) => onPriceRangeChange(val as [number, number])}
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
        onClick={onResetFilters}
        className="w-full rounded-xl border border-input py-2 text-center text-xs font-semibold text-primary transition-all hover:bg-muted"
      >
        Làm mới bộ lọc
      </button>
    </div>
  );
}
