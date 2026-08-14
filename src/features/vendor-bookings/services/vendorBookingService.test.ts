import { ApiService } from '@/config/apiClient';
import { vendorBookingService } from './vendorBookingService';

jest.mock('@/config/apiClient', () => ({
  ApiService: jest.fn(),
}));

const mockApiService = ApiService as jest.MockedFunction<typeof ApiService>;

describe('vendorBookingService schedule cancellation support', () => {
  beforeEach(() => {
    mockApiService.mockReset();
  });

  test('lấy manifest đúng scheduleId và nhóm các hành khách theo booking', async () => {
    mockApiService.mockResolvedValueOnce({
      data: {
        scheduleId: 'schedule-1',
        bookedSlots: 3,
        participants: [
          {
            bookingId: 'booking-1',
            bookingCode: 'BK-001',
            bookingStatus: 'CONFIRMED',
            paymentStatus: 'PAID',
          },
          {
            bookingId: 'booking-1',
            bookingCode: 'BK-001',
            bookingStatus: 'CONFIRMED',
            paymentStatus: 'PAID',
          },
          {
            bookingId: 'booking-2',
            bookingCode: 'BK-002',
            bookingStatus: 'PENDING_CONFIRMATION',
            paymentStatus: 'PARTIALLY_PAID',
          },
        ],
      },
    });

    const result = await vendorBookingService.getScheduleBookingManifest('schedule-1');

    expect(result).toEqual({
      scheduleId: 'schedule-1',
      bookedSlots: 3,
      bookings: [
        {
          bookingId: 'booking-1',
          bookingCode: 'BK-001',
          numberOfParticipants: 2,
          bookingStatus: 'CONFIRMED',
          paymentStatus: 'PAID',
        },
        {
          bookingId: 'booking-2',
          bookingCode: 'BK-002',
          numberOfParticipants: 1,
          bookingStatus: 'PENDING_CONFIRMATION',
          paymentStatus: 'PARTIALLY_PAID',
        },
      ],
    });
    expect(mockApiService).toHaveBeenCalledWith(
      '/vendor/dashboard/schedules/schedule-1/manifest',
      'GET'
    );
  });

  test('chặn khi backend trả manifest của lịch khác', async () => {
    mockApiService.mockResolvedValueOnce({
      data: { scheduleId: 'schedule-khac', bookedSlots: 0, participants: [] },
    });

    await expect(vendorBookingService.getScheduleBookingManifest('schedule-1')).rejects.toThrow(
      'không khớp lịch khởi hành'
    );
  });
});
