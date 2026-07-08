import { ArrowRight } from 'lucide-react';
import type { TourCategory } from '@/features/tours/types';

interface TourCategoriesRowProps {
  categories: TourCategory[];
  activeId?: string;
  onSelect?: (id: string) => void;
  onSeeAll?: () => void;
  className?: string;
}

/**
 * TourCategoriesRow — section header + horizontally scrollable row of circular
 * category items ("Danh mục tour"). Each category is rendered as a circular image
 * with a label below, matching the reference design.
 */
export default function TourCategoriesRow({
  categories,
  activeId,
  onSelect,
  onSeeAll,
  className = '',
}: TourCategoriesRowProps) {
  return (
    <section className={className}>
      <div className="mb-4 flex items-end justify-between gap-3 sm:mb-5">
        <div>
          <h2 className="text-lg font-bold text-primary sm:text-xl">Danh mục tour</h2>
          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
            Khám phá các loại hình trải nghiệm
          </p>
        </div>

        <button
          type="button"
          onClick={onSeeAll}
          className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary transition-opacity hover:opacity-80 sm:text-sm"
        >
          Xem tất cả
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="-mx-4 flex items-start gap-4 overflow-x-auto px-4 pb-2 sm:gap-6 lg:mx-0 lg:gap-8 lg:px-0">
        {categories.map((cat) => {
          const isActive = activeId === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelect?.(cat.id)}
              className="group flex w-[110px] shrink-0 flex-col items-center gap-2 text-center sm:w-[130px]"
              aria-label={cat.name}
            >
              <div
                className={`relative h-[88px] w-[88px] overflow-hidden rounded-full ring-2 ring-primary/15 transition-all duration-300 group-hover:ring-primary/40 group-hover:scale-105 sm:h-[110px] sm:w-[110px] ${
                  isActive ? 'ring-primary ring-offset-2 ring-offset-background' : ''
                }`}
              >
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-accent text-3xl">
                    {cat.icon}
                  </div>
                )}
              </div>
              <span className="line-clamp-2 text-xs font-semibold text-primary sm:text-sm">
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
