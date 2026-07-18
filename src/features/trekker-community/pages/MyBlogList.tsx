import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppSpinner } from '@/shared/ui';
import { toast } from '@/store/useToastStore';
import { MyBlogPagination } from '../components/MyBlogPagination';
import { MyBlogStatsCards } from '../components/MyBlogStatsCards';
import { MyBlogTable } from '../components/MyBlogTable';
import {
  useToggleBlogVisibility,
  useTrekkerBlogList,
  useTrekkerBlogStats,
} from '../hooks/useTrekkerBlog';
import type { TrekkerBlogItem } from '../types';

const PAGE_SIZE = 8;

/**
 * Trang "Blog của tôi" — màn hình quản lý blog của Trekker.
 * Header chung đã có sẵn từ MainLayout.
 *
 * Layout:
 * 1. Page header: tiêu đề + nút "Viết bài mới"
 * 2. Stats cards: 3 thẻ thống kê
 * 3. DataTable: danh sách bài viết
 * 4. Pagination footer
 */
export default function MyBlogList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Modal state for hide confirmation
  const [hideModalOpen, setHideModalOpen] = useState(false);
  const [blogToHide, setBlogToHide] = useState<TrekkerBlogItem | null>(null);

  const { data, isLoading, isError, isFetching } = useTrekkerBlogList({
    page,
    size: PAGE_SIZE,
    keyword: search.trim() || undefined,
    sortBy: 'createdAt',
    sortDir: 'desc',
  });

  const { data: statsData, isLoading: statsLoading } = useTrekkerBlogStats();

  const toggleVisibility = useToggleBlogVisibility();

  const blogs = data?.items ?? [];
  const total = data?.meta.totalElements ?? 0;
  const totalPages = Math.max(1, data?.meta.totalPages ?? 1);

  const stats = statsData ?? { totalPosts: 0, totalViews: 0, newComments: 0 };

  const handleSearchChange = (q: string) => {
    setSearch(q);
    setPage(1);
  };

  // Navigate to edit blog page
  const handleEditBlog = (blog: TrekkerBlogItem) => {
    navigate(`/blog/edit/${blog.blogId}`);
  };

  // Open hide confirmation modal
  const handleRequestHide = (blog: TrekkerBlogItem) => {
    setBlogToHide(blog);
    setHideModalOpen(true);
  };

  // Confirm hide action
  const handleConfirmHide = async () => {
    if (!blogToHide) return;

    const isCurrentlyPublished = blogToHide.status === 'PUBLISHED';

    toggleVisibility.mutate(
      { blogId: blogToHide.blogId },
      {
        onSuccess: () => {
          toast.success(
            isCurrentlyPublished
              ? 'Bài viết đã được ẩn khỏi cộng đồng.'
              : 'Bài viết đã được hiển thị lại.'
          );
          setHideModalOpen(false);
          setBlogToHide(null);
        },
        onError: () => {
          toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
          setHideModalOpen(false);
          setBlogToHide(null);
        },
      }
    );
  };

  // Cancel hide action
  const handleCancelHide = () => {
    setHideModalOpen(false);
    setBlogToHide(null);
  };

  // Navigate to create new blog
  const handleCreateBlog = () => {
    navigate('/blog/create');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF8F1' }}>
      <main className="mx-auto max-w-none w-full px-4 pb-16 pt-6 sm:px-6">
        {/* Page Header */}
        <div
          className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
          style={{ marginBottom: '32px', marginTop: '55px' }}
        >
          <div>
            <h2 className="text-3xl font-bold" style={{ color: '#06261D' }}>
              Bài viết của tôi
            </h2>
            <p className="mt-2 max-w-lg text-sm" style={{ color: '#6F7B75' }}>
              Quản lý và chia sẻ những chuyến hành trình của bạn với cộng đồng TrekSphere.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCreateBlog}
            className="inline-flex shrink-0 items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#06261D' }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="shrink-0"
            >
              <path
                d="M8 3V13M3 8H13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Viết bài mới
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8 max-w-md">
          <input
            type="text"
            placeholder="Tìm kiếm bài viết..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="h-11 w-full rounded-full pl-12 pr-4 text-sm outline-none transition-colors"
            style={{
              backgroundColor: '#F0EEE6',
              color: '#06261D',
              border: 'none',
            }}
          />
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: '#6F7B75' }}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        {/* Stats Cards */}
        <div style={{ marginBottom: '32px' }}>
          {statsLoading ? (
            <div className="flex items-center justify-center py-8">
              <AppSpinner size="default" className="text-primary" />
            </div>
          ) : (
            <MyBlogStatsCards stats={stats} />
          )}
        </div>

        {/* Data Table */}
        {isLoading ? (
          <div
            className="flex items-center justify-center rounded-2xl py-20"
            style={{ backgroundColor: '#FFFFFF', borderRadius: '24px' }}
          >
            <AppSpinner size="lg" className="text-primary" />
          </div>
        ) : isError ? (
          <div
            className="flex flex-col items-center justify-center rounded-2xl py-20 text-center"
            style={{ backgroundColor: '#FFFFFF', borderRadius: '24px' }}
          >
            <p className="text-base font-semibold text-destructive">
              Không thể tải danh sách bài viết
            </p>
            <p className="mt-2 max-w-sm text-sm" style={{ color: '#6F7B75' }}>
              Vui lòng thử lại sau. Nếu lỗi vẫn tiếp diễn, hãy liên hệ hỗ trợ.
            </p>
          </div>
        ) : (
          <div className={`transition-opacity ${isFetching ? 'opacity-60' : ''}`}>
            <MyBlogTable blogs={blogs} onEdit={handleEditBlog} onHide={handleRequestHide} />

            {/* Pagination Footer */}
            {total > 0 && (
              <div
                className="mt-0 overflow-hidden rounded-b-3xl"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderTop: '1px solid #E6E2D1',
                  borderRadius: '0 0 24px 24px',
                }}
              >
                <MyBlogPagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  totalCount={total}
                  pageSize={PAGE_SIZE}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Hide Confirmation Modal */}
      {hideModalOpen && blogToHide && (
        <HideConfirmationModal
          blogTitle={blogToHide.title}
          isPublished={blogToHide.status === 'PUBLISHED'}
          isPending={toggleVisibility.isPending}
          onConfirm={handleConfirmHide}
          onCancel={handleCancelHide}
        />
      )}
    </div>
  );
}

