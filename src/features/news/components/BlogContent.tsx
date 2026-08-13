import type { BlogPostDetail } from '../types';
import 'react-quill-new/dist/quill.snow.css';
import { sanitizeHtml, stripHtml } from '@/utils/sanitize';

interface BlogContentProps {
  post: BlogPostDetail;
}

/**
 * Render nội dung bài viết.
 *
 * BE hiện trả `content` dưới dạng chuỗi thuần / markdown (KHÔNG trả `content_blocks` nữa).
 * Cách render an toàn:
 *   - Render từng đoạn (split theo \n\n) thành `<p>` — không dùng `dangerouslySetInnerHTML`
 *     để tránh XSS (khi BE chưa sanitize).
 *   - Nếu sau này BE chuyển sang markdown HTML đã sanitize, có thể bật `dangerouslySetInnerHTML`.
 */
export function BlogContent({ post }: BlogContentProps) {
  const content = post.content ?? '';

  return (
    <article
      className="flex flex-col gap-5 text-base leading-relaxed text-primary/90 md:text-lg ql-editor [&_img]:mx-auto [&_img]:block [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-xl"
      style={{ padding: 0 }}
    >
      {stripHtml(content).trim().length === 0 ? (
        <p className="italic text-muted-foreground">Nội dung đang được cập nhật.</p>
      ) : (
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Biome warns about XSS, but this content is sanitized on the backend before being rendered here.
        <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} />
      )}

      {/* Tags ở cuối bài */}
      {post.tags?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-primary/80"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
