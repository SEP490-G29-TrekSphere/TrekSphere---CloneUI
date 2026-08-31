/**
 * Dữ liệu booking dùng chung cho mock của vendor-bookings và payments —
 * cả hai domain đều đọc/ghi trên cùng một danh sách in-memory để demo
 * xuyên suốt (thanh toán xong thì vendor-bookings cũng thấy trạng thái mới).
 */

export type MockBookingStatus =
  | 'PAYMENT_PENDING'
  | 'PENDING_CONFIRMATION'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'EXPIRED'
  | 'REJECTED'
  | 'CANCELLED';

export type MockPaymentStatus =
  | 'UNPAID'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'REFUND_PENDING'
  | 'PARTIALLY_REFUNDED'
  | 'REFUNDED';

export interface MockParticipant {
  participantId: string;
  fullName: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  idNumber?: string;
  phone?: string;
  email?: string;
  address?: string;
  specialRequirements?: string;
}

export interface MockBooking {
  bookingId: string;
  bookingCode: string;
  tourId: string;
  tourSessionId?: string;
  scheduleId: string;
  tourName: string;
  coverImageUrl: string;
  departureDate: string;
  returnDate: string;
  pricePerSlot: number;
  numberOfParticipants: number;
  originalPrice: number;
  discountAmount: number;
  totalPrice: number;
  refundAmount: number;
  bookingStatus: MockBookingStatus;
  paymentStatus: MockPaymentStatus;
  paymentPlan: 'FULL_PAYMENT' | 'DEPOSIT';
  holdExpiresAt?: string;
  confirmationExpiresAt?: string;
  remainingDueAt?: string;
  paidAmount: number;
  pendingRefundAmount: number;
  onlinePaymentEnabled: boolean;
  proofImageUrl?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
  voucherCode?: string;
  userId: string;
  userEmail: string;
  userFullName: string;
  userPhone: string;
  participants: MockParticipant[];
}

const iso = (d: string) => new Date(d).toISOString();

