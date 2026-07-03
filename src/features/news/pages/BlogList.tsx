import { useMemo, useState } from 'react';
import { BlogCard } from '../components/BlogCard';
import { BlogFilterBar } from '../components/BlogFilterBar';
import { BlogHeroSection } from '../components/BlogHeroSection';
import { BlogPagination } from '../components/BlogPagination';
import { BLOG_POSTS } from '../data/blogPosts';
import type { BlogCategoryId } from '../types';

const PAGE_SIZE = 6;

/**
 * Màn hình 1: Danh sách Blog (View Blog).
 * - Hero (banner tối màu)
 * - Filter bar đè xuống ranh giới giữa hero và nội dung
 * - Grid 3 cột trên desktop
 * - Phân trang
 */
export default function BlogList() {
  const [category, setCategory] = useState<BlogCategoryId>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result = BLOG_POSTS;
    if (category !== 'all') {
      result = result.filter((p) => p.categoryId === category);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (p) => p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q)
      );
    }
    return result;
  }, [category, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const visiblePosts = filtered.slice(startIdx, startIdx + PAGE_SIZE);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero — banner tối màu, nằm riêng trong flow bình thường */}
      <BlogHeroSection />

      {/* Filter bar — nằm tách biệt phía dưới hero với khoảng cách rõ ràng,
          không dùng position absolute / translate để tránh đè lên nội dung */}
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 mt-6 md:mt-8">
        <BlogFilterBar
          selectedCategory={category}
          onCategoryChange={(id) => {
            setCategory(id);
            setPage(1);
          }}
          searchQuery={search}
          onSearchChange={(q) => {
            setSearch(q);
            setPage(1);
          }}
        />
      </div>

      <main className="mx-auto max-w-[1200px] px-4 pb-16 sm:px-6">
        {/* Khoảng cách cố định giữa filter bar và grid bài viết */}
        <div className="h-10 md:h-12" aria-hidden />

        {visiblePosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-card py-20 text-center shadow-sm">
            <p className="text-base font-semibold text-primary">Không tìm thấy bài viết</p>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Thử thay đổi chuyên mục hoặc từ khóa tìm kiếm khác.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visiblePosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}

        <BlogPagination currentPage={safePage} totalPages={totalPages} onPageChange={setPage} />
      </main>
    </div>
  );
}
