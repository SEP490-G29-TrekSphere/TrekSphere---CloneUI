import type { PaymentStatus } from '@/features/payments/types';
import type { BookingDetailResponse } from '@/features/tours/types';

type CheckoutBookingState = Pick<
  BookingDetailResponse,
  | 'bookingStatus'
  | 'holdExpiresAt'
  | 'onlinePaymentEnabled'
  | 'paymentPlan'
  | 'paymentStatus'
  | 'remainingDueAt'
>;

function isFuture(value: string | undefined, now: number): boolean {
  return Boolean(value && new Date(value).getTime() > now);
}

export function isInitialCheckoutAvailable(
  booking: CheckoutBookingState,
  now = Date.now()
): boolean {
  return (
    booking.onlinePaymentEnabled !== false &&
    booking.bookingStatus === 'PAYMENT_PENDING' &&
    booking.paymentStatus === 'UNPAID' &&
    isFuture(booking.holdExpiresAt, now)
  );
}

export function isRemainingCheckoutAvailable(
  booking: CheckoutBookingState,
  now = Date.now()
): boolean {
  return (
    booking.onlinePaymentEnabled !== false &&
    booking.paymentPlan === 'DEPOSIT' &&
    booking.paymentStatus === 'PARTIALLY_PAID' &&
    ['PENDING_CONFIRMATION', 'CONFIRMED'].includes(booking.bookingStatus) &&
    isFuture(booking.remainingDueAt, now)
  );
}

export function canCreateCheckout(booking: CheckoutBookingState, now = Date.now()): boolean {
  return isInitialCheckoutAvailable(booking, now) || isRemainingCheckoutAvailable(booking, now);
}

export type PaymentReturnState = 'WAITING' | 'CONFIRMED' | 'REFUND_PENDING' | 'REFUNDED';

export function getPaymentReturnState(status?: PaymentStatus): PaymentReturnState {
  if (status === 'PARTIALLY_PAID' || status === 'PAID') return 'CONFIRMED';
  if (status === 'REFUND_PENDING') return 'REFUND_PENDING';
  if (status === 'PARTIALLY_REFUNDED' || status === 'REFUNDED') return 'REFUNDED';
  return 'WAITING';
}
