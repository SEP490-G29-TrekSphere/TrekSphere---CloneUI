import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { TourDetail } from '../../types';
import { levelBadgeVariants } from '../../types';

interface TourInfoCardProps {
  tour: TourDetail;
  className?: string;
}

/**
 * Compact info bar with key tour stats and pricing
 * Sits below the hero section to summarize essential info
 */
export function TourInfoCard({ tour, className }: TourInfoCardProps) {
  return (
    <section
      className={cn('rounded-2xl border border-border bg-card p-6 shadow-sm', className)}
      aria-label="Thông tin tour"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left side - Basic info */}
        <div className="flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge variant={levelBadgeVariants[tour.level]} className="text-xs">
              {tour.level}
            </Badge>
            {tour.tourOperator && (
              <span className="text-xs text-muted-foreground">Bởi {tour.tourOperator}</span>
            )}
          </div>

          <h2 className="mb-2 font-heading-section text-2xl font-bold text-foreground md:text-3xl">
            {tour.name}
          </h2>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            {/* Location */}
            <div className="flex items-center gap-1.5">
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
              <span>{tour.location}</span>
            </div>

            {/* Duration */}
            <div className="flex items-center gap-1.5">
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{tour.duration}</span>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1.5">
              <svg
                className="size-4 shrink-0 text-yellow-500"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-medium text-foreground">{tour.rating.toFixed(1)}</span>
              <span className="text-muted-foreground">
                ({tour.reviewCount.toLocaleString('vi-VN')} đánh giá)
              </span>
            </div>
          </div>
        </div>

        {/* Divider for desktop */}
        <div className="hidden h-16 w-px bg-border lg:block" aria-hidden="true" />

        {/* Right side - Pricing */}
        <div className="flex flex-col items-stretch gap-2 lg:items-end">
          <div className="flex items-baseline gap-3">
            {tour.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {tour.originalPrice}
              </span>
            )}
            <span className="text-2xl font-bold text-primary md:text-3xl">{tour.price}</span>
            <span className="text-sm text-muted-foreground">/ người</span>
          </div>

          {tour.originalPrice && (
            <Badge variant="destructive" className="text-xs">
              Tiết kiệm{' '}
              {Math.round(
                (parseFloat(tour.originalPrice.replace(/\D/g, '')) -
                  parseFloat(tour.price.replace(/\D/g, ''))) /
                  1000
              )}
              .000đ
            </Badge>
          )}

          <p className="text-xs text-muted-foreground">{tour.maxParticipants} chỗ trống còn lại</p>
        </div>
      </div>
    </section>
  );
}

export default TourInfoCard;
