import type { CreateBookingRequest } from '@/features/tours/types';
import {
  clearBookingSubmission,
  loadBookingSubmission,
  persistBookingSubmission,
  resolveBookingSubmission,
} from './bookingIdempotency';

const payload: CreateBookingRequest = {
  scheduleId: 'schedule-1',
  paymentPlan: 'FULL_PAYMENT',
  participationPolicyAccepted: true,
  participants: [
    {
      fullName: 'Nguyen Van A',
      dateOfBirth: '1990-01-01',
      gender: 'MALE',
      idNumber: '012345678901',
      phone: '0900000000',
    },
  ],
};

describe('booking idempotency identity', () => {
  test('reuses the same key when retrying an identical payload', () => {
    const createKey = jest.fn(() => 'key-1');
    const first = resolveBookingSubmission(payload, null, createKey);
    const retry = resolveBookingSubmission(payload, first, createKey);

    expect(retry).toEqual(first);
    expect(createKey).toHaveBeenCalledTimes(1);
  });

  test('creates a new key when booking content changes', () => {
    const createKey = jest.fn().mockReturnValueOnce('key-1').mockReturnValueOnce('key-2');
    const first = resolveBookingSubmission(payload, null, createKey);
    const changed = resolveBookingSubmission(
      { ...payload, voucherCode: 'SUMMER20' },
      first,
      createKey
    );

    expect(changed.key).toBe('key-2');
    expect(changed.fingerprint).not.toBe(first.fingerprint);
  });

  test('persists across page reloads and clears after success', () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    };
    const submission = resolveBookingSubmission(payload, null, () => 'stable-key');

    persistBookingSubmission(payload.scheduleId, submission, storage);
    expect(loadBookingSubmission(payload.scheduleId, storage)).toEqual(submission);

    clearBookingSubmission(payload.scheduleId, storage);
    expect(loadBookingSubmission(payload.scheduleId, storage)).toBeNull();
  });
});
