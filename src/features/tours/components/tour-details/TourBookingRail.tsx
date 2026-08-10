import { CalendarDays, ChevronDown, Lock, ShieldCheck, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getBookTourPath, PATHS } from '@/constants';
import {
  isBookableSchedule,
  remainingSlots,
  SECTION_IDS,
  SECTION_SCROLL_OFFSET,
  sortSchedulesByDeparture,
} from '@/features/tours/components/tour-details/shared';
import type { TourDetailFromApi, TourDetailScheduleApi } from '@/features/tours/types';
import { formatDate, formatPrice } from '@/utils/format';

interface TourBookingRailProps {
  tour: TourDetailFromApi;
  schedules: TourDetailScheduleApi[];
  selectedSchedule: TourDetailScheduleApi | null;
  onPickSchedule: () => void;
  isLoggedIn: boolean;
}

/**
 * Thẻ đặt tour dính ở cột phải — nơi duy nhất trên trang chốt hành động.
 *
 * Giá hiển thị bám theo lịch đang chọn (giá mỗi lịch có thể khác `basePrice`), nên
 * con số ở đây luôn khớp với con số người dùng sẽ thấy ở bước thanh toán.
 */
export function TourBookingRail({
  tour,
  schedules,
  selectedSchedule,
  onPickSchedule,
  isLoggedIn,
}: TourBookingRailProps) {
  const bookable = sortSchedulesByDeparture(schedules.filter(isBookableSchedule));
  const hasSchedules = bookable.length > 0;
  const price = selectedSchedule?.price ?? tour.basePrice;
  const bookingPath = selectedSchedule
    ? `${getBookTourPath(tour.tourId)}?scheduleId=${selectedSchedule.scheduleId}`
    : getBookTourPath(tour.tourId);

  function scrollToPolicy(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    const target = document.getElementById(SECTION_IDS.policy);
    if (!target) return;
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY - SECTION_SCROLL_OFFSET,
      behavior: 'smooth',
    });
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {selectedSchedule ? 'Giá lịch đã chọn' : 'Giá từ'}
        </p>
        <p className="mt-1 flex items-baseline gap-1.5">
          <span className="text-3xl font-extrabold leading-none text-primary">
            {formatPrice(price)}đ
          </span>
          <span className="text-sm text-muted-foreground">/ người</span>
        </p>
      </div>

      {/* Nút chọn lịch: cuộn xuống danh sách lịch thay vì mở dropdown, để người dùng
          thấy đủ số chỗ còn trống và giá từng đợt trước khi quyết định. */}
      <button
        type="button"
        onClick={onPickSchedule}
        disabled={!hasSchedules}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3 text-left transition-colors hover:border-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="flex items-center gap-2.5 min-w-0">
          <CalendarDays className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          <span className="min-w-0">
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Ngày khởi hành
            </span>
            <span className="block truncate text-sm font-bold text-foreground">
              {selectedSchedule
                ? formatDate(selectedSchedule.departureDate)
                : hasSchedules
                  ? 'Chọn lịch khởi hành'
                  : 'Chưa mở lịch'}
            </span>
          </span>
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      </button>

      {selectedSchedule && (
        <dl className="flex flex-col gap-2 rounded-xl bg-muted/60 px-4 py-3 text-sm">
          <div className="flex items-center justify-between gap-2">
            <dt className="text-muted-foreground">Ngày về</dt>
            <dd className="font-semibold text-foreground">
              {formatDate(selectedSchedule.returnDate)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-2">
            <dt className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="h-3.5 w-3.5" aria-hidden="true" />
              Chỗ còn lại
            </dt>
            <dd className="font-semibold text-foreground">
              {remainingSlots(selectedSchedule)}/{selectedSchedule.availableSlots}
            </dd>
          </div>
        </dl>
      )}

      {/* CTA — hành động chính duy nhất của cả trang */}
      {!isLoggedIn ? (
        <>
          <Link
            to={PATHS.LOGIN}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            <Lock className="h-4 w-4" aria-hidden="true" />
            Đăng nhập để đặt tour
          </Link>
          <p className="text-center text-xs text-muted-foreground">
            Thành viên nhận giá ưu đãi và đặt trực tiếp qua hệ thống.
          </p>
        </>
      ) : hasSchedules ? (
        <>
          <Link
            to={bookingPath}
            className="flex w-full items-center justify-center rounded-full bg-primary px-5 py-3.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            {selectedSchedule ? 'Đặt tour ngày này' : 'Đặt tour'}
          </Link>
          <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            Chưa trừ tiền ngay — xác nhận thông tin ở bước sau.
          </p>
        </>
      ) : (
        <p className="rounded-xl bg-muted px-4 py-3 text-center text-xs text-muted-foreground">
          Tour chưa mở lịch khởi hành. Nhắn cho nhà tổ chức để được báo khi có lịch mới.
        </p>
      )}

      <a
        href={`#${SECTION_IDS.policy}`}
        onClick={scrollToPolicy}
        className="text-center text-xs font-semibold text-primary underline-offset-4 hover:underline"
      >
        Xem chính sách hủy &amp; hoàn tiền
      </a>
    </div>
  );
}
