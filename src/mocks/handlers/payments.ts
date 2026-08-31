import { http } from 'msw';
import { findBookingById } from '../data/bookings';
import { findRefundById, findRefundsByBookingId, type MockRefund } from '../data/refunds';
import { fail, ok } from '../envelope';

/**
 * Payment transactions in-memory, keyed theo bookingId — mô phỏng thanh toán
 * "thành công ngay" (không cần redirect payOS thật) cho mục đích demo.
 */
interface MockPaymentTransaction {
  paymentTransactionId: string;
  paymentStage: 'FULL' | 'DEPOSIT' | 'REMAINING';
  attemptNumber: number;
  amount: number;
  paidAmount: number;
  currency: string;
  status: 'CREATED' | 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'EXPIRED';
  orderCode: number;
  checkoutUrl: string | null;
  expiredAt: string | null;
  paidAt: string | null;
  failureCode: string | null;
  failureMessage: string | null;
  source: 'PAYOS' | 'LEGACY_BANK_TRANSFER';
  createdAt: string;
}

const paymentsByBooking = new Map<string, MockPaymentTransaction[]>();
let orderCodeSeq = 900001;
let txSeq = 1;

function seedIfPaid(bookingId: string) {
  if (paymentsByBooking.has(bookingId)) return;
  const booking = findBookingById(bookingId);
  if (!booking || booking.paidAmount <= 0) return;

  paymentsByBooking.set(bookingId, [
    {
      paymentTransactionId: `pay-tx-${bookingId}`,
      paymentStage: booking.paymentPlan === 'DEPOSIT' ? 'DEPOSIT' : 'FULL',
      attemptNumber: 1,
      amount: booking.paidAmount,
      paidAmount: booking.paidAmount,
      currency: 'VND',
      status: 'PAID',
      orderCode: orderCodeSeq++,
      checkoutUrl: null,
      expiredAt: null,
      paidAt: booking.createdAt,
      failureCode: null,
      failureMessage: null,
      source: 'PAYOS',
      createdAt: booking.createdAt,
    },
  ]);
}

/** Vendor payment settings — singleton mutable qua PUT. */
const payOsAccount = {
  vendorPaymentAccountId: 'vpa-1',
  provider: 'PAYOS' as const,
  clientId: 'a1b2c3d4-payos-client',
  credentialsConfigured: true,
  status: 'ACTIVE' as 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED',
  webhookUrl: 'https://api.treksphere.io.vn/api/v1/webhooks/payos',
};

const payoutAccount = {
  configured: true,
  clientId: 'a1b2c3d4-payos-client',
  credentialsConfigured: true,
  status: 'ACTIVE' as 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED' | null,
  maskedAccountNumber: '**** 7749',
  accountName: 'CONG TY TNHH TREKVIET ADVENTURE',
};

/** Chính sách thanh toán theo tour — map tourId -> policy, tạo mặc định nếu chưa có. */
const tourPolicies = new Map<
  string,
  {
    tourId: string;
    paymentOption: 'FULL_PAYMENT_ONLY' | 'DEPOSIT_ONLY' | 'FULL_OR_DEPOSIT';
    depositType: 'PERCENTAGE' | 'FIXED_AMOUNT' | null;
    depositValue: number | null;
    remainingDueDaysBeforeDeparture: number | null;
    policyVersion: number;
  }
>();

function getOrCreatePolicy(tourId: string) {
  let policy = tourPolicies.get(tourId);
  if (!policy) {
    policy = {
      tourId,
      paymentOption: 'FULL_OR_DEPOSIT',
      depositType: 'PERCENTAGE',
      depositValue: 30,
      remainingDueDaysBeforeDeparture: 7,
      policyVersion: 1,
    };
    tourPolicies.set(tourId, policy);
  }
  return policy;
}

function maskAccountNumber(accountNumber: string): string {
  if (accountNumber.length <= 4) return `**** ${accountNumber}`;
  return `**** ${accountNumber.slice(-4)}`;
}

function toRefundTransaction(r: MockRefund) {
  return {
    refundTransactionId: r.refundTransactionId,
    bookingId: r.bookingId,
    paymentTransactionId: r.paymentTransactionId,
    amount: r.amount,
    reason: r.reason,
    reasonDetail: r.reasonDetail ?? null,
    status: r.status,
    refundMethod: r.refundMethod,
    destinationBin: r.destinationBin ?? null,
    destinationAccountNumber: r.destinationAccountNumber ?? null,
    maskedDestinationAccountNumber: r.maskedDestinationAccountNumber ?? null,
    destinationAccountName: r.destinationAccountName ?? null,
    gatewayRefundId: r.gatewayRefundId ?? null,
    manualBankReference: r.manualBankReference ?? null,
    requestedAt: r.requestedAt,
    processingAt: r.processingAt ?? null,
    completedAt: r.completedAt ?? null,
    dueAt: r.dueAt ?? null,
    nextRetryAt: r.nextRetryAt ?? null,
    attemptCount: r.attemptCount ?? 0,
    failureCode: r.failureCode ?? null,
    failureMessage: r.failureMessage ?? null,
    bookingCode: r.bookingCode ?? null,
    vendorName: r.vendorName ?? null,
    automaticPayoutAvailable: r.automaticPayoutAvailable,
    manualReceiptUrl: r.manualReceiptUrl ?? null,
    manualSubmittedAt: r.manualSubmittedAt ?? null,
    adminReviewedAt: r.adminReviewedAt ?? null,
    adminReviewNote: r.adminReviewNote ?? null,
  };
}

