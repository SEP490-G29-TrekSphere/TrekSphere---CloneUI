import { ChevronLeft, ChevronRight, Search, Star } from 'lucide-react';
import { useState } from 'react';
import { ROLES } from '@/constants';
import { useAdminReviewMutations } from '@/features/tours/hooks/useAdminReviewMutations';
import { useTourReviews } from '@/features/tours/hooks/useTourReviews';
import type { TourDetailFromApi } from '@/features/tours/types';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';

interface TourReviewsSectionProps {
  tour: TourDetailFromApi;
}

function StarRow({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'xs' }) {
  return (
    // `role="img"` + label: cả hàng sao là một hình ảnh duy nhất, trình đọc màn hình
    // đọc "4 trên 5 sao" thay vì năm icon rời rạc.
    <span role="img" aria-label={`${rating} trên 5 sao`} className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((step) => (
        <Star
          key={step}
          aria-hidden="true"
          className={cn(
            size === 'sm' ? 'h-4 w-4' : 'h-3.5 w-3.5',
            step <= rating ? 'fill-amber-400 text-amber-400' : 'text-border'
          )}
        />
      ))}
    </span>
  );
}

/**
 * Đánh giá cộng đồng: điểm trung bình + phân bố sao (meter) + bộ lọc + danh sách.
 *
 * Các meter phân bố theo sao là một dải liên tục trên cùng một hue — độ dài mỗi
 * vạch mang giá trị, không cần thêm màu khác.
 */
