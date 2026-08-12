import { ApiService } from '@/config/apiClient';
import type { CreateBookingRequest } from '@/features/tours/types';
import { tourService } from './tourService';

jest.mock('@/config/apiClient', () => ({
  ApiService: jest.fn(),
}));

const mockApiService = ApiService as jest.MockedFunction<typeof ApiService>;

describe('tourService booking requests', () => {
  beforeEach(() => mockApiService.mockReset());

  test('sends the caller-owned idempotency key to the backend', async () => {
    const payload: CreateBookingRequest = {
      scheduleId: 'schedule-1',
      paymentPlan: 'FULL_PAYMENT',
      participationPolicyAccepted: true,
      participants: [],
    };
    mockApiService.mockResolvedValueOnce({ data: { bookingId: 'booking-1' } });

    await tourService.createBooking(payload, 'stable-retry-key');

    expect(mockApiService).toHaveBeenCalledWith('/bookings', 'POST', payload, undefined, {
      'Idempotency-Key': 'stable-retry-key',
    });
  });
});
