import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PATHS } from '@/constants';
import type { BlogListItem } from '../types';

interface BlogSidebarProps {
  relatedPosts: BlogListItem[];
}

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Sidebar phải: 3 khối xếp dọc — Related / CTA / Newsletter.
 *
 * BE hiện không trả `related_blogs` trong detail → `relatedPosts` thường rỗng
 * hoặc được fill từ hook (xem useBlogRelated). Khi rỗng sẽ fallback text.
 */
export function BlogSidebar({ relatedPosts }: BlogSidebarProps) {
  return (
    <aside className="flex flex-col gap-6">
      {/* Related */}
      <section className="rounded-2xl bg-card p-5 shadow-sm">
        <h3 className="mb-4 text-base font-bold text-primary">Bài viết liên quan</h3>

        {relatedPosts.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có bài viết liên quan.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {relatedPosts.slice(0, 4).map((p) => (
              <li key={p.blogId}>
                <Link
                  to={PATHS.NEWS_DETAIL.replace(':blogId', p.blogId)}
                  className="flex items-start gap-3 group"
                >
                  <img
                    src={p.coverImageUrl}
                    alt={p.title}
                    loading="lazy"
                    className="h-16 w-16 shrink-0 rounded-xl object-cover"
                  />
                  <div className="flex flex-col gap-1">
                    <h4 className="line-clamp-2 text-sm font-semibold leading-snug text-primary transition-colors group-hover:text-primary-hover">
                      {p.title}
                    </h4>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(p.publishedAt)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* CTA */}
      <section className="rounded-2xl bg-primary p-6 text-white">
        <h3 className="text-lg font-bold leading-tight md:text-xl">
          Tham gia cộng đồng TrekSphere
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-white/85">
          Kết nối với hơn 10.000 trekker Việt Nam. Chia sẻ hành trình, nhận tips chuyên gia và đồng
          hành cùng nhau chinh phục đỉnh cao.
        </p>
        <Link
          to={PATHS.REGISTER}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-4 py-3 text-sm font-semibold text-primary transition-opacity hover:opacity-90"
        >
          Tham gia ngay
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* Newsletter */}
      <section className="rounded-2xl bg-muted p-5">
        <h3 className="text-base font-bold text-primary">Nhận bản tin Trek</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Đăng ký để nhận cẩm nang và tips trekking mới nhất mỗi tuần.
        </p>
        <form onSubmit={(e) => e.preventDefault()} className="mt-4 flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email của bạn"
            aria-label="Email"
            className="h-11 rounded-full bg-card px-4 text-sm text-primary outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30"
          />
          <button
            type="submit"
            className="h-11 rounded-full bg-primary text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Đăng ký
          </button>
        </form>
      </section>
    </aside>
  );
}
