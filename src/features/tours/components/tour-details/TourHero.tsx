import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { TourDetail } from '../../types';

interface TourHeroProps {
  tour: TourDetail;
  className?: string;
}

/**
 * Hero section with large tour image and gradient overlay
 * The hero is the thesis of the page - opening with the most characteristic image
 */
export function TourHero({ tour, className }: TourHeroProps) {
  return (
    <section
      className={cn(
        'relative h-[500px] w-full overflow-hidden rounded-2xl md:h-[600px]',
        className
      )}
      aria-label={`Hình ảnh tour ${tour.name}`}
    >
      {/* Background image with gradient overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${tour.image}')` }}
        role="img"
        aria-label={tour.name}
      />

      {/* Gradient overlay for text readability */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to top, rgba(31, 57, 51, 0.95) 0%, rgba(31, 57, 51, 0.6) 40%, rgba(31, 57, 51, 0.2) 100%)',
        }}
      />

      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
        {/* Badge */}
        {tour.badge && (
          <Badge
            variant="secondary"
            className="mb-4 w-fit bg-secondary/90 text-primary backdrop-blur-sm"
          >
            {tour.badge}
          </Badge>
        )}

        {/* Title and location */}
        <div className="max-w-3xl">
          <p className="mb-2 flex items-center gap-2 text-sm font-medium text-secondary-foreground/80 md:text-base">
            <svg
              className="size-4 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {tour.location}
          </p>

          <h1 className="mb-4 font-heading-section text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            {tour.name}
          </h1>

          {/* Quick stats */}
          <div className="flex flex-wrap items-center gap-4 md:gap-6">
            {/* Duration */}
            <div className="flex items-center gap-2 text-sm text-white/90">
              <svg
                className="size-5 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{tour.duration}</span>
            </div>

            {/* Level */}
            <div className="flex items-center gap-2 text-sm text-white/90">
              <svg
                className="size-5 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span>Cấp độ: {tour.level}</span>
            </div>

            {/* Group size */}
            {tour.groupSize && (
              <div className="flex items-center gap-2 text-sm text-white/90">
                <svg
                  className="size-5 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span>{tour.groupSize}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rating badge - floating top right */}
      <div className="absolute right-6 top-6 rounded-xl bg-white/95 px-4 py-2 shadow-lg backdrop-blur-sm md:right-10 md:top-10">
        <div className="flex items-center gap-2">
          <svg
            className="size-5 shrink-0 text-yellow-500"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <div className="text-sm font-semibold text-foreground">{tour.rating.toFixed(1)}</div>
          <div className="text-xs text-muted-foreground">
            ({tour.reviewCount.toLocaleString('vi-VN')} đánh giá)
          </div>
        </div>
      </div>
    </section>
  );
}

export default TourHero;