export const paymentHandlers = [
  // POST /bookings/:bookingId/payments/checkout — tạo phiên thanh toán, mô phỏng "thành công ngay".
  http.post('*/bookings/:bookingId/payments/checkout', async ({ params }) => {
    const bookingId = params.bookingId as string;
    const booking = findBookingById(bookingId);
    if (!booking) return fail('Không tìm thấy đơn đặt tour.', 404);

    const isDeposit = booking.paymentPlan === 'DEPOSIT' && booking.paymentStatus === 'UNPAID';
    const amount = isDeposit
      ? Math.round(booking.totalPrice * 0.3)
      : booking.totalPrice - booking.paidAmount;

    const tx: MockPaymentTransaction = {
      paymentTransactionId: `pay-tx-${txSeq++}`,
      paymentStage: isDeposit
        ? 'DEPOSIT'
        : booking.paymentPlan === 'DEPOSIT'
          ? 'REMAINING'
          : 'FULL',
      attemptNumber: (paymentsByBooking.get(bookingId)?.length ?? 0) + 1,
      amount,
      paidAmount: amount,
      currency: 'VND',
      status: 'PAID',
      orderCode: orderCodeSeq++,
      checkoutUrl: `https://pay.payos.vn/web/mock-${bookingId}`,
      expiredAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      paidAt: new Date().toISOString(),
      failureCode: null,
      failureMessage: null,
      source: 'PAYOS',
      createdAt: new Date().toISOString(),
    };

    const existing = paymentsByBooking.get(bookingId) ?? [];
    paymentsByBooking.set(bookingId, [...existing, tx]);

    // Cập nhật trạng thái booking để phản ánh thanh toán "thành công ngay".
    booking.paidAmount += amount;
    booking.paymentStatus = booking.paidAmount >= booking.totalPrice ? 'PAID' : 'PARTIALLY_PAID';
    if (booking.bookingStatus === 'PAYMENT_PENDING') {
      booking.bookingStatus = 'PENDING_CONFIRMATION';
    }
    booking.updatedAt = new Date().toISOString();

    return ok(
      {
        paymentTransactionId: tx.paymentTransactionId,
        bookingId,
        paymentStage: tx.paymentStage,
        amount: tx.amount,
        currency: tx.currency,
        status: tx.status,
        orderCode: tx.orderCode,
        checkoutUrl: tx.checkoutUrl,
        qrCode: null,
        expiredAt: tx.expiredAt,
      },
      'Thanh toán thành công.'
    );
  }),

  // GET /bookings/:bookingId/payments
  http.get('*/bookings/:bookingId/payments', async ({ params }) => {
    const bookingId = params.bookingId as string;
    seedIfPaid(bookingId);
    return ok(paymentsByBooking.get(bookingId) ?? []);
  }),

  // GET /bookings/:bookingId/refunds
  http.get('*/bookings/:bookingId/refunds', async ({ params }) => {
    const bookingId = params.bookingId as string;
    return ok(findRefundsByBookingId(bookingId).map(toRefundTransaction));
  }),

  // GET /bookings/:bookingId/cancellation-quote
  http.get('*/bookings/:bookingId/cancellation-quote', async ({ params }) => {
    const booking = findBookingById(params.bookingId as string);
    if (!booking) return fail('Không tìm thấy đơn đặt tour.', 404);

    const alreadyRefunded = findRefundsByBookingId(booking.bookingId).reduce(
      (sum, r) => (r.status === 'REFUNDED' ? sum + r.amount : sum),
      0
    );
    const refundablePaidAmount = Math.max(0, booking.paidAmount - alreadyRefunded);
    const daysBeforeDeparture = Math.max(
      0,
      Math.ceil((new Date(booking.departureDate).getTime() - Date.now()) / (24 * 3600 * 1000))
    );
    const refundPercentage = daysBeforeDeparture >= 7 ? 100 : daysBeforeDeparture >= 3 ? 50 : 0;
    const refundAmount = Math.round((refundablePaidAmount * refundPercentage) / 100);
    const cancellationFee = refundablePaidAmount - refundAmount;

    return ok({
      paidAmount: booking.paidAmount,
      alreadyRefundedOrPendingAmount: alreadyRefunded,
      refundablePaidAmount,
      nonRefundableCost: 0,
      refundPercentage,
      refundAmount,
      cancellationFee,
      daysBeforeDeparture,
      appliedPolicyDescription:
        refundPercentage === 100
          ? 'Hủy trước 7 ngày: hoàn 100% số tiền đã thanh toán.'
          : refundPercentage === 50
            ? 'Hủy trước 3-6 ngày: hoàn 50% số tiền đã thanh toán.'
            : 'Hủy trong vòng 3 ngày trước khởi hành: không hoàn tiền.',
      refundDestinationRequired: refundAmount > 0,
    });
  }),

  // PUT /bookings/refunds/:refundId/destination
  http.put('*/bookings/refunds/:refundId/destination', async ({ params, request }) => {
    const refund = findRefundById(params.refundId as string);
    if (!refund) return fail('Không tìm thấy yêu cầu hoàn tiền.', 404);

    const body = (await request.json().catch(() => ({}))) as {
      bankBin?: string;
      accountNumber?: string;
      accountName?: string;
    };

    refund.destinationBin = body.bankBin ?? refund.destinationBin;
    refund.destinationAccountNumber = body.accountNumber ?? refund.destinationAccountNumber;
    refund.maskedDestinationAccountNumber = body.accountNumber
      ? maskAccountNumber(body.accountNumber)
      : refund.maskedDestinationAccountNumber;
    refund.destinationAccountName = body.accountName ?? refund.destinationAccountName;

    return ok(toRefundTransaction(refund), 'Cập nhật thông tin nhận hoàn tiền thành công.');
  }),

  // GET/PUT /vendor/payment-settings/payos-account
  http.get('*/vendor/payment-settings/payos-account', async () => ok(payOsAccount)),
  http.put('*/vendor/payment-settings/payos-account', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as { clientId?: string };
    payOsAccount.clientId = body.clientId ?? payOsAccount.clientId;
    payOsAccount.credentialsConfigured = true;
    payOsAccount.status = 'ACTIVE';
    return ok(payOsAccount, 'Cấu hình tài khoản PayOS thành công.');
  }),

  // GET/PUT /vendor/payment-settings/payout-account
  http.get('*/vendor/payment-settings/payout-account', async () => ok(payoutAccount)),
  http.put('*/vendor/payment-settings/payout-account', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as { clientId?: string };
    payoutAccount.clientId = body.clientId ?? payoutAccount.clientId;
    payoutAccount.configured = true;
    payoutAccount.credentialsConfigured = true;
    payoutAccount.status = 'ACTIVE';
    return ok(payoutAccount, 'Cấu hình tài khoản nhận tiền thành công.');
  }),

  // GET/PUT /vendor/payment-settings/tours/:tourId/policy
  http.get('*/vendor/payment-settings/tours/:tourId/policy', async ({ params }) =>
    ok(getOrCreatePolicy(params.tourId as string))
  ),
  http.put('*/vendor/payment-settings/tours/:tourId/policy', async ({ params, request }) => {
    const policy = getOrCreatePolicy(params.tourId as string);
    const body = (await request.json().catch(() => ({}))) as Partial<typeof policy>;
    Object.assign(policy, body);
    policy.policyVersion += 1;
    return ok(policy, 'Cập nhật chính sách thanh toán thành công.');
  }),

  // POST /vendor/bookings/refunds/:refundId/process — vendor tự xử lý hoàn tiền tự động.
  http.post('*/vendor/bookings/refunds/:refundId/process', async ({ params }) => {
    const refund = findRefundById(params.refundId as string);
    if (!refund) return fail('Không tìm thấy yêu cầu hoàn tiền.', 404);

    refund.status = 'REFUNDED';
    refund.refundMethod = refund.automaticPayoutAvailable ? 'PAYOUT' : 'GATEWAY_REFUND';
    refund.gatewayRefundId = refund.gatewayRefundId ?? `payos-rf-${Date.now()}`;
    refund.processingAt = refund.processingAt ?? new Date().toISOString();
    refund.completedAt = new Date().toISOString();

    const booking = findBookingById(refund.bookingId);
    if (booking) {
      booking.paymentStatus =
        booking.pendingRefundAmount >= booking.paidAmount ? 'REFUNDED' : 'PARTIALLY_REFUNDED';
      booking.pendingRefundAmount = 0;
      booking.updatedAt = new Date().toISOString();
    }

    return ok(toRefundTransaction(refund), 'Xử lý hoàn tiền thành công.');
  }),

  // POST /vendor/bookings/refunds/:refundId/complete-manual — vendor xác nhận đã chuyển khoản thủ công.
  http.post('*/vendor/bookings/refunds/:refundId/complete-manual', async ({ params, request }) => {
    const refund = findRefundById(params.refundId as string);
    if (!refund) return fail('Không tìm thấy yêu cầu hoàn tiền.', 404);

    const body = (await request.json().catch(() => ({}))) as {
      bankReference?: string;
      receiptImageUrl?: string;
      note?: string;
    };

    refund.refundMethod = 'MANUAL';
    refund.status = 'MANUAL_REVIEW';
    refund.manualBankReference = body.bankReference ?? refund.manualBankReference;
    refund.manualReceiptUrl = body.receiptImageUrl ?? refund.manualReceiptUrl;
    refund.manualSubmittedAt = new Date().toISOString();
    if (body.note) refund.reasonDetail = body.note;

    return ok(
      toRefundTransaction(refund),
      'Đã gửi minh chứng chuyển khoản thủ công, chờ admin duyệt.'
    );
  }),
];
