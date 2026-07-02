import { Link } from 'react-router-dom';
import type { Tour } from '@/features/tours/types';
import { AppBadge } from '@/shared/ui';

interface TourCardProps {
  tour: Tour;
  variant?: 'list' | 'grid';
  className?: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className="w-3.5 h-3.5"
          viewBox="0 0 24 24"
          fill={star <= Math.round(rating) ? '#F59E0B' : 'none'}
          stroke={star <= Math.round(rating) ? '#F59E0B' : '#9CA3AF'}
          strokeWidth={1.5}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      <span className="ml-1 text-sm font-semibold text-primary">{rating.toFixed(1)}</span>
    </div>
  );
}

function TourCard({ tour, variant = 'list', className = '' }: TourCardProps) {
  if (variant === 'grid') {
    return (
      <article
        className={`group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${className}`}
      >
        <div className="relative aspect-4/3 overflow-hidden">
          <img
            src={tour.image}
            alt={tour.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {tour.badge && (
            <div className="absolute left-3 top-3">
              <AppBadge variant="accent" className="shadow-sm">
                {tour.badge}
              </AppBadge>
            </div>
          )}
          {tour.isNew && !tour.badge && (
            <div className="absolute left-3 top-3">
              <AppBadge variant="secondary" className="shadow-sm">
                Mới
              </AppBadge>
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        </div>

        <div className="flex flex-1 flex-col p-4">
          <div className="mb-2 flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-base font-semibold leading-snug text-primary">
              {tour.name}
            </h3>
          </div>

          <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
            <svg
              className="w-4 h-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
              />
            </svg>
            <span className="truncate">{tour.location}</span>
          </div>

          <div className="mb-3 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {tour.duration}
            </span>
            <span className="flex items-center gap-1">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                />
              </svg>
              {tour.maxParticipants} người
            </span>
          </div>

          <div className="mb-4">
            <StarRating rating={tour.rating} />
            <span className="text-xs text-muted-foreground">
              ({tour.reviewCount.toLocaleString()} đánh giá)
            </span>
          </div>

          <div className="mt-auto flex items-end justify-between gap-2">
            <div>
              {tour.originalPrice && (
                <span className="text-xs text-muted-foreground line-through">
                  {tour.originalPrice}
                </span>
              )}
              <p className="text-xl font-bold text-primary">{tour.price}</p>
            </div>
            <Link
              to={`/tours/${tour.slug}`}
              className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
            >
              Chi tiết
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      className={`group flex gap-4 overflow-hidden rounded-2xl bg-white p-3 shadow-sm transition-all duration-300 hover:shadow-md sm:p-4 ${className}`}
    >
      <div className="relative w-32 shrink-0 overflow-hidden rounded-xl sm:w-40">
        <img
          src={tour.image}
          alt={tour.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {tour.badge && (
          <div className="absolute left-2 top-2">
            <AppBadge variant="accent" className="text-[10px] px-1.5 py-0.5">
              {tour.badge}
            </AppBadge>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between py-1">
        <div>
          <div className="mb-1 flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 text-base font-semibold leading-snug text-primary sm:text-lg">
              {tour.name}
            </h3>
            <StarRating rating={tour.rating} />
          </div>

          <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground sm:text-sm">
            <span className="flex items-center gap-1">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                />
              </svg>
              {tour.location}
            </span>
            <span className="flex items-center gap-1">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {tour.duration}
            </span>
            <span className="flex items-center gap-1">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                />
              </svg>
              {tour.level}
            </span>
          </div>

          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
            {tour.description}
          </p>
        </div>

        <div className="mt-3 flex items-end justify-between gap-2">
          <div className="flex flex-col">
            {tour.originalPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {tour.originalPrice}
              </span>
            )}
            <p className="text-lg font-bold text-primary sm:text-xl">{tour.price}</p>
          </div>
          <div className="flex gap-2">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
              {tour.reviewCount.toLocaleString()}
            </span>
            <Link
              to={`/tours/${tour.slug}`}
              className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary/90 sm:text-sm"
            >
              Chi tiết
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

export default TourCard;
