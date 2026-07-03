import { Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PATHS } from '@/constants';
import type { BlogComment } from '../types';

interface BlogCommentsProps {
  comments: BlogComment[];
  isLoggedIn: boolean;
}

/**
 * Khu vực bình luận.
 * - Nếu đã đăng nhập: hiển thị form nhập + danh sách comment
 * - Nếu chưa đăng nhập: hiển thị comment + khóa form bên dưới
 */
export function BlogComments({ comments, isLoggedIn }: BlogCommentsProps) {
  return (
    <section className="mt-12 border-t border-border pt-10">
      <h2 className="text-xl font-bold text-primary md:text-2xl">Bình luận ({comments.length})</h2>

      <ul className="mt-6 flex flex-col gap-5">
        {comments.map((c) => (
          <li key={c.id} className="flex gap-4 rounded-2xl bg-card p-4 shadow-sm md:p-5">
            <img
              src={c.authorAvatar}
              alt={c.authorName}
              className="h-10 w-10 shrink-0 rounded-full object-cover md:h-12 md:w-12"
            />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-primary md:text-base">
                  {c.authorName}
                </span>
                <span className="text-xs text-muted-foreground md:text-sm">{c.postedAgoLabel}</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-primary/90 md:text-base">
                {c.content}
              </p>
              <button
                type="button"
                className="mt-2 text-xs font-semibold text-primary hover:underline md:text-sm"
              >
                Trả lời
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Input box hoặc locked state */}
      <div className="mt-8">
        {isLoggedIn ? (
          <form onSubmit={(e) => e.preventDefault()} className="rounded-2xl bg-card p-4 shadow-sm">
            <textarea
              placeholder="Chia sẻ suy nghĩ của bạn..."
              rows={3}
              className="w-full resize-none rounded-xl border border-border bg-background p-3 text-sm text-primary outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <div className="mt-3 flex justify-end">
              <button
                type="submit"
                className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Gửi bình luận
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