/**
 * Modal xác nhận ẩn/hiện bài viết.
 */
interface HideConfirmationModalProps {
  blogTitle: string;
  isPublished: boolean;
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function HideConfirmationModal({
  blogTitle,
  isPublished,
  isPending,
  onConfirm,
  onCancel,
}: HideConfirmationModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
    >
      <div
        className="mx-4 w-full max-w-md rounded-3xl p-6 shadow-xl"
        style={{ backgroundColor: '#FFFFFF' }}
      >
        {/* Icon */}
        <div
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
          style={{ backgroundColor: '#F0EEE6' }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#06261D"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        </div>

        {/* Title */}
        <h3 className="mb-2 text-center text-lg font-bold" style={{ color: '#06261D' }}>
          {isPublished ? 'Ẩn bài viết?' : 'Hiển thị bài viết?'}
        </h3>

        {/* Description */}
        <p className="mb-1 text-center text-sm" style={{ color: '#6F7B75' }}>
          {isPublished
            ? 'Bạn có chắc chắn muốn ẩn bài viết này khỏi cộng đồng không?'
            : 'Bạn có chắc chắn muốn hiển thị bài viết này trở lại?'}
        </p>
        <p className="mb-6 text-center text-xs font-medium" style={{ color: '#6F7B75' }}>
          "{blogTitle.length > 60 ? `${blogTitle.slice(0, 60)}...` : blogTitle}"
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="flex-1 rounded-full border px-4 py-3 text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{ borderColor: '#E6E2D1', color: '#6F7B75' }}
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 rounded-full px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: '#06261D' }}
          >
            {isPending ? 'Đang xử lý...' : isPublished ? 'Xác nhận ẩn' : 'Xác nhận hiển thị'}
          </button>
        </div>
      </div>
    </div>
  );
}
