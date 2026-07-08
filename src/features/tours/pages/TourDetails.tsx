import {
  Banknote,
  CalendarDays,
  CheckCircle,
  ChevronLeft,
  Clock,
  MapPin,
  MessageCircle,
  Mountain,
  Shield,
  Star,
  Users,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTourDetail } from '@/features/tours/hooks/useTourDetail';
import type { TourDetailFromApi, TourDetailScheduleApi } from '@/features/tours/types';
import { useAppStore } from '@/store/useAppStore';

// ============================================================
// Helpers
// ============================================================

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80';

const DIFFICULTY_LABELS: Record<string, string> = {
  HARD: 'Khó',
  MODERATE: 'Trung bình',
  EASY: 'Dễ',
  EXPERT: 'Chuyên gia',
  BEGINNER: 'Mới bắt đầu',
};

const DIFFICULTY_TAGS: Record<string, string> = {
  HARD: 'CUNG ĐƯỜNG THÁCH THỨC',
  MODERATE: 'CUNG ĐƯỜNG TRUNG BÌNH',
  EASY: 'CUNG ĐƯỜNG DỄ',
  EXPERT: 'CUNG ĐƯỜNG CHUYÊN GIA',
  BEGINNER: 'CUNG ĐƯỜNG KHÁM PHÁ',
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN').format(price);
}

function formatDateVN(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/** Split a comma-separated API string into an array of trimmed items */
function splitField(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

// ============================================================
// Sub-components
// ============================================================

function TourDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Hero skeleton */}
      <div className="relative h-[500px] w-full animate-pulse bg-muted md:h-[600px]" />
      <div className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6">
        <div className="h-8 w-2/3 animate-pulse rounded-lg bg-muted" />
        <div className="mt-4 h-5 w-1/3 animate-pulse rounded bg-muted" />
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_340px]">
          <div className="flex flex-col gap-6">
            <div className="h-48 animate-pulse rounded-2xl bg-muted" />
            <div className="h-48 animate-pulse rounded-2xl bg-muted" />
          </div>
          <div className="h-80 animate-pulse rounded-2xl bg-muted" />
        </div>
      </div>
    </div>
  );
}

function TourDetailError({
  message,
  onRetry,
  isFetching,
}: {
  message: string;
  onRetry: () => void;
  isFetching?: boolean;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
        <XCircle className="h-10 w-10 text-destructive" />
      </div>
      <h1 className="mb-2 text-2xl font-bold text-foreground">Không thể tải tour</h1>
      <p className="mb-6 max-w-sm text-center text-muted-foreground">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        disabled={isFetching}
        className="rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {isFetching ? 'Đang tải lại...' : 'Thử lại'}
      </button>
    </div>
  );
}

function TourNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <Mountain className="mb-4 h-16 w-16 text-muted-foreground/50" />
      <h1 className="mb-2 text-2xl font-bold text-foreground">Không tìm thấy tour</h1>
      <p className="mb-6 text-muted-foreground">
        Tour bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
      </p>
      <Link
        to="/tours"
        className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        <ChevronLeft className="h-4 w-4" />
        Quay lại danh sách tour
      </Link>
    </div>
  );
}

