import { ChevronLeft, ChevronRight } from 'lucide-react';

interface StaffPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalCount: number;
  pageSize: number;
}

/** Footer phân trang cho bảng nhân viên — cùng UI với `AccountPagination` bên Admin. */
export function StaffPagination({
  currentPage,
  totalPages,
  onPageChange,
  totalCount,
  pageSize,
}: StaffPaginationProps) {
  const start = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalCount);
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <div className="flex items-center justify-between px-6 py-5">
      <p className="text-sm" style={{ color: '#6F7B75' }}>
        Hiển thị{' '}
        <span className="font-semibold" style={{ color: '#06261D' }}>
          {start}
        </span>{' '}
        -{' '}
        <span className="font-semibold" style={{ color: '#06261D' }}>
          {end}
        </span>{' '}
        của{' '}
        <span className="font-semibold" style={{ color: '#06261D' }}>
          {totalCount}
        </span>{' '}
        nhân viên
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Trang trước"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="flex h-9 w-9 items-center justify-center rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #E6E2D1', color: '#06261D' }}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pageNumbers.map(({ value, key }) =>
          value === '...' ? (
            <span key={key} className="px-1 text-sm" style={{ color: '#6F7B75' }}>
              ...
            </span>
          ) : (
            <button
              key={key}
              type="button"
              onClick={() => onPageChange(value)}
              className="flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-sm font-semibold transition-colors"
              style={
                value === currentPage
                  ? { backgroundColor: '#06261D', color: '#FFFFFF' }
                  : { backgroundColor: 'transparent', color: '#6F7B75' }
              }
            >
              {value}
            </button>
          )
        )}

        <button
          type="button"
          aria-label="Trang sau"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="flex h-9 w-9 items-center justify-center rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #E6E2D1', color: '#06261D' }}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function getPageNumbers(
  current: number,
  total: number
): Array<{ value: number | '...'; key: string | number }> {
  const toItem = (value: number | '...', key: string | number) => ({ value, key });

  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => toItem(i + 1, i + 1));
  }

  const pages: Array<{ value: number | '...'; key: string | number }> = [];
  pages.push(toItem(1, 1));

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) pages.push(toItem('...', 'ellipsis-start'));
  for (let i = start; i <= end; i++) pages.push(toItem(i, i));
  if (end < total - 1) pages.push(toItem('...', 'ellipsis-end'));

  pages.push(toItem(total, total));
  return pages;
}
