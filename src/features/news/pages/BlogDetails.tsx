import { ChevronLeft, Flag } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PATHS } from '@/constants';
import { AppSpinner, ReportModal } from '@/shared/ui';
import { useAppStore } from '@/store/useAppStore';
import { BlogComments } from '../components/BlogComments';
import { BlogContent } from '../components/BlogContent';
import { BlogDetailsHero } from '../components/BlogDetailsHero';
import { BlogSidebar } from '../components/BlogSidebar';
import { useBlogComments, useBlogDetail, useBlogRelated } from '../hooks/useBlog';
import { flattenComments } from '../types';

/**
 * Màn hình 2: Chi tiết bài viết Blog.
 * - Hero
 * - 2 cột: nội dung 65% + sidebar 35%
 * - Comments full width phía dưới content
 */
export default function BlogDetails() {
  const { blogId } = useParams<{ blogId: string }>();
  const navigate = useNavigate();
  const user = useAppStore((state) => state.user);
  const isLoggedIn = Boolean(user);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const detailQuery = useBlogDetail(blogId);
  const commentsQuery = useBlogComments(blogId);
  const relatedQuery = useBlogRelated(blogId);

  const post = detailQuery.data ?? null;
  const comments = commentsQuery.data?.items ?? [];
  const relatedPosts = relatedQuery.data ?? [];
  const totalComments = flattenComments(comments).length;

  if (detailQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <AppSpinner size="lg" className="text-primary" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex min-h-[60vh] flex-col items-center justify-center">
          <h1 className="mb-2 text-2xl font-bold text-primary">Không tìm thấy bài viết</h1>
          <p className="mb-6 text-muted-foreground">
            Bài viết bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
          </p>
          <Link
            to={PATHS.NEWS}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-white transition-opacity hover:opacity-90"
          >
            <ChevronLeft className="h-4 w-4" />
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <BlogDetailsHero post={post} />

      <main className="mx-auto max-w-[1400px] w-full px-4 py-10 sm:px-6 md:py-12">
        {/* Navigation & Actions */}
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(PATHS.NEWS)}
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <ChevronLeft className="h-4 w-4" />
            Quay lại
          </button>

          {isLoggedIn && (
            <button
              type="button"
              onClick={() => setIsReportModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold transition-colors"
              title="Báo cáo vi phạm"
            >
              <Flag className="size-3.5" />
              Báo cáo vi phạm
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Cột trái: Nội dung + Comment */}
          <div className="lg:col-span-8 flex flex-col gap-10">
            {/* Nội dung bài viết */}
            <div className="min-w-0 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
              <BlogContent post={post} />
            </div>

            {/* Comments */}
            <div className="min-w-0">
              <BlogComments
                comments={comments}
                total={totalComments}
                isLoggedIn={isLoggedIn}
                currentUserId={user?.id}
                blogId={blogId}
              />
            </div>
          </div>

          {/* Cột phải: Sidebar */}
          <div className="lg:col-span-4 h-fit sticky top-24">
            <BlogSidebar relatedPosts={relatedPosts} isLoggedIn={isLoggedIn} />
          </div>
        </div>
      </main>

      {/* Report Violation Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        targetId={blogId || 'TREK-8829'}
        targetType="BLOG"
        targetTitle={post.title}
      />
    </div>
  );
}
