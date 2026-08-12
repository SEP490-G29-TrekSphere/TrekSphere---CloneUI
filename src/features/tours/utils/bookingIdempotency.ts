import type { CreateBookingRequest } from '@/features/tours/types';

export interface BookingSubmissionIdentity {
  fingerprint: string;
  key: string;
}

type SessionStorageLike = Pick<Storage, 'getItem' | 'removeItem' | 'setItem'>;

const STORAGE_PREFIX = 'treksphere:booking-submission:';

function storageKey(scheduleId: string): string {
  return `${STORAGE_PREFIX}${scheduleId}`;
}

function defaultSessionStorage(): SessionStorageLike | undefined {
  try {
    return globalThis.sessionStorage;
  } catch {
    return undefined;
  }
}

export function bookingPayloadFingerprint(payload: CreateBookingRequest): string {
  return JSON.stringify(payload);
}

export function resolveBookingSubmission(
  payload: CreateBookingRequest,
  current: BookingSubmissionIdentity | null,
  createKey: () => string = () => crypto.randomUUID()
): BookingSubmissionIdentity {
  const fingerprint = bookingPayloadFingerprint(payload);
  if (current?.fingerprint === fingerprint) return current;
  return { fingerprint, key: createKey() };
}

export function loadBookingSubmission(
  scheduleId: string,
  storage: SessionStorageLike | undefined = defaultSessionStorage()
): BookingSubmissionIdentity | null {
  if (!storage) return null;
  try {
    const value = storage.getItem(storageKey(scheduleId));
    if (!value) return null;
    const parsed = JSON.parse(value) as Partial<BookingSubmissionIdentity>;
    return typeof parsed.fingerprint === 'string' && typeof parsed.key === 'string'
      ? { fingerprint: parsed.fingerprint, key: parsed.key }
      : null;
  } catch {
    return null;
  }
}

export function persistBookingSubmission(
  scheduleId: string,
  submission: BookingSubmissionIdentity,
  storage: SessionStorageLike | undefined = defaultSessionStorage()
): void {
  if (!storage) return;
  try {
    storage.setItem(storageKey(scheduleId), JSON.stringify(submission));
  } catch {
    // In-memory identity in BookTour still protects retries when storage is unavailable.
  }
}

export function clearBookingSubmission(
  scheduleId: string,
  storage: SessionStorageLike | undefined = defaultSessionStorage()
): void {
  if (!storage) return;
  try {
    storage.removeItem(storageKey(scheduleId));
  } catch {
    // Nothing else is required after a successful submission.
  }
}
