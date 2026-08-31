import { http } from 'msw';
import { findBookingById, type MockBooking, mockBookings } from '../data/bookings';
import {
  findScheduleById,
  findTourById,
  type MockTour,
  mockTours,
  toTourApiItem,
  toTourDetailFromApi,
} from '../data/tours';
import { mockUsers } from '../data/users';
import { fail, ok } from '../envelope';

/**
 * Mock cho `tourService` (`src/features/tours/services/tourService.ts`) — browse/search/detail
 * công khai + các API booking/review/tracking phía trekker dùng chung tour database
 * ở `src/mocks/data/tours.ts` (chia sẻ với `vendor-tours.ts` / `vendor-sessions.ts`) và
 * `src/mocks/data/bookings.ts` (chia sẻ với `vendor-bookings.ts`).
 *
 *   GET    /tours                    — danh sách tour công khai (chỉ APPROVED, chưa xóa mềm)
 *   GET    /tours/:id                — chi tiết tour (mọi trạng thái — vendor cũng dùng endpoint
 *                                       này để đổ form Sửa, vì `/vendor/tours/{id}` không có GET)
 *   GET    /tours/:id/checkpoints    — checkpoint của tour (public, dùng chung cả vendor)
 *   GET    /tours/:id/schedules      — lịch khởi hành của tour
 *   GET    /tours/:id/reviews        — review + thống kê rating của tour
 *   POST   /reviews                  — trekker tạo review sau khi hoàn thành booking
 *   PATCH  /reviews/:id/status       — duyệt/ẩn review
 *   POST   /bookings                 — trekker tạo đơn đặt tour
 *   GET    /bookings/:id             — chi tiết 1 đơn đặt tour
 *   POST   /bookings/:id/cancel      — trekker tự hủy đơn
 *   GET    /bookings/my-history      — lịch sử đặt tour của trekker hiện tại
 *   POST   /tracking/sos             — gửi tín hiệu cấp cứu
 */

const PAYMENT_DEADLINE_SECONDS = 900;
const DEFAULT_USER_ID = 'user-trekker-1';

function currentUserIdFromAuthHeader(request: Request): string {
  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Bearer mock-access-')) return DEFAULT_USER_ID;
  const rest = auth.replace('Bearer mock-access-', '');
  return rest.split('-').slice(0, -1).join('-') || DEFAULT_USER_ID;
}

function matchesKeyword(tour: MockTour, keyword: string | null): boolean {
  if (!keyword) return true;
  const q = keyword.toLowerCase();
  return (
    tour.tourName.toLowerCase().includes(q) ||
    tour.description.toLowerCase().includes(q) ||
    tour.location.toLowerCase().includes(q)
  );
}

function sortTours(tours: MockTour[], sortBy: string | null, sortDir: string | null): MockTour[] {
  const dir = sortDir === 'asc' ? 1 : -1;
  const key = sortBy ?? 'createdAt';
  return [...tours].sort((a, b) => {
    switch (key) {
      case 'basePrice':
        return (a.basePrice - b.basePrice) * dir;
      case 'durationDays':
        return (a.durationDays - b.durationDays) * dir;
      case 'tourName':
        return a.tourName.localeCompare(b.tourName) * dir;
      default:
        return a.createdAt.localeCompare(b.createdAt) * dir;
    }
  });
}

function toBookingDetailResponse(b: MockBooking) {
  return {
    bookingId: b.bookingId,
    bookingCode: b.bookingCode,
    tourId: b.tourId,
    tourSessionId: b.tourSessionId,
    tourName: b.tourName,
    coverImageUrl: b.coverImageUrl,
    departureDate: b.departureDate,
    returnDate: b.returnDate,
    pricePerSlot: b.pricePerSlot,
    numberOfParticipants: b.numberOfParticipants,
    originalPrice: b.originalPrice,
    discountAmount: b.discountAmount,
    totalPrice: b.totalPrice,
    refundAmount: b.refundAmount,
    bookingStatus: b.bookingStatus,
    paymentStatus: b.paymentStatus,
    paymentPlan: b.paymentPlan,
    holdExpiresAt: b.holdExpiresAt,
    confirmationExpiresAt: b.confirmationExpiresAt,
    remainingDueAt: b.remainingDueAt,
    paidAmount: b.paidAmount,
    pendingRefundAmount: b.pendingRefundAmount,
    onlinePaymentEnabled: b.onlinePaymentEnabled,
    proofImageUrl: b.proofImageUrl,
    cancellationReason: b.cancellationReason,
    cancelledAt: b.cancelledAt,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
    voucherCode: b.voucherCode,
    userId: b.userId,
    userEmail: b.userEmail,
    userFullName: b.userFullName,
    userPhone: b.userPhone,
    participants: b.participants,
    reviewed: reviewedBookingIds.has(b.bookingId),
  };
}

