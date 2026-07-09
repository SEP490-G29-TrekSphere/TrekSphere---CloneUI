import { Lock } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PATHS } from '@/constants';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';
import { useCreateBlogComment } from '../hooks/useBlog';
import type { BlogCommentItem } from '../types';

interface BlogCommentsProps {
  comments: BlogCommentItem[];
  total?: number;
  isLoggedIn: boolean;
  /** ID bài viết — dùng để invalidate cache + gọi POST `/blogs/{id}/comments`. */
  blogId?: string;
}

const formatRelativeTime = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Vừa xong';
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay} ngày trước`;
  return date.toLocaleDateString('vi-VN');
};

/**
 * Khu vực bình luận.
 * - Nếu đã đăng nhập: hiển thị form nhập + danh sách comment + gọi API POST khi gửi.
 * - Nếu chưa đăng nhập: hiển thị comment + khóa form bên dưới.
 * - Hỗ trợ nested comments (replies) — render theo thứ tự cha → con.
 */
export function BlogComments({ comments, total, isLoggedIn, blogId }: BlogCommentsProps) {
  const user = useAppStore((state) => state.user);
  const [content, setContent] = useState('');
  const createMutation = useCreateBlogComment(blogId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) {
      toast.error('Vui lòng nhập nội dung bình luận.');
      return;
    }
    try {
      await createMutation.mutateAsync({ content: trimmed });
      setContent('');
      toast.success('Đã gửi bình luận.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gửi bình luận thất bại.');
    }
  };

  const count = total ?? comments.length;

  return (
    <section className="mt-12 border-t border-border pt-10">
      <h2 className="text-xl font-bold text-primary md:text-2xl">Bình luận ({count})</h2>

      <ul className="mt-6 flex flex-col gap-5">
        {comments.map((c) => (
          <CommentNode key={c.id} comment={c} depth={0} />
        ))}
      </ul>

      {/* Input box hoặc locked state */}
      <div className="mt-8">
        {isLoggedIn ? (
          <form onSubmit={handleSubmit} className="rounded-2xl bg-card p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="h-7 w-7 rounded-full object-cover"
                />
              ) : null}
              <span className="font-medium text-primary">{user?.name ?? 'Bạn'}</span>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Chia sẻ suy nghĩ của bạn..."
              rows={3}
              disabled={createMutation.isPending}
              className="w-full resize-none rounded-xl border border-border bg-background p-3 text-sm text-primary outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
            />
            <div className="mt-3 flex justify-end">
              <button
                type="submit"
                disabled={createMutation.isPending || content.trim().length === 0}
                className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {createMutation.isPending ? 'Đang gửi...' : 'Gửi bình luận'}
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col items-center rounded-2xl bg-muted px-6 py-10 text-center">
            <Lock className="mb-3 h-7 w-7 text-muted-foreground" />
            <p className="text-sm text-muted-foreground md:text-base">
              Vui lòng đăng nhập để bình luận. Tham gia cộng đồng để chia sẻ trải nghiệm của bạn.
            </p>
            <Link
              to={PATHS.LOGIN}
              className="mt-5 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Đăng nhập
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

/** Một node comment + danh sách reply đệ quy. */
function CommentNode({ comment, depth }: { comment: BlogCommentItem; depth: number }) {
  return (
    <li
      className="flex gap-4 rounded-2xl bg-card p-4 shadow-sm md:p-5"
      style={depth > 0 ? { marginLeft: `${Math.min(depth, 3) * 1.5}rem` } : undefined}
    >
      {comment.userAvatarUrl ? (
        <img
          src={comment.userAvatarUrl}
          alt={comment.userFullName}
          className="h-10 w-10 shrink-0 rounded-full object-cover md:h-12 md:w-12"
        />
      ) : (
        <div className="h-10 w-10 shrink-0 rounded-full bg-muted md:h-12 md:w-12" />
      )}
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-primary md:text-base">
            {comment.userFullName}
          </span>
          <span className="text-xs text-muted-foreground md:text-sm">
            {formatRelativeTime(comment.createdAt)}
          </span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-primary/90 md:text-base">
          {comment.content}
        </p>
        <button
          type="button"
          className="mt-2 text-xs font-semibold text-primary hover:underline md:text-sm"
        >
          Trả lời
        </button>

        {comment.replies && comment.replies.length > 0 && (
          <ul className="mt-4 flex flex-col gap-4">
            {comment.replies.map((reply) => (
              <CommentNode key={reply.id} comment={reply} depth={depth + 1} />
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}
