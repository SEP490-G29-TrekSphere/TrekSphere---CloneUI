import { CalendarDays, MapPin, Star } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Tour } from '@/features/tours/types';

interface TourCardProps {
  tour: Tour;
  className?: string;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80';

function StarRating({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  const display = rating > 0 ? rating.toFixed(1) : '—';
  return (
    <div className="flex items-center gap-1.5">
      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
      <span className="text-sm font-bold text-primary">
        {display}
        {rating > 0 && (
          <span className="ml-1 text-xs font-normal text-muted-foreground">
            ({reviewCount.toLocaleString('vi-VN')} đánh giá)
          </span>
        )}
      </span>
    </div>
  );
}

/**
 * TourCard — horizontal "list" layout used on the redesigned List Tours page.
 *
 * Layout: image on the left, content (title, meta, level badge, CTA) on the
 * middle, price on the right. Matches the reference image.
 */
export default function TourCard({ tour, className = '' }: TourCardProps) {
  const [imgSrc, setImgSrc] = useState(tour.image);
  return (
    <article
      className={`group flex flex-col gap-4 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/5 transition-all hover:shadow-md sm:flex-row sm:items-stretch sm:gap-5 sm:p-4 ${className}`}
    >
      {/* Image */}
      <Link
        to={`/tours/${tour.slug}`}
        className="relative block h-44 w-full shrink-0 overflow-hidden rounded-xl bg-muted sm:h-auto sm:w-[200px] lg:w-[220px]"
      >
        <img
          src={imgSrc}
          alt={tour.name}
          onError={() => {
            if (imgSrc !== FALLBACK_IMAGE) setImgSrc(FALLBACK_IMAGE);
          }}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {tour.badge && (
          <span className="absolute left-2 top-2 inline-flex items-center rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold text-white shadow-sm">
            {tour.badge}
          </span>
        )}
      </Link>

      {/* Middle content */}
      <div className="flex flex-1 flex-col justify-between gap-2 sm:py-1">
        <div className="flex flex-col gap-2">
          <Link to={`/tours/${tour.slug}`}>
            <h3 className="line-clamp-1 text-base font-bold text-primary transition-colors group-hover:text-primary-hover sm:text-lg">
              {tour.name}
            </h3>
          </Link>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/70" />
            <span className="truncate">{tour.location || 'Việt Nam'}</span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground sm:text-sm">
            <StarRating rating={tour.rating} reviewCount={tour.reviewCount} />
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-primary/70" />
              <span>{tour.duration}</span>
            </span>
            <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/5 px-2.5 py-0.5 text-[11px] font-semibold text-primary sm:text-xs">
              {tour.level}
            </span>
          </div>
        </div>

        <div className="mt-1">
          <Link
            to={`/tours/${tour.slug}`}
            className="inline-flex items-center justify-center rounded-full border-2 border-primary px-4 py-1.5 text-xs font-semibold text-primary transition-all hover:bg-primary hover:text-white sm:text-sm"
          >
            Xem chi tiết
          </Link>
        </div>
      </div>

      {/* Price on right */}
      <div className="flex shrink-0 flex-row items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-center sm:gap-1 sm:py-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-xs">
          Giá từ
        </span>
        <p className="text-base font-bold text-rose-500 sm:text-xl lg:text-2xl">{tour.price}</p>
      </div>
    </article>
  );
}