const reviewedBookingIds = new Set<string>();
let bookingSeq = mockBookings.length + 1;

export const tourHandlers = [
  http.get('*/tours', async ({ request }) => {
    const url = new URL(request.url);
    const keyword = url.searchParams.get('keyword');
    const location = url.searchParams.get('location');
    const difficulty = url.searchParams.get('difficulty');
    const page = Number(url.searchParams.get('page') ?? '0');
    const size = Number(url.searchParams.get('size') ?? '10');
    const sortBy = url.searchParams.get('sortBy');
    const sortDir = url.searchParams.get('sortDir');

    let filtered = mockTours.filter((t) => t.status === 'APPROVED' && !t.isDeleted);
    filtered = filtered.filter((t) => matchesKeyword(t, keyword));
    if (location) {
      const loc = location.toLowerCase();
      filtered = filtered.filter((t) => t.location.toLowerCase().includes(loc));
    }
    if (difficulty) {
      filtered = filtered.filter((t) => t.difficulty === difficulty);
    }
    filtered = sortTours(filtered, sortBy, sortDir);

    const start = page * size;
    const content = filtered.slice(start, start + size).map(toTourApiItem);

    return ok({
      content,
      pageNumber: page,
      pageSize: size,
      totalElements: filtered.length,
      totalPages: Math.max(1, Math.ceil(filtered.length / size)),
      last: start + size >= filtered.length,
    });
  }),

  http.get('*/tours/:id/checkpoints', async ({ params }) => {
    const tour = findTourById(params.id as string);
    if (!tour) return fail('Không tìm thấy tour.', 404);
    return ok(tour.checkpoints);
  }),

  http.get('*/tours/:id/schedules', async ({ params }) => {
    const tour = findTourById(params.id as string);
    if (!tour) return fail('Không tìm thấy tour.', 404);
    return ok(tour.schedules);
  }),

  http.get('*/tours/:id/reviews', async ({ request, params }) => {
    const tour = findTourById(params.id as string);
    if (!tour) return fail('Không tìm thấy tour.', 404);

    const url = new URL(request.url);
    const rating = url.searchParams.get('rating');
    const keyword = url.searchParams.get('keyword')?.toLowerCase();
    const page = Number(url.searchParams.get('page') ?? '0');
    const size = Number(url.searchParams.get('size') ?? '10');

    let reviews = tour.reviews.map((r) => ({
      ...r,
      tourName: tour.tourName,
      tourCoverImageUrl: tour.coverImageUrl,
    }));
    if (rating) reviews = reviews.filter((r) => r.rating === Number(rating));
    if (keyword) reviews = reviews.filter((r) => r.content.toLowerCase().includes(keyword));

    const start = page * size;
    const content = reviews.slice(start, start + size);
    const totalReviews = tour.reviews.length;
    const averageRating =
      totalReviews > 0
        ? Number((tour.reviews.reduce((s, r) => s + r.rating, 0) / totalReviews).toFixed(1))
        : 0;

    return ok({
      averageRating,
      totalReviews,
      fiveStar: tour.reviews.filter((r) => r.rating === 5).length,
      fourStar: tour.reviews.filter((r) => r.rating === 4).length,
      threeStar: tour.reviews.filter((r) => r.rating === 3).length,
      twoStar: tour.reviews.filter((r) => r.rating === 2).length,
      oneStar: tour.reviews.filter((r) => r.rating === 1).length,
      reviews: {
        content,
        pageNumber: page,
        pageSize: size,
        totalElements: reviews.length,
        totalPages: Math.max(1, Math.ceil(reviews.length / size)),
        last: start + size >= reviews.length,
      },
    });
  }),

  http.post('*/reviews', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as {
      bookingId?: string;
      rating?: number;
      content?: string;
    };
    const booking = body.bookingId ? findBookingById(body.bookingId) : undefined;
    if (!booking) return fail('Không tìm thấy đơn đặt tour.', 404);
    const tour = findTourById(booking.tourId);
    if (!tour) return fail('Không tìm thấy tour.', 404);

    const user = mockUsers.find((u) => u.id === booking.userId);
    const review = {
      reviewId: `review-new-${Date.now()}`,
      rating: body.rating ?? 5,
      content: body.content ?? '',
      status: 'PENDING' as const,
      userId: booking.userId,
      userFullName: user?.fullName ?? booking.userFullName,
      userAvatarUrl: user?.avatarUrl ?? null,
      tourId: tour.tourId,
      tourName: tour.tourName,
      tourCoverImageUrl: tour.coverImageUrl,
      bookingId: booking.bookingId,
      bookingCode: booking.bookingCode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    tour.reviews = [review, ...tour.reviews];
    reviewedBookingIds.add(booking.bookingId);

    return ok(review, 'Gửi đánh giá thành công.', 201);
  }),

  http.patch('*/reviews/:id/status', async ({ request, params }) => {
    const id = params.id as string;
    const body = (await request.json().catch(() => ({}))) as {
      status?: 'PENDING' | 'APPROVED' | 'HIDDEN';
    };
    for (const tour of mockTours) {
      const review = tour.reviews.find((r) => r.reviewId === id);
      if (review) {
        review.status = body.status ?? review.status;
        review.updatedAt = new Date().toISOString();
        return ok(review, 'Cập nhật trạng thái đánh giá thành công.');
      }
    }
    return fail('Không tìm thấy đánh giá.', 404);
  }),

  http.post('*/bookings', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as {
      scheduleId?: string;
      voucherCode?: string;
      paymentPlan?: 'FULL_PAYMENT' | 'DEPOSIT';
      participationPolicyAccepted?: boolean;
      participants?: Array<{ fullName: string; [key: string]: unknown }>;
    };
    if (!body.scheduleId) return fail('Thiếu lịch khởi hành.', 400);

    const found = findScheduleById(body.scheduleId);
    if (!found) return fail('Không tìm thấy lịch khởi hành.', 404);
    const { tour, schedule } = found;

    const participants = body.participants ?? [];
    const numberOfParticipants = participants.length || 1;
    if (schedule.availableSlots - schedule.bookedSlots < numberOfParticipants) {
      return fail('Lịch khởi hành đã hết chỗ trống.', 400);
    }

    const originalPrice = schedule.price * numberOfParticipants;
    const discountAmount = body.voucherCode ? Math.min(originalPrice * 0.1, 200000) : 0;
    const totalPrice = originalPrice - discountAmount;
    const userId = currentUserIdFromAuthHeader(request);
    const user = mockUsers.find((u) => u.id === userId) ?? mockUsers[1];
    const now = new Date();

    const booking: MockBooking = {
      bookingId: `booking-new-${bookingSeq}`,
      bookingCode: `TS-BK-${String(90000 + bookingSeq).slice(-5)}`,
      tourId: tour.tourId,
      tourSessionId: undefined,
      scheduleId: schedule.scheduleId,
      tourName: tour.tourName,
      coverImageUrl: tour.coverImageUrl,
      departureDate: schedule.departureDate,
      returnDate: schedule.returnDate,
      pricePerSlot: schedule.price,
      numberOfParticipants,
      originalPrice,
      discountAmount,
      totalPrice,
      refundAmount: 0,
      bookingStatus: 'PAYMENT_PENDING',
      paymentStatus: 'UNPAID',
      paymentPlan: body.paymentPlan ?? 'FULL_PAYMENT',
      holdExpiresAt: new Date(now.getTime() + PAYMENT_DEADLINE_SECONDS * 1000).toISOString(),
      paidAmount: 0,
      pendingRefundAmount: 0,
      onlinePaymentEnabled: true,
      voucherCode: body.voucherCode,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      userId: user.id,
      userEmail: user.email,
      userFullName: user.fullName,
      userPhone: user.phone ?? '',
      participants: participants.map((p, i) => ({
        participantId: `part-new-${bookingSeq}-${i}`,
        fullName: p.fullName,
        dateOfBirth: p.dateOfBirth as string | undefined,
        gender: p.gender as 'MALE' | 'FEMALE' | 'OTHER' | undefined,
        idNumber: p.idNumber as string | undefined,
        phone: p.phone as string | undefined,
        email: p.email as string | undefined,
        address: p.address as string | undefined,
        specialRequirements: p.specialRequirements as string | undefined,
      })),
    };
    bookingSeq += 1;
    schedule.bookedSlots += numberOfParticipants;
    mockBookings.push(booking);

    return ok(toBookingDetailResponse(booking), 'Đặt tour thành công.', 201);
  }),

  http.get('*/bookings/my-history', async ({ request }) => {
    const url = new URL(request.url);
    const userId = currentUserIdFromAuthHeader(request);
    const status = url.searchParams.get('status');
    const keyword = url.searchParams.get('keyword')?.toLowerCase();
    const page = Number(url.searchParams.get('page') ?? '0');
    const size = Number(url.searchParams.get('size') ?? '10');
    const sortDir = url.searchParams.get('sortDir') ?? 'desc';

    let filtered = mockBookings.filter((b) => b.userId === userId);
    if (status) filtered = filtered.filter((b) => b.bookingStatus === status);
    if (keyword) {
      filtered = filtered.filter(
        (b) =>
          b.tourName.toLowerCase().includes(keyword) ||
          b.bookingCode.toLowerCase().includes(keyword)
      );
    }
    filtered = [...filtered].sort((a, b) => {
      const cmp = a.createdAt.localeCompare(b.createdAt);
      return sortDir === 'asc' ? cmp : -cmp;
    });

    const start = page * size;
    const content = filtered.slice(start, start + size).map((b) => ({
      bookingId: b.bookingId,
      bookingCode: b.bookingCode,
      tourName: b.tourName,
      coverImageUrl: b.coverImageUrl,
      departureDate: b.departureDate,
      returnDate: b.returnDate,
      numberOfParticipants: b.numberOfParticipants,
      totalPrice: b.totalPrice,
      bookingStatus: b.bookingStatus,
      paymentStatus: b.paymentStatus,
      createdAt: b.createdAt,
    }));

    return ok({
      content,
      pageNumber: page,
      pageSize: size,
      totalElements: filtered.length,
      totalPages: Math.max(1, Math.ceil(filtered.length / size)),
      last: start + size >= filtered.length,
    });
  }),

  http.get('*/bookings/:id', async ({ params }) => {
    const booking = findBookingById(params.id as string);
    if (!booking) return fail('Không tìm thấy đơn đặt tour.', 404);
    return ok(toBookingDetailResponse(booking));
  }),

  http.post('*/bookings/:id/cancel', async ({ request, params }) => {
    const booking = findBookingById(params.id as string);
    if (!booking) return fail('Không tìm thấy đơn đặt tour.', 404);
    const body = (await request.json().catch(() => ({}))) as {
      cancellationReason?: string;
      refundBankBin?: string;
      refundAccountNumber?: string;
      refundAccountName?: string;
    };

    booking.bookingStatus = 'CANCELLED';
    booking.cancellationReason = body.cancellationReason ?? 'Trekker tự hủy đơn.';
    booking.cancelledAt = new Date().toISOString();
    booking.updatedAt = booking.cancelledAt;
    if (booking.paidAmount > 0) {
      booking.paymentStatus = 'REFUND_PENDING';
      booking.pendingRefundAmount = booking.paidAmount;
      booking.refundAmount = booking.paidAmount;
    }
    if (body.refundAccountNumber) {
      (booking as unknown as Record<string, unknown>).refundAccountNumber =
        body.refundAccountNumber;
    }

    return ok(toBookingDetailResponse(booking), 'Hủy đơn đặt tour thành công.');
  }),

  http.post('*/tracking/sos', async () =>
    ok(
      {
        sosAlertId: `sos-${Date.now()}`,
        status: 'PENDING' as const,
        createdAt: new Date().toISOString(),
      },
      'Đã gửi tín hiệu cấp cứu.',
      201
    )
  ),

  // Đặt cuối cùng vì `*/tours/:id` là wildcard rộng, không được nuốt mất các path con ở trên.
  http.get('*/tours/:id', async ({ params }) => {
    const tour = findTourById(params.id as string);
    if (!tour || tour.isDeleted) {
      return fail('Không tìm thấy tour.', 404);
    }
    return ok(toTourDetailFromApi(tour));
  }),
];
