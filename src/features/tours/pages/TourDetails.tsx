import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CancellationPolicyNotice } from '@/features/tours/components/CancellationPolicyNotice';
import {
  isBookableSchedule,
  SECTION_IDS,
  SECTION_SCROLL_OFFSET,
  sortSchedulesByDeparture,
  TourBookingRail,
  TourDetailError,
  TourDetailHero,
  TourDetailSkeleton,
  TourGallerySection,
  TourInclusionsSection,
  TourMobileBookingBar,
  TourNotFound,
  TourOverviewSection,
  TourReviewsSection,
  TourRouteSection,
  TourScheduleSection,
  type TourSection,
  TourSectionNav,
  TourStatsGrid,
  TourVendorCard,
} from '@/features/tours/components/tour-details';
import { useTourCheckpoints } from '@/features/tours/hooks/useTourCheckpoints';
import { useTourDetail } from '@/features/tours/hooks/useTourDetail';
import { useTourSchedules } from '@/features/tours/hooks/useTourSchedules';
import { useAppStore } from '@/store/useAppStore';

/** Thứ tự này phải khớp thứ tự các section trong DOM để scrollspy chạy đúng. */
const SECTIONS: TourSection[] = [
  { id: SECTION_IDS.overview, label: 'Tổng quan' },
  { id: SECTION_IDS.schedules, label: 'Lịch khởi hành' },
  { id: SECTION_IDS.route, label: 'Lộ trình' },
  { id: SECTION_IDS.inclusions, label: 'Bao gồm' },
  { id: SECTION_IDS.gallery, label: 'Hình ảnh' },
  { id: SECTION_IDS.policy, label: 'Chính sách' },
  { id: SECTION_IDS.reviews, label: 'Đánh giá' },
];

/** Tiêu đề chung cho mọi khối nội dung ở cột trái. */
function SectionHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-bold text-foreground md:text-2xl">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}

/**
 * Trang chi tiết tour — `GET /tours/{tourId}` cộng lịch khởi hành và checkpoint.
 *
 * Bố cục: hero → thanh nav dính theo section → hai cột, cột phải là thẻ đặt tour
 * dính theo màn hình. Trang chỉ giữ đúng một mẩu state dùng chung là lịch đang
 * chọn: danh sách lịch bên trái ghi vào, thẻ đặt tour bên phải và thanh mobile đọc
 * ra, nhờ vậy giá và ngày ở ba nơi luôn là một.
 */
export default function TourDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const user = useAppStore((state) => state.user);

  const { data: tour, isLoading, error, refetch, isFetching } = useTourDetail(id);
  const { data: apiSchedules } = useTourSchedules(id);
  const { data: checkpoints, isLoading: isLoadingCheckpoints } = useTourCheckpoints(id);

  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);

  // `GET /tours/{id}` đã kèm `schedules`, endpoint riêng chỉ để làm mới; ưu tiên
  // dữ liệu mới hơn nhưng vẫn có sẵn để render ngay lần đầu.
  const schedules = apiSchedules ?? tour?.schedules ?? [];

  const bookableSchedules = useMemo(
    () => sortSchedulesByDeparture(schedules.filter(isBookableSchedule)),
    [schedules]
  );

  const selectedSchedule =
    bookableSchedules.find((schedule) => schedule.scheduleId === selectedScheduleId) ?? null;

  /** Bấm "Ngày khởi hành" ở thẻ đặt tour → cuộn tới danh sách lịch bên trái. */
  function scrollToSchedules() {
    const target = document.getElementById(SECTION_IDS.schedules);
    if (!target) return;
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY - SECTION_SCROLL_OFFSET,
      behavior: 'smooth',
    });
  }

  if (isLoading) return <TourDetailSkeleton />;

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

  if (!tour) return <TourNotFound />;

  return (
    <div className="min-h-screen bg-background pt-16">
      <TourDetailHero tour={tour} />
      <TourSectionNav sections={SECTIONS} />

      <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 md:py-10">
        <div className="grid items-start gap-8 lg:grid-cols-[1fr_360px] lg:gap-10">
          {/* Cột trái — nội dung tour */}
          <div className="flex min-w-0 flex-col gap-10">
            <section
              id={SECTION_IDS.overview}
              style={{ scrollMarginTop: SECTION_SCROLL_OFFSET }}
              className="flex flex-col gap-5"
            >
              <TourStatsGrid tour={tour} />
              <TourOverviewSection tour={tour} />
            </section>

            <section id={SECTION_IDS.schedules} style={{ scrollMarginTop: SECTION_SCROLL_OFFSET }}>
              <SectionHeading
                title="Lịch khởi hành"
                description="Chọn một đợt để xem giá và số chỗ còn trống."
              />
              <TourScheduleSection
                schedules={schedules}
                selectedScheduleId={selectedScheduleId}
                onSelect={setSelectedScheduleId}
              />
            </section>

            <section id={SECTION_IDS.route} style={{ scrollMarginTop: SECTION_SCROLL_OFFSET }}>
              <SectionHeading
                title="Lộ trình"
                description="Các điểm dừng chính theo thứ tự di chuyển."
              />
              <TourRouteSection checkpoints={checkpoints} isLoading={isLoadingCheckpoints} />
            </section>

            <section id={SECTION_IDS.inclusions} style={{ scrollMarginTop: SECTION_SCROLL_OFFSET }}>
              <SectionHeading title="Bao gồm & không bao gồm" />
              <TourInclusionsSection tour={tour} />
            </section>

            <section id={SECTION_IDS.gallery} style={{ scrollMarginTop: SECTION_SCROLL_OFFSET }}>
              <SectionHeading title="Hình ảnh" />
              <TourGallerySection tour={tour} />
            </section>

            <section id={SECTION_IDS.policy} style={{ scrollMarginTop: SECTION_SCROLL_OFFSET }}>
              {/* Không đặt SectionHeading ở đây: CancellationPolicyNotice đã tự mang
                  tiêu đề của nó (dùng chung với màn Đặt tour) */}
              <CancellationPolicyNotice policies={tour.cancellationPolicies} />
            </section>

            <section id={SECTION_IDS.reviews} style={{ scrollMarginTop: SECTION_SCROLL_OFFSET }}>
              <SectionHeading title="Đánh giá cộng đồng" />
              <TourReviewsSection tour={tour} />
            </section>
          </div>

          {/* Cột phải — thẻ đặt tour dính, ẩn trên mobile vì đã có thanh đáy */}
          <aside className="hidden flex-col gap-5 lg:sticky lg:top-32 lg:flex">
            <TourBookingRail
              tour={tour}
              schedules={schedules}
              selectedSchedule={selectedSchedule}
              onPickSchedule={scrollToSchedules}
              isLoggedIn={!!user}
            />
            <TourVendorCard tour={tour} />
          </aside>
        </div>

        {/* Nhà tổ chức trên mobile: đặt cuối trang, sau khi đã đọc hết nội dung */}
        <div className="mt-10 lg:hidden">
          <TourVendorCard tour={tour} />
        </div>
      </div>

      <TourMobileBookingBar
        tour={tour}
        selectedSchedule={selectedSchedule}
        hasSchedules={bookableSchedules.length > 0}
        isLoggedIn={!!user}
      />
      {/* Chừa chỗ cho thanh đáy để không che mất nội dung cuối trang */}
      <div className="h-20 lg:hidden" aria-hidden="true" />
    </div>
  );
}
