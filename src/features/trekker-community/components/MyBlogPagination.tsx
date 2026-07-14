import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MyBlogPaginationProps {
  /** Trang hiện tại (1-based). */
  currentPage: number;
  /** Tổng số trang. */
  totalPages: number;
  /** Callback khi chuyển trang. */
  onPageChange: (page: number) => void;
  /** Tổng số item sau filter. */
  totalCount: number;
  /** Page size đang dùng. */
  pageSize: number;
}

/**
 * Footer phân trang cho bảng "Blog của tôi".
 * - Trái: "Hiển thị X - Y trong số Z bài viết".
 * - Phải: 2 nút mũi tên + số trang. Trang hiện tại có nền xanh rêu đậm, chữ trắng.
 */
export function MyBlogPagination({
  currentPage,
  totalPages,
  onPageChange,
  totalCount,
  pageSize,
}: MyBlogPaginationProps) {
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
        trong số{' '}
        <span className="font-semibold" style={{ color: '#06261D' }}>
          {totalCount}
        </span>{' '}
        bài viết
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Trang trước"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="flex h-9 w-9 items-center justify-center rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E6E2D1',
            color: '#06261D',
          }}
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
                  : {
                      backgroundColor: 'transparent',
                      color: '#6F7B75',
                    }
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
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E6E2D1',
            color: '#06261D',
          }}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/**
 * Sinh danh sách số trang hiển thị, có ellipsis nếu quá nhiều.
 */
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

  if (start > 2) {
    pages.push(toItem('...', 'ellipsis-start'));
  }

  for (let i = start; i <= end; i++) {
    pages.push(toItem(i, i));
  }

  if (end < total - 1) {
    pages.push(toItem('...', 'ellipsis-end'));
  }

  pages.push(toItem(total, total));

  return pages;
}
