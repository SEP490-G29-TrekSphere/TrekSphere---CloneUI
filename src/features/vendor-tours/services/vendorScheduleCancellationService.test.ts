import { vendorBookingService } from '@/features/vendor-bookings/services/vendorBookingService';
import type { ScheduleBookingItem } from '@/features/vendor-bookings/types';
import type { TourSchedule } from '../types';
import { vendorScheduleCancellationService } from './vendorScheduleCancellationService';
import { vendorScheduleService } from './vendorScheduleService';

jest.mock('@/features/vendor-bookings/services/vendorBookingService', () => ({
  vendorBookingService: {
    getScheduleBookingManifest: jest.fn(),
  },
}));

jest.mock('./vendorScheduleService', () => ({
  vendorScheduleService: {
    updateSchedule: jest.fn(),
  },
}));

const mockGetManifest = vendorBookingService.getScheduleBookingManifest as jest.MockedFunction<
  typeof vendorBookingService.getScheduleBookingManifest
>;
const mockUpdateSchedule = vendorScheduleService.updateSchedule as jest.MockedFunction<
  typeof vendorScheduleService.updateSchedule
>;

const schedule: TourSchedule = {
  scheduleId: 'schedule-1',
  tourId: 'tour-1',
  departureDate: '2026-09-10',
  returnDate: '2026-09-12',
  availableSlots: 10,
  bookedSlots: 2,
  price: 1_000_000,
  status: 'OPEN',
  isDeleted: false,
  createdAt: '2026-08-01T00:00:00Z',
  updatedAt: '2026-08-01T00:00:00Z',
  createdBy: 'vendor-1',
  updatedBy: 'vendor-1',
  deletedAt: null,
  deletedBy: null,
};

function booking(overrides: Partial<ScheduleBookingItem> = {}): ScheduleBookingItem {
  return {
    bookingId: 'booking-1',
    bookingCode: 'BK-001',
    numberOfParticipants: 2,
    bookingStatus: 'CONFIRMED',
    paymentStatus: 'PAID',
    ...overrides,
  };
}

describe('vendorScheduleCancellationService', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('gửi một request CANCELLED để backend cascade booking trong transaction', async () => {
    const cancelledSchedule = { ...schedule, bookedSlots: 0, status: 'CANCELLED' as const };
    mockUpdateSchedule.mockResolvedValueOnce(cancelledSchedule);
    mockGetManifest.mockResolvedValueOnce({
      scheduleId: schedule.scheduleId,
      bookedSlots: 2,
      bookings: [booking()],
    });

    const result = await vendorScheduleCancellationService.cancel(schedule, 'Thời tiết nguy hiểm');

    expect(mockUpdateSchedule).toHaveBeenNthCalledWith(1, schedule.scheduleId, {
      status: 'CANCELLED',
      reason: 'Thời tiết nguy hiểm',
    });
    expect(result).toEqual({
      cancelledBookingCount: 1,
      refundBookingCount: 1,
      schedule: cancelledSchedule,
    });
  });

  test('chặn hủy booking khi tổng số người không khớp bookedSlots', async () => {
    mockGetManifest.mockResolvedValueOnce({
      scheduleId: schedule.scheduleId,
      bookedSlots: 2,
      bookings: [booking({ numberOfParticipants: 1 })],
    });

    await expect(
      vendorScheduleCancellationService.cancel(schedule, 'Thời tiết nguy hiểm')
    ).rejects.toThrow('Không thể đối chiếu an toàn');

    expect(mockUpdateSchedule).not.toHaveBeenCalled();
  });

  test('không tính booking chờ thanh toán vào bookedSlots', async () => {
    const cancelledSchedule = { ...schedule, bookedSlots: 0, status: 'CANCELLED' as const };
    mockUpdateSchedule.mockResolvedValueOnce(cancelledSchedule);
    mockGetManifest.mockResolvedValueOnce({
      scheduleId: schedule.scheduleId,
      bookedSlots: 2,
      bookings: [
        booking(),
        booking({
          bookingId: 'booking-hold',
          bookingCode: 'BK-HOLD',
          numberOfParticipants: 1,
          bookingStatus: 'PAYMENT_PENDING',
          paymentStatus: 'UNPAID',
        }),
      ],
    });

    const result = await vendorScheduleCancellationService.cancel(schedule, 'Thời tiết nguy hiểm');

    expect(result.cancelledBookingCount).toBe(2);
    expect(mockUpdateSchedule).toHaveBeenCalledTimes(1);
  });
});
