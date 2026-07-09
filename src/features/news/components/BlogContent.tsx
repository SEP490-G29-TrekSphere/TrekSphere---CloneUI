import type { BlogPostDetail } from '../types';

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
  // Tách theo 1 hoặc nhiều dòng trống để giữ cấu trúc đoạn văn.
  const paragraphs = content
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <article className="flex flex-col gap-5 text-base leading-relaxed text-primary/90 md:text-lg">
      {paragraphs.length === 0 ? (
        <p className="italic text-muted-foreground">Nội dung đang được cập nhật.</p>
      ) : (
        paragraphs.map((p, idx) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: content thuần không có stable id
          <p key={`p-${idx}`}>{p}</p>
        ))
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
