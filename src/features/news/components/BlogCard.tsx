import { Link } from 'react-router-dom';
import { PATHS } from '@/constants';
import { stripHtml } from '@/utils/sanitize';
import type { BlogListItem } from '../types';

interface BlogCardProps {
  post: BlogListItem;
}

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/**
 * Thẻ bài viết: ảnh full-width phía trên + badge category + meta + title + excerpt + ĐỌC THÊM.
 * Field shape lấy từ BlogListItem (BE GET /blogs response).
 * Điều hướng chi tiết qua `PATHS.NEWS_DETAIL` (định dạng `/news/:blogId`).
 */
export function BlogCard({ post }: BlogCardProps) {
  const detailLink = PATHS.NEWS_DETAIL.replace(':blogId', post.blogId);

  return (
    <article className="tour-card flex h-full flex-col">
      {/* Cover image full-width */}
      <Link
        to={detailLink}
        className="tour-image-wrapper relative block h-48 md:h-56 overflow-hidden bg-muted"
        aria-label={post.title}
      >
        <img
          src={post.coverImageUrl}
          alt={post.title}
          loading="lazy"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.opacity = '0';
          }}
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
        />

        {/* Category badge */}
        {post.categoryName ? (
          <span className="absolute left-4 top-4 inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primary shadow-sm">
            {post.categoryName}
          </span>
        ) : null}
      </Link>

      {/* Content */}
      <div className="tour-content-wrapper flex flex-1 flex-col p-5 gap-3">
        {/* Author meta */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {post.authorAvatarUrl ? (
            <img
              src={post.authorAvatarUrl}
              alt={post.authorName}
              className="h-5 w-5 rounded-full object-cover"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold">
              {post.authorName?.[0] || 'U'}
            </div>
          )}
          <span className="font-semibold text-primary/80">{post.authorName}</span>
          <span aria-hidden>•</span>
          <span>{formatDate(post.publishedAt)}</span>
        </div>

        {/* Title */}
        <h3 className="line-clamp-2 text-base font-bold leading-snug text-primary transition-colors hover:text-primary/80 md:text-lg">
          <Link to={detailLink}>{post.title}</Link>
        </h3>

        {/* Excerpt */}
        <p className="line-clamp-3 text-xs md:text-sm leading-relaxed text-muted-foreground flex-1">
          {stripHtml(post.excerpt)}
        </p>

        {/* CTA */}
        <Link
          to={detailLink}
          className="mt-auto w-fit px-5 py-2 rounded-full text-xs font-semibold text-white bg-primary hover:opacity-90 transition-opacity cursor-pointer"
        >
          Đọc thêm
        </Link>
      </div>
    </article>
  );
}
