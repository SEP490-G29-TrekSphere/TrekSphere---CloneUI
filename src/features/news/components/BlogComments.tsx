import { Flag, Lock } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PATHS } from '@/constants';
import { ReportModal } from '@/shared/ui';
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
  const [content, setContent] = useState('');
  const createMutation = useCreateBlogComment(blogId);

  const [reportingComment, setReportingComment] = useState<BlogCommentItem | null>(null);

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
    <section className="mt-12 rounded-3xl bg-[#FAF9F5] p-6 sm:p-8 border border-[#E5E4DE]">
      <h2 className="text-xl font-bold text-[#0B3025] sm:text-2xl">Bình luận ({count})</h2>

      {/* Form bình luận */}
      {isLoggedIn ? (
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
          <textarea
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Viết bình luận của bạn..."
            className="w-full rounded-2xl border border-[#DCD9CF] bg-white p-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#0B3025]"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="rounded-full bg-[#0B3025] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#08241C] transition-all disabled:opacity-50"
            >
              {createMutation.isPending ? 'Đang gửi...' : 'Gửi bình luận'}
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-6 flex items-center justify-between rounded-2xl bg-amber-50 p-4 border border-amber-200">
          <div className="flex items-center gap-3">
            <Lock className="size-5 text-amber-600" />
            <span className="text-sm font-semibold text-amber-900">
              Vui lòng đăng nhập để tham gia bình luận
            </span>
          </div>
          <Link
            to={PATHS.LOGIN}
            className="rounded-full bg-amber-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-amber-700"
          >
            Đăng nhập
          </Link>
        </div>
      )}

      {/* Danh sách bình luận */}
      {comments.length > 0 ? (
        <ul className="mt-8 flex flex-col gap-4">
          {comments.map((comment) => (
            <CommentNode
              key={comment.id}
              comment={comment}
              depth={0}
              onReport={(c) => setReportingComment(c)}
            />
          ))}
        </ul>
      ) : (
        <p className="mt-6 text-center text-sm text-zinc-500 font-medium">Chưa có bình luận nào.</p>
      )}

      {/* Modal Báo cáo Comment */}
      {reportingComment && (
        <ReportModal
          isOpen={Boolean(reportingComment)}
          onClose={() => setReportingComment(null)}
          targetId={reportingComment.id}
          targetType="COMMENT"
          targetTitle={reportingComment.content}
        />
      )}
    </section>
  );
}

/** Một node comment + danh sách reply đệ quy. */
function CommentNode({
  comment,
  depth,
  onReport,
}: {
  comment: BlogCommentItem;
  depth: number;
  onReport: (comment: BlogCommentItem) => void;
}) {
  return (
    <li
      className="flex gap-4 rounded-2xl bg-white p-4 shadow-sm border border-[#E5E4DE] md:p-5"
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
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-primary md:text-base">
              {comment.userFullName}
            </span>
            <span className="text-xs text-muted-foreground md:text-sm">
              {formatRelativeTime(comment.createdAt)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onReport(comment)}
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-red-600 transition-colors"
            title="Báo cáo bình luận"
          >
            <Flag className="size-3.5" />
            <span>Báo cáo</span>
          </button>
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
              <CommentNode key={reply.id} comment={reply} depth={depth + 1} onReport={onReport} />
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}
