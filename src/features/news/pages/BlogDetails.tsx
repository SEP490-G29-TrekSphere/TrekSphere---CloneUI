import { ChevronLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { PATHS } from '@/constants';
import { AppSpinner } from '@/shared/ui';
import { useAppStore } from '@/store/useAppStore';
import { BlogComments } from '../components/BlogComments';
import { BlogContent } from '../components/BlogContent';
import { BlogDetailsHero } from '../components/BlogDetailsHero';
import { BlogSidebar } from '../components/BlogSidebar';
import { useBlogDetail } from '../hooks/useBlog';

/**
 * Màn hình 2: Chi tiết bài viết Blog.
 * - Hero
 * - 2 cột: nội dung 65% + sidebar 35%
 * - Comments full width phía dưới
 *
 * URL dùng `:blogId` — BE nhận blogId làm định danh.
 * Data flow:
 *   - Detail:  GET /blogs/{blogId} — đã bao gồm comments nested + totalComments
 *   - Related: hiện tại BE chưa có related endpoint, sidebar sẽ hiển thị empty state
 */
export default function BlogDetails() {
  const { blogId } = useParams<{ blogId: string }>();
  const user = useAppStore((state) => state.user);
  const isLoggedIn = Boolean(user);

  const detailQuery = useBlogDetail(blogId);

  const post = detailQuery.data ?? null;
  const comments = post?.comments ?? [];
  const totalComments = post?.totalComments ?? 0;

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
      <BlogDetailsHero post={post!} />

      <main className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 md:py-12">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm" aria-label="Điều hướng">
          <Link
            to={PATHS.HOME}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Trang chủ
          </Link>
          <span className="text-muted-foreground">/</span>
          <Link
            to={PATHS.NEWS}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Tin tức
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="line-clamp-1 font-medium text-primary">{post!.title}</span>
        </nav>

        {/* 2 cột: nội dung + sidebar */}
        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <div className="min-w-0">
            <BlogContent post={post!} />
          </div>

          <div className="lg:sticky lg:top-6 lg:self-start">
            {/* TODO: Khi BE có endpoint related blogs thì truyền relatedPosts prop */}
            <BlogSidebar relatedPosts={[]} />
          </div>
        </div>

        {/* Comments full width */}
        <BlogComments
          comments={comments}
          total={totalComments}
          isLoggedIn={isLoggedIn}
          blogId={blogId}
        />
      </main>
    </div>
  );
}
