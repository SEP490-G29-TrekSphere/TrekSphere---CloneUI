import { Clock, MapPin, Star } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Tour } from '@/features/tours/types';
import { cn } from '@/lib/utils';

interface TourCardProps {
  tour: Tour;
  className?: string;
  layout?: 'list' | 'grid';
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

function LevelBadge({ level, className = '' }: { level: string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white shadow-sm',
        level === 'Dễ' && 'bg-emerald-500/90',
        level === 'Trung bình' && 'bg-zinc-500/90',
        level === 'Khó' && 'bg-primary/95',
        level === 'Khám phá' && 'bg-rose-500/90',
        className
      )}
    >
      {level === 'Khám phá' ? 'Cực khó' : level}
    </span>
  );
}

function formatTourPrice(basePrice: number | undefined, priceStr: string): string {
  if (basePrice !== undefined) {
    return new Intl.NumberFormat('vi-VN').format(basePrice);
  }
  return priceStr.replace('đ', '').trim();
}

/**
 * TourCard — supports horizontal 'list' and vertical 'grid' layouts.
 * Styled to match the premium TrekSphere visual mockup.
 */
export default function TourCard({ tour, className = '', layout = 'list' }: TourCardProps) {
  const [imgSrc, setImgSrc] = useState(tour.image);
  const formattedPrice = formatTourPrice(tour.basePrice, tour.price);

  if (layout === 'grid') {
    return (
      <article
        className={cn(
          'group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition-all hover:shadow-md',
          className
        )}
      >
        {/* Image on top */}
        <Link
          to={`/tours/${tour.slug}`}
          className="relative block aspect-[4/3] w-full overflow-hidden bg-muted"
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
          {tour.level && (
            <LevelBadge level={tour.level} className="absolute right-3 top-3 backdrop-blur-xs" />
          )}
        </Link>

        {/* Content body */}
        <div className="flex flex-1 flex-col justify-between p-4">
          <div className="flex flex-col gap-2">
            <Link to={`/tours/${tour.slug}`}>
              <h3 className="line-clamp-2 text-base font-bold text-primary transition-colors group-hover:text-primary-hover min-h-[2.75rem]">
                {tour.name}
              </h3>
            </Link>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/70" />
              <span className="truncate">{tour.location || 'Việt Nam'}</span>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
              <StarRating rating={tour.rating} reviewCount={tour.reviewCount} />
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-primary/70" />
                <span>{tour.duration}</span>
              </span>
            </div>
          </div>

          {/* Price & CTA at bottom */}
          <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Từ
              </span>
              <p className="text-sm font-extrabold text-primary sm:text-base">
                {formattedPrice} VND
              </p>
            </div>
            <Link
              to={`/tours/${tour.slug}`}
              className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-white transition-all hover:bg-primary-hover"
            >
              Chi tiết
            </Link>
          </div>
        </div>
      </article>
    );
  }

  // Default List Layout
  return (
    <article
      className={cn(
        'group flex flex-col gap-4 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/5 transition-all hover:shadow-md sm:flex-row sm:items-stretch sm:gap-5 sm:p-4',
        className
      )}
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
        {tour.level && <LevelBadge level={tour.level} className="absolute right-2 top-2" />}
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
              <Clock className="h-3.5 w-3.5 text-primary/70" />
              <span>{tour.duration}</span>
            </span>
          </div>
        </div>

        <div className="mt-1">
          <Link
            to={`/tours/${tour.slug}`}
            className="inline-flex items-center justify-center rounded-full border-2 border-primary px-4 py-1.5 text-xs font-semibold text-primary transition-all hover:bg-primary hover:text-white sm:text-sm"
          >
            Chi tiết
          </Link>
        </div>
      </div>

      {/* Price on right */}
      <div className="flex shrink-0 flex-row items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-center sm:gap-1 sm:py-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-xs">
          Từ
        </span>
        <p className="text-base font-bold text-primary sm:text-xl lg:text-2xl">
          {formattedPrice} VND
        </p>
      </div>
    </article>
  );
}
