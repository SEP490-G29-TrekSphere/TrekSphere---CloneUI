import { ChevronRight, Clock, MapPin, Mountain, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PATHS } from '@/constants';
import {
  DIFFICULTY_LABELS,
  DIFFICULTY_TAGS,
  handleImageFallback,
} from '@/features/tours/components/tour-details/shared';
import type { TourDetailFromApi } from '@/features/tours/types';

interface TourDetailHeroProps {
  tour: TourDetailFromApi;
}

/**
 * Hero của trang chi tiết tour: ảnh bìa + breadcrumb + tên tour + dải meta nhanh.
 *
 * Cao 60vh (không phải full-bleed) để phần nội dung phía dưới lộ ra ngay khi tải
 * trang — người dùng thấy được trang còn gì để đọc mà không cần cuộn mò.
 */
export function TourDetailHero({ tour }: TourDetailHeroProps) {
  const coverImage = tour.coverImageUrl || tour.images[0]?.imageUrl || null;
  const rating = tour.averageRating ?? 0;
  const nights = tour.durationDays > 1 ? `${tour.durationDays - 1} đêm` : '';

  return (
    <section
      className="relative h-[60vh] min-h-[420px] w-full overflow-hidden"
      aria-label={`Ảnh bìa tour ${tour.tourName}`}
    >
      {coverImage ? (
        <img
          src={coverImage}
          alt=""
          onError={handleImageFallback}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-primary" />
      )}

      {/* Lớp phủ tối dần về đáy để chữ trắng luôn đủ tương phản dù ảnh bìa sáng */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary-dark via-primary-dark/70 to-primary-dark/20" />

      <div className="absolute inset-0 flex flex-col justify-end">
        <div className="mx-auto w-full max-w-[1200px] px-4 pb-8 sm:px-6 md:pb-12">
          {/* Breadcrumb */}
          <nav aria-label="Đường dẫn" className="mb-4">
            <ol className="flex flex-wrap items-center gap-1 text-xs font-medium text-white/70">
              <li>
                <Link to={PATHS.HOME} className="transition-colors hover:text-white">
                  Trang chủ
                </Link>
              </li>
              <ChevronRight className="h-3 w-3" aria-hidden="true" />
              <li>
                <Link to={PATHS.TOURS} className="transition-colors hover:text-white">
                  Tour
                </Link>
              </li>
              <ChevronRight className="h-3 w-3" aria-hidden="true" />
              <li aria-current="page" className="max-w-[60vw] truncate text-white">
                {tour.tourName}
              </li>
            </ol>
          </nav>

          <span className="inline-block rounded-full bg-accent px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-accent-foreground">
            {DIFFICULTY_TAGS[tour.difficulty] ?? 'Cung đường huyền thoại'}
          </span>

          <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight text-white md:text-4xl lg:text-5xl">
            {tour.tourName}
          </h1>

          {/* Dải meta nhanh — nhắc lại các thông số quyết định ngay trên màn hình đầu */}
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/90">
            {rating > 0 && (
              <span className="flex items-center gap-1.5">
                <Star className="h-4 w-4 shrink-0 fill-amber-400 text-amber-400" />
                <span className="font-bold text-white">{rating.toFixed(1)}</span>
                <span className="text-white/70">({tour.totalReviews} đánh giá)</span>
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
              {tour.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
              {tour.durationDays} ngày {nights}
            </span>
            <span className="flex items-center gap-1.5">
              <Mountain className="h-4 w-4 shrink-0" aria-hidden="true" />
              {DIFFICULTY_LABELS[tour.difficulty] ?? tour.difficulty}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
