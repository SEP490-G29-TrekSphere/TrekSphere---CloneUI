import { vendorBookingService } from '@/features/vendor-bookings/services/vendorBookingService';
import type {
  ScheduleBookingItem,
  ScheduleBookingManifest,
} from '@/features/vendor-bookings/types';
import type { TourSchedule, UpdateSchedulePayload } from '../types';
import { vendorScheduleService } from './vendorScheduleService';

const CANCELLABLE_BOOKING_STATUSES = new Set([
  'PAYMENT_PENDING',
  'PENDING_CONFIRMATION',
  'CONFIRMED',
]);
const BLOCKING_BOOKING_STATUSES = new Set(['IN_PROGRESS', 'COMPLETED']);

export interface ScheduleCancellationPreview {
  cancellableBookings: ScheduleBookingItem[];
  blockingBookings: ScheduleBookingItem[];
  participantCount: number;
  bookedParticipantCount: number;
  paidBookingCount: number;
  isSlotCountConsistent: boolean;
}

export interface ScheduleCancellationResult {
  cancelledBookingCount: number;
  refundBookingCount: number;
  schedule: TourSchedule;
}

function scheduleStatusPayload(
  status: NonNullable<UpdateSchedulePayload['status']>,
  reason: string
): UpdateSchedulePayload {
  return { status, reason };
}

function analyzeBookings(
  schedule: TourSchedule,
  manifest: ScheduleBookingManifest
): ScheduleCancellationPreview {
  const bookings = manifest.bookings;
  const cancellableBookings = bookings.filter((booking) =>
    CANCELLABLE_BOOKING_STATUSES.has(booking.bookingStatus)
  );
  const blockingBookings = bookings.filter((booking) =>
    BLOCKING_BOOKING_STATUSES.has(booking.bookingStatus)
  );
  const participantCount = cancellableBookings.reduce(
    (total, booking) => total + booking.numberOfParticipants,
    0
  );
  const bookedParticipantCount = bookings
    .filter((booking) => booking.bookingStatus !== 'PAYMENT_PENDING')
    .filter((booking) => !['EXPIRED', 'REJECTED', 'CANCELLED'].includes(booking.bookingStatus))
    .reduce((total, booking) => total + booking.numberOfParticipants, 0);
  const paidBookingCount = cancellableBookings.filter((booking) =>
    ['PARTIALLY_PAID', 'PAID'].includes(booking.paymentStatus)
  ).length;

  return {
    cancellableBookings,
    blockingBookings,
    participantCount,
    bookedParticipantCount,
    paidBookingCount,
    isSlotCountConsistent:
      manifest.scheduleId === schedule.scheduleId &&
      manifest.bookedSlots === schedule.bookedSlots &&
      bookedParticipantCount === manifest.bookedSlots,
  };
}

async function loadPreview(schedule: TourSchedule) {
  const manifest = await vendorBookingService.getScheduleBookingManifest(schedule.scheduleId);
  return analyzeBookings(schedule, manifest);
}

export const vendorScheduleCancellationService = {
  async preview(schedule: TourSchedule): Promise<ScheduleCancellationPreview> {
    return loadPreview(schedule);
  },

  async cancel(schedule: TourSchedule, reason: string): Promise<ScheduleCancellationResult> {
    // Preview chỉ dùng để xác nhận với Vendor. BE khóa schedule và cascade toàn bộ
    // booking/refund trong cùng transaction khi nhận trạng thái CANCELLED.
    const preview = await loadPreview(schedule);

    if (preview.blockingBookings.length > 0) {
      throw new Error('Lịch đã bắt đầu hoặc hoàn thành, không thể hủy bằng luồng này.');
    }
    if (!preview.isSlotCountConsistent) {
      throw new Error(
        `Không thể đối chiếu an toàn: lịch ghi nhận ${schedule.bookedSlots} người nhưng manifest ghi nhận ${preview.bookedParticipantCount} người đã giữ chỗ chính thức.`
      );
    }

    const cancelledSchedule = await vendorScheduleService.updateSchedule(
      schedule.scheduleId,
      scheduleStatusPayload('CANCELLED', reason)
    );

    return {
      cancelledBookingCount: preview.cancellableBookings.length,
      refundBookingCount: preview.paidBookingCount,
      schedule: cancelledSchedule,
    };
  },
};
