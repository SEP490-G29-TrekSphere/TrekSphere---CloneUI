import { http } from 'msw';
import { findBookingsByScheduleId, type MockBooking, mockBookings } from '../data/bookings';
import { fail, ok } from '../envelope';

/** Shape khớp `ApiBookingDto` mà `vendorBookingService.listBookings` map về `VendorBookingItem`. */
function toApiBookingDto(b: MockBooking) {
  return {
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
    customerName: b.userFullName,
    proofImageUrl: b.proofImageUrl ?? null,
  };
}

/** Shape khớp `BookingDetailResponse` (dùng chung cho tours & vendor-bookings). */
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
  };
}

export const vendorBookingHandlers = [
  // GET /vendor/bookings — danh sách booking (lọc + phân trang) dùng cho cả listBookings & getStats.
  http.get('*/vendor/bookings', async ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? '0');
    const size = Number(url.searchParams.get('size') ?? '10');
    const bookingStatus = url.searchParams.get('bookingStatus');
    const paymentStatus = url.searchParams.get('paymentStatus');
    const tourId = url.searchParams.get('tourId');
    const keyword = url.searchParams.get('keyword')?.trim().toLowerCase();
    const sortDir = url.searchParams.get('sortDir') ?? 'desc';

    let filtered = [...mockBookings];
    if (bookingStatus) filtered = filtered.filter((b) => b.bookingStatus === bookingStatus);
    if (paymentStatus) filtered = filtered.filter((b) => b.paymentStatus === paymentStatus);
    if (tourId) filtered = filtered.filter((b) => b.tourId === tourId);
    if (keyword) {
      filtered = filtered.filter(
        (b) =>
          b.tourName.toLowerCase().includes(keyword) ||
          b.bookingCode.toLowerCase().includes(keyword) ||
          b.userFullName.toLowerCase().includes(keyword)
      );
    }
    filtered.sort((a, b) => {
      const cmp = a.createdAt.localeCompare(b.createdAt);
      return sortDir === 'asc' ? cmp : -cmp;
    });

    const start = page * size;
    const content = filtered.slice(start, start + size).map(toApiBookingDto);

    return ok({
      content,
      pageNumber: page,
      pageSize: size,
      totalElements: filtered.length,
      totalPages: Math.max(1, Math.ceil(filtered.length / size)),
      last: start + size >= filtered.length,
    });
  }),

  // GET /vendor/dashboard/schedules/:scheduleId/manifest — danh sách hành khách theo lịch khởi hành.
  http.get('*/vendor/dashboard/schedules/:scheduleId/manifest', async ({ params }) => {
    const scheduleId = params.scheduleId as string;
    const bookings = findBookingsByScheduleId(scheduleId);

    const participants = bookings.flatMap((b) =>
      Array.from({ length: b.numberOfParticipants }, () => ({
        bookingId: b.bookingId,
        bookingCode: b.bookingCode,
        bookingStatus: b.bookingStatus,
        paymentStatus: b.paymentStatus,
      }))
    );

    return ok({
      scheduleId,
      bookedSlots: participants.length,
      participants,
    });
  }),

  // PUT /vendor/bookings/:id/confirm-booking — xác nhận giữ chỗ.
  http.put('*/vendor/bookings/:id/confirm-booking', async ({ params }) => {
    const booking = mockBookings.find((b) => b.bookingId === params.id);
    if (!booking) return fail('Không tìm thấy đơn đặt tour.', 404);

    booking.bookingStatus = 'CONFIRMED';
    booking.updatedAt = new Date().toISOString();

    return ok(toBookingDetailResponse(booking), 'Xác nhận đơn đặt tour thành công.');
  }),

  // PUT /vendor/bookings/:id/reject — từ chối / hủy đơn.
  http.put('*/vendor/bookings/:id/reject', async ({ params, request }) => {
    const booking = mockBookings.find((b) => b.bookingId === params.id);
    if (!booking) return fail('Không tìm thấy đơn đặt tour.', 404);

    const body = (await request.json().catch(() => ({}))) as { cancellationReason?: string };

    booking.bookingStatus = 'REJECTED';
    booking.cancellationReason = body.cancellationReason ?? 'Vendor từ chối đơn đặt tour.';
    booking.cancelledAt = new Date().toISOString();
    booking.updatedAt = booking.cancelledAt;
    if (booking.paidAmount > 0) {
      booking.paymentStatus = 'REFUND_PENDING';
      booking.pendingRefundAmount = booking.paidAmount;
    }

    return ok(toBookingDetailResponse(booking), 'Đã từ chối đơn đặt tour.');
  }),
];
