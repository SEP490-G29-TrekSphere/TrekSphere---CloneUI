import { CalendarDays, ChevronDown, Copy, Lock, ShieldCheck, Sparkles, Users } from 'lucide-react';
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
  const contactHref = tour.vendorContactPhone
    ? `tel:${tour.vendorContactPhone}`
    : tour.vendorContactEmail
      ? `mailto:${tour.vendorContactEmail}`
      : null;

  function scrollToPolicy(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    const target = document.getElementById(SECTION_IDS.policy);
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY - SECTION_SCROLL_OFFSET;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
      {/* Price Header */}
      <div>
        <span className="text-xs text-muted-foreground">Giá từ</span>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black text-primary">{formatPrice(price)}</span>
          <span className="text-xs text-muted-foreground">/ người</span>
        </div>
      </div>

      {/* Selected Schedule Selector */}
      <div>
        <button
          type="button"
          onClick={onPickSchedule}
          className="flex w-full items-center justify-between rounded-xl border border-border bg-muted/30 p-3 text-left transition-colors hover:bg-muted/60"
        >
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-muted-foreground">Lịch khởi hành:</span>
            <div className="flex items-center gap-1.5 font-bold text-foreground text-xs">
              <CalendarDays className="h-3.5 w-3.5 text-primary" />
              {selectedSchedule ? formatDate(selectedSchedule.departureDate) : 'Chọn ngày đi'}
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>

        {selectedSchedule && (
          <div className="mt-1.5 flex items-center gap-1 text-[11px] font-bold text-emerald-700">
            <Users className="h-3 w-3" />
            <span>Còn {remainingSlots(selectedSchedule)} chỗ nhận đặt</span>
          </div>
        )}
      </div>

      {/* Primary Action Button */}
      {tour.onlineBookingEnabled !== true ? (
        <div className="rounded-2xl bg-amber-500/10 p-4 text-center">
          <p className="text-sm font-bold text-amber-950">Chưa nhận đặt online</p>
          <p className="mt-1 text-xs leading-relaxed text-amber-800">
            {tour.onlineBookingDisabledReason ?? 'Tour chưa đủ điều kiện nhận đặt online.'}
          </p>
          {contactHref && (
            <a
              href={contactHref}
              className="mt-2 inline-block text-xs font-bold text-amber-950 underline underline-offset-4"
            >
              Liên hệ nhà tổ chức
            </a>
          )}
        </div>
      ) : !isLoggedIn ? (
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

      {/* Quick Clone & Custom Banner for C2C Companion Group Creation */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3.5 space-y-2 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-primary">
          <Sparkles className="h-4 w-4 shrink-0" />
          <span>Tự đi theo nhóm C2C?</span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Tạo nhóm ghép tự túc dựa trên tour mẫu này để kế thừa 100% lịch trình & mốc an toàn.
        </p>
        <Link
          to={`${PATHS.GROUPS}?openVendorClone=true&tourId=${tour.tourId}`}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-primary/40 bg-background px-3 py-2 text-xs font-extrabold text-primary hover:bg-primary hover:text-primary-foreground transition-all shadow-xs"
        >
          <Copy className="h-3.5 w-3.5" />
          <span>Nhân bản làm nhóm C2C</span>
        </Link>
      </div>

      <a
        href={`#${SECTION_IDS.policy}`}
        onClick={scrollToPolicy}
        className="block text-center text-xs font-semibold text-primary underline-offset-4 hover:underline"
      >
        Xem chính sách hủy và hoàn tiền
      </a>
    </div>
  );
}
