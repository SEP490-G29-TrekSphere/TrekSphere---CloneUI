import { Link } from 'react-router-dom';
import { getBookTourPath, PATHS } from '@/constants';
import type { TourDetailFromApi, TourDetailScheduleApi } from '@/features/tours/types';
import { formatDate, formatPrice } from '@/utils/format';

interface TourMobileBookingBarProps {
  tour: TourDetailFromApi;
  selectedSchedule: TourDetailScheduleApi | null;
  hasSchedules: boolean;
  isLoggedIn: boolean;
}

/**
 * Thanh đặt tour dính đáy màn hình cho mobile — thay cho thẻ đặt tour ở cột phải
 * vốn bị đẩy xuống cuối trang khi bố cục xếp thành một cột.
 *
 * Giá và ngày bám theo lịch đang chọn, giống hệt thẻ ở cột phải, để hai nơi không
 * bao giờ hiển thị hai con số khác nhau.
 */
export function TourMobileBookingBar({
  tour,
  selectedSchedule,
  hasSchedules,
  isLoggedIn,
}: TourMobileBookingBarProps) {
  const price = selectedSchedule?.price ?? tour.basePrice;
  const bookingPath = selectedSchedule
    ? `${getBookTourPath(tour.tourId)}?scheduleId=${selectedSchedule.scheduleId}`
    : getBookTourPath(tour.tourId);
  const contactHref = tour.vendorContactPhone
    ? `tel:${tour.vendorContactPhone}`
    : tour.vendorContactEmail
      ? `mailto:${tour.vendorContactEmail}`
      : null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur-md lg:hidden">
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <div className="min-w-0">
          <p className="flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-primary">{formatPrice(price)}đ</span>
            <span className="text-xs text-muted-foreground">/ người</span>
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {selectedSchedule
              ? `Khởi hành ${formatDate(selectedSchedule.departureDate)}`
              : hasSchedules
                ? 'Chọn lịch khởi hành'
                : 'Chưa mở lịch khởi hành'}
          </p>
        </div>

        {tour.onlineBookingEnabled !== true ? (
          contactHref ? (
            <a
              href={contactHref}
              title={tour.onlineBookingDisabledReason ?? undefined}
              className="shrink-0 rounded-full bg-amber-100 px-5 py-2.5 text-xs font-bold text-amber-950"
            >
              Liên hệ
            </a>
          ) : (
            <span
              title={tour.onlineBookingDisabledReason ?? undefined}
              className="shrink-0 rounded-full bg-amber-100 px-5 py-2.5 text-xs font-bold text-amber-950"
            >
              Chưa nhận đặt online
            </span>
          )
        ) : !isLoggedIn ? (
          <Link
            to={PATHS.LOGIN}
            className="shrink-0 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Đăng nhập
          </Link>
        ) : hasSchedules ? (
          <Link
            to={bookingPath}
            className="shrink-0 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Đặt ngay
          </Link>
        ) : (
          <span className="shrink-0 rounded-full bg-muted px-5 py-2.5 text-xs font-semibold text-muted-foreground">
            Chưa mở lịch
          </span>
        )}
      </div>
    </div>
  );
}
