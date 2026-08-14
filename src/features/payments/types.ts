export type PaymentPlan = 'FULL_PAYMENT' | 'DEPOSIT';
export type PaymentOption = 'FULL_PAYMENT_ONLY' | 'DEPOSIT_ONLY' | 'FULL_OR_DEPOSIT';
export type DepositType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export type PaymentStatus =
  | 'UNPAID'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'REFUND_PENDING'
  | 'PARTIALLY_REFUNDED'
  | 'REFUNDED';

export type PaymentStage = 'FULL' | 'DEPOSIT' | 'REMAINING';
export type PaymentTransactionStatus =
  | 'CREATED'
  | 'PENDING'
  | 'PROCESSING'
  | 'PAID'
  | 'FAILED'
  | 'CANCELLED'
  | 'EXPIRED';

export type RefundStatus =
  | 'PENDING'
  | 'AWAITING_VENDOR_ACTION'
  | 'PROCESSING'
  | 'MANUAL_REVIEW'
  | 'OVERDUE'
  | 'REFUNDED'
  | 'FAILED'
  | 'CANCELLED';
export type RefundMethod = 'PAYOUT' | 'GATEWAY_REFUND' | 'MANUAL';
export type RefundReason =
  | 'TREKKER_CANCEL'
  | 'VENDOR_CANCEL'
  | 'INSUFFICIENT_PAX'
  | 'NO_SHOW'
  | 'PAYMENT_ADJUSTMENT'
  | 'OTHER';

export interface TourPaymentPolicy {
  tourId: string;
  paymentOption: PaymentOption;
  depositType?: DepositType | null;
  depositValue?: number | null;
  remainingDueDaysBeforeDeparture?: number | null;
  policyVersion: number;
}

export interface TourPaymentPolicyPayload {
  paymentOption: PaymentOption;
  depositType?: DepositType;
  depositValue?: number;
  remainingDueDaysBeforeDeparture?: number;
}

export interface VendorPaymentAccount {
  vendorPaymentAccountId: string;
  provider: 'PAYOS';
  clientId: string;
  credentialsConfigured: boolean;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED';
  webhookUrl?: string | null;
}

export interface VendorPayoutAccount {
  configured: boolean;
  clientId?: string | null;
  credentialsConfigured: boolean;
  status?: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED' | null;
  maskedAccountNumber?: string | null;
  accountName?: string | null;
}

export interface PayOsAccountPayload {
  clientId: string;
  apiKey: string;
  checksumKey: string;
}

export interface PaymentCheckout {
  paymentTransactionId: string;
  bookingId: string;
  paymentStage: PaymentStage;
  amount: number;
  currency: string;
  status: PaymentTransactionStatus;
  orderCode: number;
  checkoutUrl: string;
  qrCode?: string | null;
  expiredAt: string;
}

export interface PaymentTransaction {
  paymentTransactionId: string;
  paymentStage: PaymentStage;
  attemptNumber: number;
  amount: number;
  paidAmount: number;
  currency: string;
  status: PaymentTransactionStatus;
  orderCode?: number | null;
  checkoutUrl?: string | null;
  expiredAt?: string | null;
  paidAt?: string | null;
  failureCode?: string | null;
  failureMessage?: string | null;
  source?: 'PAYOS' | 'LEGACY_BANK_TRANSFER';
  createdAt?: string | null;
}

export interface RefundTransaction {
  refundTransactionId: string;
  bookingId: string;
  paymentTransactionId: string;
  amount: number;
  reason: RefundReason;
  reasonDetail?: string | null;
  status: RefundStatus;
  refundMethod: RefundMethod;
  destinationBin?: string | null;
  destinationAccountNumber?: string | null;
  maskedDestinationAccountNumber?: string | null;
  destinationAccountName?: string | null;
  gatewayRefundId?: string | null;
  manualBankReference?: string | null;
  requestedAt: string;
  processingAt?: string | null;
  completedAt?: string | null;
  dueAt?: string | null;
  nextRetryAt?: string | null;
  attemptCount?: number;
  failureCode?: string | null;
  failureMessage?: string | null;
  bookingCode?: string | null;
  vendorName?: string | null;
  automaticPayoutAvailable: boolean;
  manualReceiptUrl?: string | null;
  manualSubmittedAt?: string | null;
  adminReviewedAt?: string | null;
  adminReviewNote?: string | null;
}

export interface CancellationQuote {
  paidAmount: number;
  alreadyRefundedOrPendingAmount: number;
  refundablePaidAmount: number;
  nonRefundableCost: number;
  refundPercentage: number;
  refundAmount: number;
  cancellationFee: number;
  daysBeforeDeparture: number;
  appliedPolicyDescription?: string | null;
  refundDestinationRequired: boolean;
}

export interface RefundDestinationPayload {
  bankBin: string;
  accountNumber: string;
  accountName: string;
}
