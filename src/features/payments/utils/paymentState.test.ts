import type { BookingDetailResponse } from '@/features/tours/types';
import {
  canCreateCheckout,
  getPaymentReturnState,
  isRemainingCheckoutAvailable,
} from './paymentState';

const now = Date.parse('2026-08-12T10:00:00Z');

function booking(overrides: Partial<BookingDetailResponse> = {}): BookingDetailResponse {
  return {
    bookingStatus: 'PAYMENT_PENDING',
    paymentStatus: 'UNPAID',
    paymentPlan: 'FULL_PAYMENT',
    holdExpiresAt: '2026-08-12T10:15:00Z',
    onlinePaymentEnabled: true,
    ...overrides,
  } as BookingDetailResponse;
}

describe('payment state guards', () => {
  test('allows an initial checkout only while the hold is active', () => {
    expect(canCreateCheckout(booking(), now)).toBe(true);
    expect(canCreateCheckout(booking({ holdExpiresAt: '2026-08-12T09:59:59Z' }), now)).toBe(false);
  });

  test('allows a remaining checkout only before its due time', () => {
    const depositBooking = booking({
      bookingStatus: 'CONFIRMED',
      paymentStatus: 'PARTIALLY_PAID',
      paymentPlan: 'DEPOSIT',
      holdExpiresAt: undefined,
      remainingDueAt: '2026-08-13T00:00:00Z',
    });

    expect(isRemainingCheckoutAvailable(depositBooking, now)).toBe(true);
    expect(
      isRemainingCheckoutAvailable(
        { ...depositBooking, remainingDueAt: '2026-08-12T09:59:59Z' },
        now
      )
    ).toBe(false);
  });

  test.each([
    'EXPIRED',
    'REJECTED',
    'CANCELLED',
  ] as const)('does not allow checkout for a %s booking', (bookingStatus) => {
    expect(canCreateCheckout(booking({ bookingStatus }), now)).toBe(false);
  });

  test('maps late-payment refund states without reporting payment success', () => {
    expect(getPaymentReturnState('UNPAID')).toBe('WAITING');
    expect(getPaymentReturnState('PARTIALLY_PAID')).toBe('CONFIRMED');
    expect(getPaymentReturnState('REFUND_PENDING')).toBe('REFUND_PENDING');
    expect(getPaymentReturnState('REFUNDED')).toBe('REFUNDED');
  });
});
