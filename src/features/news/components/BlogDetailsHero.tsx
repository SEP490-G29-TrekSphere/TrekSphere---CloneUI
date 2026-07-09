import type { BlogPostDetail } from '../types';

interface BlogDetailsHeroProps {
  post: BlogPostDetail;
}

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Hero của trang chi tiết: full-screen ngang, ảnh nền + gradient overlay,
 * nội dung nằm ở góc dưới bên trái (badge, title, meta).
 */
export function BlogDetailsHero({ post }: BlogDetailsHeroProps) {
  return (
    <section
      className="relative flex h-[60vh] min-h-[420px] w-full items-end px-4 py-10 sm:px-6 md:h-[70vh]"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(6,38,29,0.05) 0%, rgba(6,38,29,0.6) 60%, rgba(6,38,29,0.95) 100%), url(${post.coverImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="mx-auto w-full max-w-[1200px]">
        {post.categoryName ? (
          <span className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary shadow-sm">
            {post.categoryName}
          </span>
        ) : null}

        <h1 className="mt-4 max-w-3xl text-2xl font-bold leading-tight text-white sm:text-3xl md:text-4xl lg:text-5xl">
          {post.title}
        </h1>

        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-white/90">
          {post.authorAvatarUrl ? (
            <img
              src={post.authorAvatarUrl}
              alt={post.authorName}
              className="h-9 w-9 rounded-full border-2 border-white/40 object-cover"
            />
          ) : null}
          <span className="font-medium text-white">{post.authorName}</span>
          <span aria-hidden>•</span>
          <span>{formatDate(post.publishedAt)}</span>
          <span aria-hidden>•</span>
          <span>{post.readingTimeMinutes} phút đọc</span>
        </div>
      </div>
    </section>
  );
}