export function TourReviewsSection({ tour }: TourReviewsSectionProps) {
  const [ratingFilter, setRatingFilter] = useState<number | undefined>(undefined);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');

  const { data, isLoading } = useTourReviews(tour.tourId, {
    rating: ratingFilter,
    keyword: keyword || undefined,
    page,
    size: 5,
    sortBy,
    sortDir,
  });

  const rating = data?.averageRating ?? tour.averageRating ?? 0;
  const total = data?.totalReviews ?? tour.totalReviews ?? 0;
  const display = rating > 0 ? rating.toFixed(1) : '—';

  const starCounts = {
    5: data?.fiveStar ?? 0,
    4: data?.fourStar ?? 0,
    3: data?.threeStar ?? 0,
    2: data?.twoStar ?? 0,
    1: data?.oneStar ?? 0,
  };

  const reviewsList = data?.reviews?.content ?? [];
  const totalPages = data?.reviews?.totalPages ?? 0;
  const pageNumber = data?.reviews?.pageNumber ?? 0;

  const user = useAppStore((state) => state.user);
  const isAdmin = user?.roles?.includes(ROLES.ADMIN) ?? false;
  const { mutate: updateStatus } = useAdminReviewMutations(tour.tourId);

  function changeFilter(next: number | undefined) {
    setRatingFilter(next);
    setPage(0);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Tóm tắt: điểm trung bình bên trái, phân bố sao bên phải */}
      <div className="grid gap-6 rounded-2xl border border-border bg-card p-6 md:grid-cols-[240px_1fr]">
        <div className="flex flex-col items-center justify-center gap-2 border-b border-border pb-6 md:border-b-0 md:border-r md:pb-0 md:pr-6">
          <p className="text-5xl font-extrabold leading-none text-foreground">{display}</p>
          <span className="text-sm text-muted-foreground">/ 5</span>
          <StarRow rating={Math.round(rating)} />
          <p className="text-sm font-medium text-muted-foreground">
            {total > 0 ? `${total.toLocaleString('vi-VN')} đánh giá` : 'Chưa có đánh giá'}
          </p>
        </div>

        <div className="flex flex-col justify-center gap-2">
          {([5, 4, 3, 2, 1] as const).map((star) => {
            const count = starCounts[star];
            const percent = total > 0 ? (count / total) * 100 : 0;
            const isActive = ratingFilter === star;
            return (
              <button
                key={star}
                type="button"
                onClick={() => changeFilter(isActive ? undefined : star)}
                aria-pressed={isActive}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-2 py-1 text-left text-sm text-muted-foreground transition-colors hover:bg-muted/60',
                  isActive && 'bg-primary/5 font-semibold text-primary'
                )}
              >
                <span className="w-14 shrink-0">{star} sao</span>
                {/* Rãnh nền là chính hue của vạch dữ liệu ở sắc nhạt, không phải màu
                    khác — mắt đọc được tỉ lệ thay vì thấy hai hạng mục rời nhau. */}
                <span className="relative h-2 flex-1 overflow-hidden rounded-full bg-primary/15">
                  <span
                    className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </span>
                <span className="w-8 shrink-0 text-right tabular-nums">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bộ lọc: sao, từ khoá, sắp xếp */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => changeFilter(undefined)}
            className={cn(
              'rounded-full px-4 py-1.5 text-xs font-semibold transition-colors',
              ratingFilter === undefined
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/70'
            )}
          >
            Tất cả
          </button>
          {[5, 4, 3, 2, 1].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => changeFilter(ratingFilter === star ? undefined : star)}
              className={cn(
                'flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
                ratingFilter === star
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/70'
              )}
            >
              {star} <Star className="h-3 w-3 fill-current" aria-hidden="true" />
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder="Tìm kiếm đánh giá…"
              value={keyword}
              onChange={(event) => {
                setKeyword(event.target.value);
                setPage(0);
              }}
              className="w-full rounded-full border border-border bg-background py-2 pl-9 pr-4 text-sm focus:border-primary focus:outline-none sm:w-56"
            />
          </div>
          <select
            value={`${sortBy}-${sortDir}`}
            onChange={(event) => {
              const [field, dir] = event.target.value.split('-');
              setSortBy(field);
              setSortDir(dir);
              setPage(0);
            }}
            className="rounded-full border border-border bg-background px-3 py-2 text-xs font-medium text-muted-foreground focus:border-primary focus:outline-none"
          >
            <option value="createdAt-desc">Mới nhất</option>
            <option value="createdAt-asc">Cũ nhất</option>
            <option value="rating-desc">Đánh giá cao</option>
            <option value="rating-asc">Đánh giá thấp</option>
          </select>
        </div>
      </div>

      {/* Danh sách đánh giá */}
      {isLoading ? (
        <div className="flex items-center justify-center rounded-2xl border border-border bg-card py-14">
          <span className="text-sm text-muted-foreground">Đang tải đánh giá…</span>
        </div>
      ) : reviewsList.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card py-14 text-center">
          <Star className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">Không tìm thấy đánh giá nào.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {reviewsList.map((review) => (
            <li key={review.reviewId} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-start gap-3">
                {review.userAvatarUrl ? (
                  <img
                    src={review.userAvatarUrl}
                    alt=""
                    className="h-10 w-10 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground">
                    {review.userFullName?.charAt(0).toUpperCase() || 'U'}
                  </span>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-bold text-foreground">{review.userFullName}</p>
                    <time className="text-xs text-muted-foreground" dateTime={review.createdAt}>
                      {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                    </time>
                  </div>
                  <div className="mt-1">
                    <StarRow rating={review.rating} size="xs" />
                  </div>
                  {isAdmin && (
                    <p
                      className={cn(
                        'mt-1 w-fit rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                        review.status === 'APPROVED' && 'bg-primary/10 text-primary',
                        review.status === 'HIDDEN' && 'bg-destructive/10 text-destructive',
                        review.status === 'PENDING' && 'bg-muted text-muted-foreground'
                      )}
                    >
                      {review.status}
                    </p>
                  )}
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {review.content}
                  </p>

                  {isAdmin && (
                    <div className="mt-3 flex gap-2">
                      {review.status !== 'APPROVED' && (
                        <button
                          type="button"
                          onClick={() =>
                            updateStatus({ reviewId: review.reviewId, status: 'APPROVED' })
                          }
                          className="rounded-full border border-primary px-3.5 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                        >
                          Duyệt
                        </button>
                      )}
                      {review.status !== 'HIDDEN' && (
                        <button
                          type="button"
                          onClick={() =>
                            updateStatus({ reviewId: review.reviewId, status: 'HIDDEN' })
                          }
                          className="rounded-full border border-destructive px-3.5 py-1.5 text-xs font-bold text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground"
                        >
                          Ẩn
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Phân trang */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => pageNumber > 0 && setPage(pageNumber - 1)}
            disabled={pageNumber === 0}
            aria-label="Trang trước"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <span className="text-sm font-medium text-muted-foreground">
            Trang {pageNumber + 1} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => pageNumber < totalPages - 1 && setPage(pageNumber + 1)}
            disabled={pageNumber === totalPages - 1}
            aria-label="Trang sau"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
