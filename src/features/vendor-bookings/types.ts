// src/features/vendor-bookings/types.ts

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED' | 'PARTIALLY_REFUNDED';

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
  createdAt: string;
  customerName?: string; // bổ sung hỗ trợ nếu BE/mock có
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
  refunded: number;
}
