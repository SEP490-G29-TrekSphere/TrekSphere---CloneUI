import { ArrowRight, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PATHS } from '@/constants';
import type { BlogPost } from '../types';

interface BlogCardProps {
  post: BlogPost;
}

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/**
 * Thẻ bài viết: ảnh full-width phía trên + badge category + meta + title + excerpt + ĐỌC THÊM.
 */
export function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl bg-card shadow-sm transition-shadow hover:shadow-md">
      {/* Cover image full-width — wrapper có height cố định, bg-muted làm fallback khi ảnh lỗi */}
      <Link
        to={PATHS.NEWS_DETAIL.replace(':slug', post.slug)}
        className="relative block h-48 overflow-hidden bg-muted md:h-56"
        aria-label={post.title}
      >
        <img
          src={post.coverImage}
          alt={post.title}
          loading="lazy"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.opacity = '0';
          }}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />

        {/* Category badge */}
        <span className="absolute left-4 top-4 inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primary shadow-sm">
          {post.categoryLabel}
        </span>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        {/* Author meta */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <User className="h-3.5 w-3.5" />
          <span className="font-medium text-primary/80">{post.author.name}</span>
          <span aria-hidden>•</span>
          <span>{formatDate(post.publishedAt)}</span>
        </div>

        {/* Title */}
        <h3 className="mt-3 line-clamp-2 text-base font-bold leading-snug text-primary md:text-lg">
          <Link
            to={PATHS.NEWS_DETAIL.replace(':slug', post.slug)}
            className="transition-colors hover:text-primary-hover"
          >
            {post.title}
          </Link>
        </h3>

        {/* Excerpt */}
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {post.excerpt}
        </p>

        {/* CTA */}
        <Link
          to={PATHS.NEWS_DETAIL.replace(':slug', post.slug)}
          className="mt-auto inline-flex w-fit items-center gap-1 pt-4 text-xs font-bold uppercase tracking-wider text-primary transition-opacity hover:opacity-80"
        >
          Đọc thêm
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}