/** The hero with cover image, gradient overlay, title, and quick meta */
function DetailHero({ tour }: { tour: TourDetailFromApi }) {
  const coverImage =
    tour.coverImageUrl || (tour.images.length > 0 ? tour.images[0].imageUrl : null);

  return (
    <section
      className="relative h-[500px] w-full overflow-hidden md:h-[600px]"
      aria-label={`Hình ảnh tour ${tour.tourName}`}
    >
      {coverImage ? (
        <img
          src={coverImage}
          alt={tour.tourName}
          onError={(e) => {
            if (e.currentTarget.src !== FALLBACK_IMAGE) {
              e.currentTarget.src = FALLBACK_IMAGE;
            }
          }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#1e3932]/95 via-[#1e3932]/50 to-[#1e3932]/15" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
        {/* Difficulty tag */}
        <span className="mb-3 inline-block w-fit rounded-sm bg-secondary/90 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary backdrop-blur-sm">
          {DIFFICULTY_TAGS[tour.difficulty] ?? 'CUNG ĐƯỜNG HUYỀN THOẠI'}
        </span>

        <h1 className="mb-5 max-w-3xl text-3xl font-bold leading-tight text-white md:text-4xl lg:text-5xl">
          {tour.tourName}
        </h1>

        {/* Quick stats row */}
        <div className="flex flex-wrap items-center gap-5 text-sm text-white/90 md:gap-8">
          {/* Difficulty */}
          <div className="flex items-center gap-2">
            <Mountain className="h-4 w-4 shrink-0" />
            <span>Độ khó</span>
            <span className="font-semibold">
              {DIFFICULTY_LABELS[tour.difficulty] ?? tour.difficulty}
            </span>
          </div>

          {/* Duration */}
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0" />
            <span>Thời gian</span>
            <span className="font-semibold">
              {tour.durationDays} ngày {tour.durationDays > 1 ? `${tour.durationDays - 1} đêm` : ''}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <Banknote className="h-4 w-4 shrink-0" />
            <span className="font-semibold">{formatPrice(tour.basePrice)} VND</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Login prompt banner for guests */
function MemberBanner({ isLoggedIn }: { isLoggedIn: boolean }) {
  if (isLoggedIn) return null;
  return (
    <div className="flex flex-col items-start gap-4 rounded-2xl border border-primary/15 bg-primary/5 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Shield className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-primary">Giá ưu đãi dành riêng cho thành viên</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Bạn cần đăng nhập để xem giá ưu đãi và đặt tour trực tiếp qua hệ thống
          </p>
        </div>
      </div>
      <Link
        to="/login"
        className="shrink-0 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Đăng nhập để đặt tour
      </Link>
    </div>
  );
}

/** Vendor sidebar card */
function VendorCard({ tour }: { tour: TourDetailFromApi }) {
  const includes = splitField(tour.includes);

  return (
    <aside className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Nhà cung cấp
      </h3>

      {/* Vendor identity */}
      <div className="flex items-center gap-3">
        {tour.vendorLogoUrl ? (
          <img
            src={tour.vendorLogoUrl}
            alt={tour.vendorName}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {tour.vendorName.charAt(0)}
          </div>
        )}
        <div>
          <p className="text-sm font-bold text-foreground">{tour.vendorName}</p>
          <p className="text-xs text-muted-foreground">
            <MapPin className="mr-0.5 inline h-3 w-3" />
            Đơn vị lữ hành uy tín
          </p>
        </div>
      </div>

      {/* Trust badges */}
      <ul className="flex flex-col gap-3 text-sm text-foreground/80">
        {includes.length > 0 &&
          includes.slice(0, 4).map((item) => (
            <li key={item} className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{item}</span>
            </li>
          ))}
        {includes.length === 0 && (
          <>
            <li className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>Hướng dẫn viên chuyên nghiệp</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>Bảo hiểm du lịch trọn gói</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>Chứng nhận hướng dẫn chuyên nghiệp</span>
            </li>
          </>
        )}
      </ul>

      {/* CTA */}
      <button
        type="button"
        className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        <MessageCircle className="h-4 w-4" />
        Chat với nhà cung cấp
      </button>

      <p className="text-center text-[11px] text-muted-foreground">Phản hồi trong vòng 30 phút</p>
    </aside>
  );
}

/** Itinerary section — builds day-by-day from the tour data */
function ItinerarySection({ tour }: { tour: TourDetailFromApi }) {
  const highlights = splitField(tour.highlights);
  const sortedImages = [...tour.images].sort((a, b) => a.sortOrder - b.sortOrder);

  // Group highlights into days (distribute evenly across durationDays)
  const days: { dayNum: number; title: string; items: string[]; images: typeof sortedImages }[] =
    [];

  for (let d = 0; d < tour.durationDays; d++) {
    const start = Math.floor((d * highlights.length) / tour.durationDays);
    const end = Math.floor(((d + 1) * highlights.length) / tour.durationDays);
    const dayHighlights = highlights.slice(start, end);

    // Assign images to days
    const imgStart = Math.floor((d * sortedImages.length) / tour.durationDays);
    const imgEnd = Math.floor(((d + 1) * sortedImages.length) / tour.durationDays);
    const dayImages = sortedImages.slice(imgStart, imgEnd);

    days.push({
      dayNum: d + 1,
      title:
        d === 0
          ? 'Khởi hành và khám phá'
          : d === tour.durationDays - 1
            ? 'Chinh phục đỉnh cao và trở về'
            : `Hành trình ngày ${d + 1}`,
      items: dayHighlights.length > 0 ? dayHighlights : ['Hành trình đang được cập nhật'],
      images: dayImages,
    });
  }

  return (
    <section>
      <h2 className="mb-6 text-xl font-bold text-foreground md:text-2xl">Lịch trình chi tiết</h2>

      <div className="relative flex flex-col gap-8 pl-8">
        {/* Vertical timeline line */}
        <div className="absolute bottom-0 left-3 top-0 w-px bg-border" aria-hidden="true" />

        {days.map((day) => (
          <div key={day.dayNum} className="relative">
            {/* Timeline dot */}
            <div className="absolute -left-8 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
              {day.dayNum}
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="text-base font-bold text-foreground">
                Ngày {day.dayNum}: {day.title}
              </h3>

              {/* Description / highlights */}
              <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                {day.items.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/40" />
                    {item}
                  </li>
                ))}
              </ul>

              {/* Day images */}
              {day.images.length > 0 && (
                <div className="mt-2 flex gap-3 overflow-x-auto pb-1">
                  {day.images.map((img) => (
                    <img
                      key={img.imageId}
                      src={img.imageUrl}
                      alt={img.caption || `Ngày ${day.dayNum}`}
                      onError={(e) => {
                        if (e.currentTarget.src !== FALLBACK_IMAGE) {
                          e.currentTarget.src = FALLBACK_IMAGE;
                        }
                      }}
                      className="h-28 w-40 shrink-0 rounded-xl object-cover shadow-sm sm:h-32 sm:w-48"
                      loading="lazy"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Tag pills from highlights */}
      {highlights.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {highlights.slice(0, 4).map((h) => (
            <span
              key={h}
              className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary"
            >
              {h}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}

/** Departure schedules section */
function ScheduleSection({ schedules }: { schedules: TourDetailScheduleApi[] }) {
  const openSchedules = schedules.filter((s) => s.status === 'OPEN');

  if (openSchedules.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center">
        <CalendarDays className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">Chưa có lịch khởi hành</p>
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Lịch khởi hành
      </h3>
      <div className="flex flex-col gap-3">
        {openSchedules.map((s) => {
          const remaining = Math.max(0, s.availableSlots - s.bookedSlots);
          return (
            <div
              key={s.scheduleId}
              className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm"
            >
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-bold text-primary">
                  {formatDateVN(s.departureDate)} — {formatDateVN(s.returnDate)}
                </span>
                <span className="inline-flex w-fit items-center gap-1 rounded-full bg-primary/5 px-2.5 py-0.5 text-[11px] font-medium text-primary">
                  <Users className="h-3 w-3" />
                  Còn {remaining}/{s.availableSlots} chỗ
                </span>
              </div>
              <div className="flex flex-col items-end justify-center">
                <span className="text-sm font-extrabold text-primary sm:text-base">
                  {formatPrice(s.price)}đ
                </span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  / người
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/** Excludes section */
function ExcludesSection({ excludes }: { excludes: string | null }) {
  const items = splitField(excludes);
  if (items.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 text-lg font-bold text-foreground">Không bao gồm</h2>
      <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive/60" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Reviews / community rating section */
function ReviewsSection({ tour }: { tour: TourDetailFromApi }) {
  const rating = tour.averageRating ?? 0;
  const total = tour.totalReviews;
  const display = rating > 0 ? rating.toFixed(1) : '—';

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-2">
        <Star className="h-5 w-5 text-amber-400" />
        <h2 className="text-lg font-bold text-foreground">Đánh giá cộng đồng</h2>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold text-foreground">{display}</span>
          <span className="text-sm text-muted-foreground">/5</span>
        </div>
        <div>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`h-4 w-4 ${s <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
              />
            ))}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {total > 0 ? `${total} đánh giá` : 'Chưa có đánh giá'}
          </p>
        </div>
      </div>

      {total === 0 && (
        <p className="mt-4 text-sm text-muted-foreground">
          Hãy là người đầu tiên đánh giá tour này!
        </p>
      )}
    </section>
  );
}

/** Image gallery with lightbox-style preview */
function ImageGallery({ tour }: { tour: TourDetailFromApi }) {
  const [selected, setSelected] = useState(0);
  const sortedImages = [...tour.images].sort((a, b) => a.sortOrder - b.sortOrder);

  if (sortedImages.length === 0) return null;

  return (
    <section>
      <h2 className="mb-4 text-xl font-bold text-foreground md:text-2xl">Hình ảnh</h2>

      {/* Main image */}
      <div className="relative mb-3 aspect-video w-full overflow-hidden rounded-2xl bg-muted">
        <img
          src={sortedImages[selected].imageUrl}
          alt={sortedImages[selected].caption || tour.tourName}
          onError={(e) => {
            if (e.currentTarget.src !== FALLBACK_IMAGE) {
              e.currentTarget.src = FALLBACK_IMAGE;
            }
          }}
          className="h-full w-full object-cover transition-opacity duration-300"
        />
        {sortedImages[selected].caption && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-4 pb-3 pt-8">
            <p className="text-sm text-white">{sortedImages[selected].caption}</p>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {sortedImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sortedImages.map((img, i) => (
            <button
              key={img.imageId}
              type="button"
              onClick={() => setSelected(i)}
              aria-current={i === selected ? 'true' : undefined}
              className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                i === selected
                  ? 'border-primary shadow-md'
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={img.imageUrl}
                alt={img.caption || `Ảnh ${i + 1}`}
                onError={(e) => {
                  if (e.currentTarget.src !== FALLBACK_IMAGE) {
                    e.currentTarget.src = FALLBACK_IMAGE;
                  }
                }}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

// ============================================================
// Page Component
// ============================================================

/**
 * Tour Details Page — fetches data from /api/v1/tours/{tourId}
 */
export default function TourDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const user = useAppStore((s) => s.user);
  const { data: tour, isLoading, error, refetch, isFetching } = useTourDetail(id);

  // Loading
  if (isLoading) {
    return <TourDetailSkeleton />;
  }

  // Error
  if (error) {
    return (
      <TourDetailError
        message={error.message || 'Đã xảy ra lỗi khi tải thông tin tour.'}
        onRetry={() => {
          if (!isFetching) refetch();
        }}
        isFetching={isFetching}
      />
    );
  }

  // Not found
  if (!tour) {
    return <TourNotFound />;
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Hero */}
      <DetailHero tour={tour} />

      {/* Main content */}
      <div className="mx-auto max-w-[1100px] px-4 py-8 sm:px-6 md:py-10">
        {/* Member banner */}
        <MemberBanner isLoggedIn={!!user} />

        {/* Two-column layout */}
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_340px]">
          {/* Left column — itinerary + content */}
          <div className="flex flex-col gap-10">
            {/* Tour description */}
            {tour.description && (
              <section>
                <h2 className="mb-3 text-xl font-bold text-foreground md:text-2xl">Giới thiệu</h2>
                <p className="leading-relaxed text-muted-foreground">{tour.description}</p>
              </section>
            )}

            {/* Day-by-day itinerary */}
            <ItinerarySection tour={tour} />

            {/* Image gallery */}
            <ImageGallery key={tour.tourId} tour={tour} />

            {/* Excludes */}
            <ExcludesSection excludes={tour.excludes} />
          </div>

          {/* Right column — vendor + schedule */}
          <div className="lg:sticky lg:top-24 flex flex-col gap-6 self-start">
            <VendorCard tour={tour} />
            <ScheduleSection schedules={tour.schedules} />
          </div>
        </div>

        {/* Reviews section — full width */}
        <div className="mt-12">
          <ReviewsSection tour={tour} />
        </div>
      </div>

      {/* Mobile booking bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <span className="text-xl font-bold text-primary">{formatPrice(tour.basePrice)}đ</span>
            <span className="text-sm text-muted-foreground">/ người</span>
          </div>
          {user ? (
            <button
              type="button"
              className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Đặt ngay
            </button>
          ) : (
            <Link
              to="/login"
              className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Đăng nhập
            </Link>
          )}
        </div>
      </div>

      {/* Spacer for mobile booking bar */}
      <div className="h-20 lg:hidden" aria-hidden="true" />
    </div>
  );
}