export const mockBookings: MockBooking[] = [
  {
    bookingId: 'booking-1',
    bookingCode: 'TS-BK-00001',
    tourId: 'tour-fansipan',
    tourSessionId: 'session-fansipan-1',
    scheduleId: 'schedule-1',
    tourName: 'Chinh phục Fansipan 3N2D - Nóc nhà Đông Dương',
    coverImageUrl: 'https://images.unsplash.com/photo-1591123120675-6f7f1aae0e5b?w=800',
    departureDate: iso('2026-09-10T05:00:00Z'),
    returnDate: iso('2026-09-12T12:00:00Z'),
    pricePerSlot: 3500000,
    numberOfParticipants: 2,
    originalPrice: 7000000,
    discountAmount: 0,
    totalPrice: 7000000,
    refundAmount: 0,
    bookingStatus: 'CONFIRMED',
    paymentStatus: 'PAID',
    paymentPlan: 'FULL_PAYMENT',
    paidAmount: 7000000,
    pendingRefundAmount: 0,
    onlinePaymentEnabled: true,
    createdAt: iso('2026-08-01T02:00:00Z'),
    updatedAt: iso('2026-08-01T02:20:00Z'),
    userId: 'user-trekker-1',
    userEmail: 'trekker@treksphere.vn',
    userFullName: 'Nguyễn Văn Trekker',
    userPhone: '0900000002',
    participants: [
      {
        participantId: 'part-1',
        fullName: 'Nguyễn Văn Trekker',
        gender: 'MALE',
        phone: '0900000002',
      },
      { participantId: 'part-2', fullName: 'Nguyễn Thị Lan', gender: 'FEMALE' },
    ],
  },
  {
    bookingId: 'booking-2',
    bookingCode: 'TS-BK-00002',
    tourId: 'tour-tanang',
    tourSessionId: 'session-tanang-1',
    scheduleId: 'schedule-2',
    tourName: 'Trekking Tà Năng - Phan Dũng 2N1D',
    coverImageUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800',
    departureDate: iso('2026-09-05T04:00:00Z'),
    returnDate: iso('2026-09-06T18:00:00Z'),
    pricePerSlot: 1200000,
    numberOfParticipants: 1,
    originalPrice: 1200000,
    discountAmount: 100000,
    totalPrice: 1100000,
    refundAmount: 0,
    bookingStatus: 'PAYMENT_PENDING',
    paymentStatus: 'UNPAID',
    paymentPlan: 'FULL_PAYMENT',
    paidAmount: 0,
    pendingRefundAmount: 0,
    onlinePaymentEnabled: true,
    holdExpiresAt: iso('2026-08-30T02:00:00Z'),
    createdAt: iso('2026-08-29T01:40:00Z'),
    updatedAt: iso('2026-08-29T01:40:00Z'),
    voucherCode: 'TREK100K',
    userId: 'user-trekker-1',
    userEmail: 'trekker@treksphere.vn',
    userFullName: 'Nguyễn Văn Trekker',
    userPhone: '0900000002',
    participants: [{ participantId: 'part-3', fullName: 'Nguyễn Văn Trekker', gender: 'MALE' }],
  },
  {
    bookingId: 'booking-3',
    bookingCode: 'TS-BK-00003',
    tourId: 'tour-sondoong',
    tourSessionId: 'session-sondoong-1',
    scheduleId: 'schedule-3',
    tourName: 'Khám phá hang Sơn Đoòng 4N3D',
    coverImageUrl: 'https://images.unsplash.com/photo-1533387520709-752d83de3630?w=800',
    departureDate: iso('2026-10-15T04:00:00Z'),
    returnDate: iso('2026-10-18T16:00:00Z'),
    pricePerSlot: 66000000,
    numberOfParticipants: 1,
    originalPrice: 66000000,
    discountAmount: 0,
    totalPrice: 66000000,
    refundAmount: 0,
    bookingStatus: 'PENDING_CONFIRMATION',
    paymentStatus: 'PARTIALLY_PAID',
    paymentPlan: 'DEPOSIT',
    paidAmount: 20000000,
    pendingRefundAmount: 0,
    onlinePaymentEnabled: true,
    confirmationExpiresAt: iso('2026-09-02T02:00:00Z'),
    remainingDueAt: iso('2026-09-30T02:00:00Z'),
    createdAt: iso('2026-08-20T03:10:00Z'),
    updatedAt: iso('2026-08-20T03:30:00Z'),
    userId: 'user-trekker-1',
    userEmail: 'trekker@treksphere.vn',
    userFullName: 'Nguyễn Văn Trekker',
    userPhone: '0900000002',
    participants: [{ participantId: 'part-4', fullName: 'Nguyễn Văn Trekker', gender: 'MALE' }],
  },
  {
    bookingId: 'booking-4',
    bookingCode: 'TS-BK-00004',
    tourId: 'tour-bachmoc',
    tourSessionId: 'session-bachmoc-1',
    scheduleId: 'schedule-4',
    tourName: 'Săn mây Bạch Mộc Lương Tử 2N1D',
    coverImageUrl: 'https://images.unsplash.com/photo-1464822070093-2c9a3a5f2e6a?w=800',
    departureDate: iso('2026-08-25T04:00:00Z'),
    returnDate: iso('2026-08-26T18:00:00Z'),
    pricePerSlot: 1500000,
    numberOfParticipants: 3,
    originalPrice: 4500000,
    discountAmount: 0,
    totalPrice: 4500000,
    refundAmount: 4500000,
    bookingStatus: 'CANCELLED',
    paymentStatus: 'REFUND_PENDING',
    paymentPlan: 'FULL_PAYMENT',
    paidAmount: 4500000,
    pendingRefundAmount: 4500000,
    onlinePaymentEnabled: true,
    cancellationReason: 'Khách hàng có việc bận đột xuất, không thể tham gia.',
    cancelledAt: iso('2026-08-18T09:00:00Z'),
    createdAt: iso('2026-08-05T07:00:00Z'),
    updatedAt: iso('2026-08-18T09:00:00Z'),
    userId: 'user-trekker-1',
    userEmail: 'trekker@treksphere.vn',
    userFullName: 'Nguyễn Văn Trekker',
    userPhone: '0900000002',
    participants: [
      { participantId: 'part-5', fullName: 'Nguyễn Văn Trekker', gender: 'MALE' },
      { participantId: 'part-6', fullName: 'Trần Văn Bình', gender: 'MALE' },
      { participantId: 'part-7', fullName: 'Lê Thị Hoa', gender: 'FEMALE' },
    ],
  },
  {
    bookingId: 'booking-5',
    bookingCode: 'TS-BK-00005',
    tourId: 'tour-langbiang',
    tourSessionId: 'session-langbiang-1',
    scheduleId: 'schedule-5',
    tourName: 'Trekking Langbiang - Đà Lạt 1N',
    coverImageUrl: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?w=800',
    departureDate: iso('2026-07-20T04:00:00Z'),
    returnDate: iso('2026-07-20T18:00:00Z'),
    pricePerSlot: 650000,
    numberOfParticipants: 2,
    originalPrice: 1300000,
    discountAmount: 0,
    totalPrice: 1300000,
    refundAmount: 0,
    bookingStatus: 'COMPLETED',
    paymentStatus: 'PAID',
    paymentPlan: 'FULL_PAYMENT',
    paidAmount: 1300000,
    pendingRefundAmount: 0,
    onlinePaymentEnabled: true,
    createdAt: iso('2026-07-01T02:00:00Z'),
    updatedAt: iso('2026-07-20T18:30:00Z'),
    userId: 'user-trekker-1',
    userEmail: 'trekker@treksphere.vn',
    userFullName: 'Nguyễn Văn Trekker',
    userPhone: '0900000002',
    participants: [
      { participantId: 'part-8', fullName: 'Nguyễn Văn Trekker', gender: 'MALE' },
      { participantId: 'part-9', fullName: 'Phạm Thị Mai', gender: 'FEMALE' },
    ],
  },
  {
    bookingId: 'booking-6',
    bookingCode: 'TS-BK-00006',
    tourId: 'tour-fansipan',
    tourSessionId: 'session-fansipan-2',
    scheduleId: 'schedule-6',
    tourName: 'Chinh phục Fansipan 3N2D - Nóc nhà Đông Dương',
    coverImageUrl: 'https://images.unsplash.com/photo-1591123120675-6f7f1aae0e5b?w=800',
    departureDate: iso('2026-09-25T05:00:00Z'),
    returnDate: iso('2026-09-27T12:00:00Z'),
    pricePerSlot: 3500000,
    numberOfParticipants: 1,
    originalPrice: 3500000,
    discountAmount: 0,
    totalPrice: 3500000,
    refundAmount: 0,
    bookingStatus: 'REJECTED',
    paymentStatus: 'REFUNDED',
    paymentPlan: 'FULL_PAYMENT',
    paidAmount: 0,
    pendingRefundAmount: 0,
    onlinePaymentEnabled: true,
    cancellationReason: 'Lịch khởi hành không đủ số lượng khách tối thiểu.',
    cancelledAt: iso('2026-08-15T06:00:00Z'),
    createdAt: iso('2026-08-10T04:00:00Z'),
    updatedAt: iso('2026-08-15T06:00:00Z'),
    userId: 'user-trekker-1',
    userEmail: 'trekker@treksphere.vn',
    userFullName: 'Nguyễn Văn Trekker',
    userPhone: '0900000002',
    participants: [{ participantId: 'part-10', fullName: 'Nguyễn Văn Trekker', gender: 'MALE' }],
  },
  {
    bookingId: 'booking-7',
    bookingCode: 'TS-BK-00007',
    tourId: 'tour-tanang',
    tourSessionId: 'session-tanang-2',
    scheduleId: 'schedule-2',
    tourName: 'Trekking Tà Năng - Phan Dũng 2N1D',
    coverImageUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800',
    departureDate: iso('2026-09-05T04:00:00Z'),
    returnDate: iso('2026-09-06T18:00:00Z'),
    pricePerSlot: 1200000,
    numberOfParticipants: 2,
    originalPrice: 2400000,
    discountAmount: 0,
    totalPrice: 2400000,
    refundAmount: 0,
    bookingStatus: 'CONFIRMED',
    paymentStatus: 'PAID',
    paymentPlan: 'FULL_PAYMENT',
    paidAmount: 2400000,
    pendingRefundAmount: 0,
    onlinePaymentEnabled: true,
    createdAt: iso('2026-08-22T04:00:00Z'),
    updatedAt: iso('2026-08-22T04:20:00Z'),
    userId: 'user-trekker-1',
    userEmail: 'trekker@treksphere.vn',
    userFullName: 'Đặng Thị Hồng',
    userPhone: '0912345678',
    participants: [
      { participantId: 'part-11', fullName: 'Đặng Thị Hồng', gender: 'FEMALE' },
      { participantId: 'part-12', fullName: 'Vũ Văn Nam', gender: 'MALE' },
    ],
  },
  {
    bookingId: 'booking-8',
    bookingCode: 'TS-BK-00008',
    tourId: 'tour-pusilung',
    tourSessionId: 'session-pusilung-1',
    scheduleId: 'schedule-8',
    tourName: 'Chinh phục Pu Si Lung - Đỉnh núi xa nhất Việt Nam',
    coverImageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800',
    departureDate: iso('2026-08-24T04:00:00Z'),
    returnDate: iso('2026-08-28T18:00:00Z'),
    pricePerSlot: 5200000,
    numberOfParticipants: 1,
    originalPrice: 5200000,
    discountAmount: 0,
    totalPrice: 5200000,
    refundAmount: 0,
    bookingStatus: 'IN_PROGRESS',
    paymentStatus: 'PAID',
    paymentPlan: 'FULL_PAYMENT',
    paidAmount: 5200000,
    pendingRefundAmount: 0,
    onlinePaymentEnabled: true,
    createdAt: iso('2026-08-01T04:00:00Z'),
    updatedAt: iso('2026-08-24T04:30:00Z'),
    userId: 'user-trekker-1',
    userEmail: 'trekker@treksphere.vn',
    userFullName: 'Hoàng Văn Sơn',
    userPhone: '0987654321',
    participants: [{ participantId: 'part-13', fullName: 'Hoàng Văn Sơn', gender: 'MALE' }],
  },
];

export function findBookingById(id: string): MockBooking | undefined {
  return mockBookings.find((b) => b.bookingId === id);
}

export function findBookingsByScheduleId(scheduleId: string): MockBooking[] {
  return mockBookings.filter((b) => b.scheduleId === scheduleId);
}
