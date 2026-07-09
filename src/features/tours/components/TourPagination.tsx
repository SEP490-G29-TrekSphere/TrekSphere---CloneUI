import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TourPaginationProps {
  pageNumber: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

function buildPageRange(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i);
  }

  const range: (number | 'ellipsis')[] = [];
  const last = total - 1;

  range.push(0);
  if (current > 2) range.push('ellipsis');

  for (let i = Math.max(1, current - 1); i <= Math.min(last - 1, current + 1); i++) {
    range.push(i);
  }

  if (current < last - 2) range.push('ellipsis');
  range.push(last);

  return range;
}

/**
 * Numbered pagination control. Hides itself when there is only one page.
 * Pages are 0-indexed to match the backend's `page` query param.
 */
export default function TourPagination({
  pageNumber,
  totalPages,
  onPageChange,
  className = '',
}: TourPaginationProps) {
  if (totalPages <= 1) return null;

  const range = buildPageRange(pageNumber, totalPages);
  const canPrev = pageNumber > 0;
  const canNext = pageNumber < totalPages - 1;

  const baseBtn =
    'inline-flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-sm font-semibold transition-colors';
  const idleBtn = 'border border-border bg-white text-foreground hover:border-primary/50';
  const activeBtn = 'bg-primary text-white shadow-sm';
  const disabledBtn =
    'border border-border bg-white text-muted-foreground opacity-50 cursor-not-allowed';

  return (
    <nav
      aria-label="Pagination"
      className={`flex flex-wrap items-center justify-center gap-1.5 ${className}`}
    >
      <button
        type="button"
        disabled={!canPrev}
        onClick={() => canPrev && onPageChange(pageNumber - 1)}
        className={`${baseBtn} ${canPrev ? idleBtn : disabledBtn}`}
        aria-label="Trang trước"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {range.map((item, idx) => {
        if (item === 'ellipsis') {
          return (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: ellipsis placeholders have no stable id
              key={`ellipsis-${idx}`}
              className="inline-flex h-9 min-w-9 items-center justify-center text-sm text-muted-foreground"
              aria-hidden="true"
            >
              …
            </span>
          );
        }
        const isActive = item === pageNumber;
        return (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            aria-current={isActive ? 'page' : undefined}
            className={`${baseBtn} ${isActive ? activeBtn : idleBtn}`}
          >
            {item + 1}
          </button>
        );
      })}

      <button
        type="button"
        disabled={!canNext}
        onClick={() => canNext && onPageChange(pageNumber + 1)}
        className={`${baseBtn} ${canNext ? idleBtn : disabledBtn}`}
        aria-label="Trang sau"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
