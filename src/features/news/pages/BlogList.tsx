import { useState } from 'react';
import { AppSpinner } from '@/shared/ui';
import { BlogCard } from '../components/BlogCard';
import { BlogFilterBar } from '../components/BlogFilterBar';
import { BlogHeroSection } from '../components/BlogHeroSection';
import { BlogPagination } from '../components/BlogPagination';
import { useBlogList } from '../hooks/useBlog';

const PAGE_SIZE = 6;

/**
 * Màn hình 1: Danh sách Blog (View Blog).
 * - Hero (banner tối màu)
 * - Filter bar đè xuống ranh giới giữa hero và nội dung
 * - Grid 3 cột trên desktop
 * - Phân trang — BE trả sẵn `data.totalPages` (Spring Data convention).
 *
 * Lưu ý: BE hiện chỉ hỗ trợ filter `keyword` (search) — không có filter category.
 * → `BlogFilterBar` chỉ dùng phần ô tìm kiếm, các tab category hiển thị nhưng
 *   không gửi param (giữ UI để khi BE bổ sung thì chỉ cần nối lại).
 */
export default function BlogList() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, isFetching } = useBlogList({
    page,
    size: PAGE_SIZE,
    keyword: search.trim() || undefined,
    sortBy: 'id',
    sortDir: 'desc',
  });

  const handleSearchChange = (q: string) => {
    setSearch(q);
    setPage(1);
  };

  const posts = data?.items ?? [];
  const totalPages = Math.max(1, data?.meta.totalPages ?? 1);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero — banner tối màu, nằm riêng trong flow bình thường */}
      <BlogHeroSection />

      {/* Filter bar */}
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 mt-6 md:mt-8">
        <BlogFilterBar searchQuery={search} onSearchChange={handleSearchChange} />
      </div>

      <main className="mx-auto max-w-[1200px] px-4 pb-16 sm:px-6">
        <div className="h-10 md:h-12" aria-hidden />

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <AppSpinner size="lg" className="text-primary" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-card py-20 text-center shadow-sm">
            <p className="text-base font-semibold text-destructive">
              Không thể tải danh sách bài viết
            </p>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Vui lòng thử lại sau. Nếu lỗi vẫn tiếp diễn, hãy liên hệ hỗ trợ.
            </p>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-card py-20 text-center shadow-sm">
            <p className="text-base font-semibold text-primary">Không tìm thấy bài viết</p>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Thử thay đổi từ khóa tìm kiếm khác.
            </p>
          </div>
        ) : (
          <div
            className={`relative grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 ${
              isFetching ? 'opacity-60 transition-opacity' : ''
            }`}
          >
            {posts.map((post) => (
              <BlogCard key={post.blogId} post={post} />
            ))}
          </div>
        )}

        <BlogPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </main>
    </div>
  );
}
