import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * Sinh dãy số trang hiển thị: 1, 2, 3, ..., last
 * Trên màn hình lớn hiển thị đầy đủ, màn hình nhỏ rút gọn.
 */
function buildPageList(current: number, total: number): (number | 'ellipsis')[] {
  const items: (number | 'ellipsis')[] = [];

  if (total <= 7) {
    for (let i = 1; i <= total; i += 1) items.push(i);
    return items;
  }

  items.push(1);
  if (current > 4) items.push('ellipsis');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i += 1) items.push(i);

  if (current < total - 3) items.push('ellipsis');
  items.push(total);

  return items;
}

export function BlogPagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = buildPageList(currentPage, totalPages);

  if (totalPages <= 1) return null;

  return (
    <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Phân trang">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        aria-label="Trang trước"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-primary transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pages.map((p) =>
        p === 'ellipsis' ? (
          <span key={`ellipsis-${p}`} className="px-1 text-sm text-muted-foreground" aria-hidden>
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            aria-current={p === currentPage ? 'page' : undefined}
            className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
              p === currentPage ? 'bg-primary text-white shadow-sm' : 'text-primary hover:bg-muted'
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        aria-label="Trang sau"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-primary transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
