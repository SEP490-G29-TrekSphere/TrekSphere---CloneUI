/**
 * Dữ liệu refund transaction dùng chung cho mock của payments (vendor) và
 * admin (duyệt refund thủ công) — cùng thao tác trên một danh sách in-memory.
 */

export type MockRefundStatus =
  | 'PENDING'
  | 'AWAITING_VENDOR_ACTION'
  | 'PROCESSING'
  | 'MANUAL_REVIEW'
  | 'OVERDUE'
  | 'REFUNDED'
  | 'FAILED'
  | 'CANCELLED';

export type MockRefundMethod = 'PAYOUT' | 'GATEWAY_REFUND' | 'MANUAL';
export type MockRefundReason =
  | 'TREKKER_CANCEL'
  | 'VENDOR_CANCEL'
  | 'INSUFFICIENT_PAX'
  | 'NO_SHOW'
  | 'PAYMENT_ADJUSTMENT'
  | 'OTHER';

export interface MockRefund {
  refundTransactionId: string;
  bookingId: string;
  bookingCode: string;
  vendorName: string;
  paymentTransactionId: string;
  amount: number;
  reason: MockRefundReason;
  reasonDetail?: string;
  status: MockRefundStatus;
  refundMethod: MockRefundMethod;
  destinationBin?: string;
  destinationAccountNumber?: string;
  maskedDestinationAccountNumber?: string;
  destinationAccountName?: string;
  gatewayRefundId?: string;
  manualBankReference?: string;
  requestedAt: string;
  processingAt?: string;
  completedAt?: string;
  dueAt?: string;
  nextRetryAt?: string;
  attemptCount?: number;
  failureCode?: string;
  failureMessage?: string;
  automaticPayoutAvailable: boolean;
  manualReceiptUrl?: string;
  manualSubmittedAt?: string;
  adminReviewedAt?: string;
  adminReviewNote?: string;
}

const iso = (d: string) => new Date(d).toISOString();

export const mockRefunds: MockRefund[] = [
  {
    refundTransactionId: 'refund-1',
    bookingId: 'booking-4',
    bookingCode: 'TS-BK-00004',
    vendorName: 'TrekViet Adventure',
    paymentTransactionId: 'pay-tx-4',
    amount: 4500000,
    reason: 'TREKKER_CANCEL',
    reasonDetail: 'Khách hủy vì lý do cá nhân',
    status: 'AWAITING_VENDOR_ACTION',
    refundMethod: 'GATEWAY_REFUND',
    automaticPayoutAvailable: true,
    requestedAt: iso('2026-08-18T09:00:00Z'),
    dueAt: iso('2026-08-25T09:00:00Z'),
    attemptCount: 0,
  },
  {
    refundTransactionId: 'refund-2',
    bookingId: 'booking-6',
    bookingCode: 'TS-BK-00006',
    vendorName: 'Fansipan Trek Co.',
    paymentTransactionId: 'pay-tx-6',
    amount: 3500000,
    reason: 'INSUFFICIENT_PAX',
    reasonDetail: 'Lịch khởi hành không đủ số lượng khách tối thiểu',
    status: 'REFUNDED',
    refundMethod: 'GATEWAY_REFUND',
    gatewayRefundId: 'payos-rf-98213',
    automaticPayoutAvailable: true,
    requestedAt: iso('2026-08-15T06:00:00Z'),
    processingAt: iso('2026-08-15T06:05:00Z'),
    completedAt: iso('2026-08-15T06:10:00Z'),
  },
  {
    refundTransactionId: 'refund-3',
    bookingId: 'booking-3',
    bookingCode: 'TS-BK-00003',
    vendorName: 'Sơn Đoòng Explorer',
    paymentTransactionId: 'pay-tx-3',
    amount: 5000000,
    reason: 'PAYMENT_ADJUSTMENT',
    reasonDetail: 'Điều chỉnh do đổi lịch trình, hoàn một phần cọc',
    status: 'MANUAL_REVIEW',
    refundMethod: 'MANUAL',
    automaticPayoutAvailable: false,
    destinationBin: '970436',
    maskedDestinationAccountNumber: '**** 4821',
    destinationAccountName: 'NGUYEN VAN TREKKER',
    manualReceiptUrl: 'https://res.cloudinary.com/treksphere/mock/refund-receipt-3.jpg',
    manualSubmittedAt: iso('2026-08-24T03:00:00Z'),
    requestedAt: iso('2026-08-22T02:00:00Z'),
    dueAt: iso('2026-08-29T02:00:00Z'),
  },
  {
    refundTransactionId: 'refund-4',
    bookingId: 'booking-2',
    bookingCode: 'TS-BK-00002',
    vendorName: 'Tà Năng Trail',
    paymentTransactionId: 'pay-tx-2',
    amount: 1100000,
    reason: 'VENDOR_CANCEL',
    reasonDetail: 'Nhà cung cấp hủy tour do thời tiết xấu',
    status: 'PROCESSING',
    refundMethod: 'PAYOUT',
    automaticPayoutAvailable: true,
    requestedAt: iso('2026-08-27T01:00:00Z'),
    processingAt: iso('2026-08-27T01:05:00Z'),
  },
  {
    refundTransactionId: 'refund-5',
    bookingId: 'booking-5',
    bookingCode: 'TS-BK-00005',
    vendorName: 'Langbiang Homestay & Trek',
    paymentTransactionId: 'pay-tx-5',
    amount: 650000,
    reason: 'NO_SHOW',
    reasonDetail: 'Khách không tham gia được 1 slot, hoàn 50%',
    status: 'OVERDUE',
    refundMethod: 'GATEWAY_REFUND',
    automaticPayoutAvailable: true,
    requestedAt: iso('2026-08-05T02:00:00Z'),
    dueAt: iso('2026-08-12T02:00:00Z'),
    attemptCount: 2,
    failureCode: 'GATEWAY_TIMEOUT',
    failureMessage: 'PayOS không phản hồi sau 3 lần thử.',
  },
];

export function findRefundById(id: string): MockRefund | undefined {
  return mockRefunds.find((r) => r.refundTransactionId === id);
}

export function findRefundsByBookingId(bookingId: string): MockRefund[] {
  return mockRefunds.filter((r) => r.bookingId === bookingId);
}

let refundCounter = mockRefunds.length + 1;
export function nextRefundId(): string {
  return `refund-${refundCounter++}`;
}
