// src/features/vendor-bookings/types.ts

import type { PaymentPlan, PaymentStatus } from '@/features/payments/types';

export type BookingStatus =
  | 'PAYMENT_PENDING'
  | 'PENDING_CONFIRMATION'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'EXPIRED'
  | 'REJECTED'
  | 'CANCELLED';

export type { PaymentStatus } from '@/features/payments/types';

export interface VendorBookingItem {
  bookingId: string;
  bookingCode: string;
  tourName: string;
  coverImageUrl?: string;
  departureDate: string;
  returnDate: string;
  numberOfParticipants: number;
  totalPrice: number;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentPlan?: PaymentPlan;
  paidAmount?: number;
  pendingRefundAmount?: number;
  holdExpiresAt?: string;
  confirmationExpiresAt?: string;
  remainingDueAt?: string;
  createdAt: string;
  customerName?: string; // bổ sung hỗ trợ nếu BE/mock có
  proofImageUrl?: string;
}

export interface VendorBookingFilter {
  bookingStatus?: BookingStatus;
  paymentStatus?: PaymentStatus;
  tourId?: string;
  keyword?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface VendorBookingListResponse {
  content: VendorBookingItem[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

/** Booking rút gọn được nhóm từ manifest của đúng một lịch khởi hành. */
export interface ScheduleBookingItem {
  bookingId: string;
  bookingCode: string;
  numberOfParticipants: number;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
}

/** Dữ liệu đối chiếu dùng khi Vendor hủy toàn bộ một lịch khởi hành. */
export interface ScheduleBookingManifest {
  scheduleId: string;
  bookedSlots: number;
  bookings: ScheduleBookingItem[];
}

export interface ParticipantDto {
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

export interface BookingDetailResponse {
  bookingId: string;
  bookingCode: string;
  tourId: string;
  tourName: string;
  coverImageUrl?: string;
  departureDate: string;
  returnDate: string;
  pricePerSlot: number;
  numberOfParticipants: number;
  originalPrice: number;
  discountAmount: number;
  totalPrice: number;
  refundAmount?: number;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentPlan: PaymentPlan;
  paidAmount: number;
  pendingRefundAmount: number;
  holdExpiresAt?: string;
  confirmationExpiresAt?: string;
  remainingDueAt?: string;
  proofImageUrl?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
  voucherCode?: string;
  userId: string;
  userEmail?: string;
  userFullName?: string;
  userPhone?: string;
  participants?: ParticipantDto[];
}

export interface BookingStats {
  totalBookings: number;
  pendingPayments: number;
  confirmedTreks: number;
  pendingRefunds: number;
}
