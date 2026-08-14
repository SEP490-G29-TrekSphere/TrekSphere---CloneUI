import type { PaymentPlan, PaymentStatus, TourPaymentPolicy } from '@/features/payments/types';
import type { CancellationPolicy } from '@/features/vendor-cancellation-policies/types';

export type { PaymentStatus } from '@/features/payments/types';

export type TourLevel = 'Dễ' | 'Trung bình' | 'Khó' | 'Khám phá';

export interface Tour {
  id: string;
  name: string;
  description: string;
  duration: string;
  level: TourLevel;
  price: string;
  basePrice?: number;
  originalPrice?: string;
  rating: number;
  reviewCount: number;
  image: string;
  images?: string[];
  badge?: string;
  slug: string;
  category: string;
  location: string;
  maxParticipants: number;
  highlights: string[];
  includes: string[];
  excludes?: string[];
  schedule?: string;
  isPopular?: boolean;
  isNew?: boolean;
  onlineBookingEnabled?: boolean;
  onlineBookingDisabledReason?: string | null;
}

// ============================================================
// Detailed Tour Types for Tour Detail Page
// ============================================================

/**
 * Tour itinerary day - represents a single day in the tour schedule
 */
export interface TourItineraryDay {
  day: number;
  title: string;
  description: string;
  activities: string[];
  meals?: ('Sáng' | 'Trưa' | 'Tối')[];
  accommodation?: string;
  image?: string;
}

/**
 * Tour review from a traveler
 */
export interface TourReview {
  id: string;
  author: string;
  avatar?: string;
  rating: number;
  date: string;
  title: string;
  content: string;
  tourId: string;
  helpful: number;
}

/**
 * Discriminated union for tab navigation state
 */
export type TourTabId = 'details' | 'itinerary' | 'reviews';

export interface TourTabState {
  activeTab: TourTabId;
}

export type TourTabAction =
  | { type: 'SET_TAB'; payload: TourTabId }
  | { type: 'NEXT_TAB' }
  | { type: 'PREV_TAB' };

/**
 * Booking form state for the sticky sidebar
 */
export interface BookingFormState {
  selectedDate: Date | null;
  participants: number;
  totalPrice: number;
}

/**
 * Gallery image with metadata
 */
export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  isPrimary?: boolean;
}

/**
 * Complete tour detail with all additional fields
 */
export interface TourDetail extends Omit<Tour, 'images'> {
  fullDescription: string;
  dayByDay: TourItineraryDay[];
  gallery: GalleryImage[];
  reviews: TourReview[];
  reviewSummary: {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<number, number>;
  };
  departureDates: string[];
  tourOperator?: string;
  groupSize?: string;
  startingPoint?: string;
  endingPoint?: string;
}

// ============================================================
// Type Utilities for CSS Class Generation
// ============================================================

/**
 * Template literal type for level-based styling
 */
export type LevelClass = `${TourLevel}-level`;

/**
 * Mapped type for level badge variants
 */
export type LevelBadgeVariant = {
  [K in TourLevel]: 'default' | 'secondary' | 'outline' | 'destructive';
};

export const levelBadgeVariants: LevelBadgeVariant = {
  Dễ: 'secondary',
  'Trung bình': 'outline',
  Khó: 'destructive',
  'Khám phá': 'default',
} as const;

/**
 * Utility type for optional tour fields with defaults
 */
export type TourWithDefaults = Required<Tour>;

export interface TourCategory {
  id: string;
  name: string;
  icon: string;
  count: number;
  /** Optional cover image used by the circular category pills on the List Tours page. */
  image?: string;
}

/**
 * UI-facing filter shape owned by the List Tours page.
 *
 * Mirrors {@link TourListParams} for the fields the API supports, plus
 * category for client-side UI display (the category chips don't drive a
 * query because the backend doesn't filter on category yet — see
 * `features/tours/pages/ListTours.tsx` for the note).
 */
export interface TourFilter {
  /** Free-text keyword sent as the `keyword` query param. */
  keyword?: string;
  /** Destination/location sent as the `location` query param. */
  location?: string;
  /** Difficulty enum sent as the `difficulty` query param. */
  difficulty?: ApiDifficulty;
  /**
   * Map-friendly UI sort key. Each value translates to a (sortBy, sortDir)
   * pair sent to the API.
   *
   * Không có key `rating`: backend không sort được theo điểm đánh giá
   * (xem ghi chú ở `ApiSortField`).
   */
  sortBy?: 'price-asc' | 'price-desc' | 'newest' | 'duration-asc' | 'duration-desc' | 'name-asc';
  departureDate?: string;
  returnDate?: string;
}

// ============================================================
// API Types for List Tours
// ============================================================

/**
 * Difficulty levels from the API
 */
export type ApiDifficulty = 'HARD' | 'MODERATE' | 'EXPERT' | 'EASY' | 'BEGINNER';

/**
 * Status values from the API
 */
export type ApiStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'HIDDEN';

/**
 * Allowed sort directions from the API
 */
export type ApiSortDir = 'asc' | 'desc';

/**
 * Allowed sort fields. The API defaults to `createdAt`.
 *
 * `averageRating` KHÔNG có trong danh sách này: entity `Tour` phía backend
 * không khai báo thuộc tính đó (điểm trung bình tính từ bảng review), nên
 * `sortBy=averageRating` khiến Hibernate ném `UnknownPathException` → 500.
 * Muốn xếp theo điểm đánh giá thì phải sort ở client.
 */
export type ApiSortField = 'createdAt' | 'basePrice' | 'durationDays' | 'tourName';

/**
 * Query params for fetching tours list.
 *
 * Source of truth: Swagger screenshots for `/api/v1/tours`. The backend
 * currently accepts:
 *   - keyword       (string, free-text search)
 *   - location      (string, exact-match location filter)
 *   - difficulty    (string, one of ApiDifficulty)
 *   - page          (integer, default 0)
 *   - size          (integer, default 10)
 *   - sortBy        (string, default 'createdAt')
 *   - sortDir       (string, default 'desc')
 *
 * Future server-side filters (price min/max, duration range, rating,
 * date range, category, status) are intentionally NOT typed here so
 * the FE never sends params the BE ignores. Add them once the BE
 * supports them.
 */
export interface TourListParams {
  keyword?: string;
  location?: string;
  difficulty?: ApiDifficulty;
  departureDate?: string;
  returnDate?: string;
  page?: number;
  size?: number;
  sortBy?: ApiSortField;
  sortDir?: ApiSortDir;
}

/**
 * Individual tour item from API response
 */
export interface TourApiItem {
  tourId: string;
  tourName: string;
  location: string;
  durationDays: number;
  basePrice: number;
  minCapacity: number;
  maxCapacity: number;
  totalDistanceKm: number;
  difficulty: ApiDifficulty;
  status: ApiStatus;
  coverImageUrl: string;
  highlights: string;
  includes: string;
  excludes: string;
  vendorId: string;
  vendorName: string;
  averageRating: number | null;
  totalReviews: number;
  createdAt: string;
  category?: string;
  onlineBookingEnabled?: boolean;
  onlineBookingDisabledReason?: string | null;
}

export type FitnessLevel = 'ANY' | 'BASIC' | 'MODERATE' | 'HIGH' | 'EXTREME';

export interface TourParticipationPolicy {
  tourId: string;
  policyVersion: number;
  minAge?: number | null;
  maxAge?: number | null;
  minHeightCm?: number | null;
  maxHeightCm?: number | null;
  minWeightKg?: number | null;
  maxWeightKg?: number | null;
  fitnessLevel: FitnessLevel;
  healthRequirements?: string | null;
  restrictedMedicalConditions?: string | null;
  requiredExperience?: string | null;
  requiredSkills?: string | null;
  requiredEquipment?: string | null;
  requiredDocuments?: string | null;
  requiresHealthDeclaration: boolean;
  requiresMedicalCertificate: boolean;
  guardianRequiredUnderAge?: number | null;
  additionalRequirements?: string | null;
}

/**
 * Paginated response from tours API
 */
export interface TourListApiResponse {
  content: TourApiItem[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// ============================================================
// API Types for Tour Detail (GET /api/v1/tours/{tourId})
// ============================================================

/**
 * Image object from the tour detail API response
 */
export interface TourDetailImageApi {
  imageId: string;
  imageUrl: string;
  sortOrder: number;
  caption: string | null;
}

/**
 * Schedule object from the tour detail API response
 */
export interface TourDetailScheduleApi {
  scheduleId: string;
  tourId: string;
  departureDate: string;
  returnDate: string;
  availableSlots: number;
  bookedSlots: number;
  price: number;
  status: 'OPEN' | 'CLOSED' | 'CANCELLED' | 'COMPLETED';
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  deletedAt: string | null;
  deletedBy: string | null;
}

/**
 * Full tour detail from the API endpoint: GET /api/v1/tours/{tourId}
 *
 * This mirrors the `data` field inside the standard envelope
 * `{ success, code, message, data, timestamp }`.
 */
export interface TourDetailFromApi {
  tourId: string;
  tourName: string;
  description: string;
  difficulty: ApiDifficulty;
  location: string;
  durationDays: number;
  basePrice: number;
  minCapacity: number;
  maxCapacity: number;
  totalDistanceKm: number;
  highlights: string | null;
  includes: string | null;
  excludes: string | null;
  coverImageUrl: string | null;
  status: ApiStatus;
  createdAt: string;
  updatedAt: string | null;
  vendorId: string;
  vendorManagerId: string;
  vendorName: string;
  vendorLogoUrl: string | null;
  vendorContactEmail: string | null;
  vendorContactPhone: string | null;
  creatorId: string;
  creatorName: string;
  creatorEmail: string;
  images: TourDetailImageApi[];
  schedules: TourDetailScheduleApi[];
  /**
   * Điều khoản hủy tour & hoàn tiền của vendor sở hữu tour. BE nhúng sẵn vào
   * `GET /tours/{id}` nên trekker đọc được mà không cần gọi endpoint vendor.
   * Optional vì vendor có thể chưa cấu hình chính sách nào.
   */
  cancellationPolicies?: CancellationPolicy[];
  /** Policy thanh toán của riêng tour, được BE nhúng vào tour detail. */
  paymentPolicy?: TourPaymentPolicy;
  /** Điều kiện tham gia do vendor cấu hình riêng cho tour. */
  participationPolicy?: TourParticipationPolicy | null;
  /** False vẫn cho xem tour public nhưng khóa tạo booking online. */
  onlineBookingEnabled?: boolean;
  onlineBookingDisabledReason?: string | null;
  /** Chi phí đã phát sinh và không hoàn lại khi tính yêu cầu hủy. */
  nonRefundableCost?: number;
  averageRating: number | null;
  totalReviews: number;
}

export interface TourSearchValues {
  keyword: string;
  location: string;
  departureDate: string;
  budget: string;
}

// ============================================================
// API Types for My Booking History (GET /api/v1/bookings/my-history)
// ============================================================

export type BookingStatus =
  | 'PAYMENT_PENDING'
  | 'PENDING_CONFIRMATION'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'EXPIRED'
  | 'REJECTED'
  | 'CANCELLED';

export interface BookingItemFromApi {
  bookingId: string;
  bookingCode: string;
  tourName: string;
  coverImageUrl: string;
  departureDate: string;
  returnDate: string;
  numberOfParticipants: number;
  totalPrice: number;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
}

export interface BookingHistoryParams {
  status?: BookingStatus;
  keyword?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: ApiSortDir;
}

export interface BookingHistoryApiResponse {
  content: BookingItemFromApi[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// ============================================================
// API Types for Booking Detail (GET /api/v1/bookings/{id})
// ============================================================

export type ParticipantGender = 'MALE' | 'FEMALE' | 'OTHER';

export interface BookingParticipantFromApi {
  participantId: string;
  fullName: string;
  dateOfBirth?: string;
  gender?: ParticipantGender;
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
  /**
   * ID của Tour Session thực địa tương ứng — cần để gửi SOS (`POST /tracking/sos`).
   * Optional vì BE hiện chưa trả field này ở `GET /bookings/{id}`; khi có, panel
   * SOS ở `BookingDetail.tsx` sẽ tự hiện ra mà không cần sửa code thêm.
   */
  tourSessionId?: string;
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
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentPlan: PaymentPlan;
  holdExpiresAt?: string;
  confirmationExpiresAt?: string;
  remainingDueAt?: string;
  participationPolicyAcceptedAt?: string;
  paidAmount: number;
  pendingRefundAmount: number;
  onlinePaymentEnabled?: boolean;
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
  refundBankName?: string;
  refundAccountNumber?: string;
  refundAccountHolder?: string;
  refundProofImageUrl?: string;
  participants: BookingParticipantFromApi[];
  reviewed?: boolean;
}

export interface BookingCancelRequest {
  cancellationReason: string;
  /** Mã BIN ngân hàng nhận hoàn tiền — ví dụ: "970436". */
  refundBankBin?: string;
  /** Số tài khoản nhận hoàn tiền. */
  refundAccountNumber?: string;
  /** Tên chủ tài khoản nhận hoàn tiền — ví dụ: "NGUYEN VAN A". */
  refundAccountName?: string;
}

export interface PaymentProofRequest {
  proofImageUrl: string;
}

export interface BookingParticipantRequest {
  fullName: string;
  dateOfBirth: string;
  gender: ParticipantGender;
  idNumber: string;
  phone: string;
  email?: string;
  address?: string;
  specialRequirements?: string;
}

export interface CreateBookingRequest {
  scheduleId: string;
  voucherCode?: string;
  paymentPlan: PaymentPlan;
  participationPolicyAccepted?: boolean;
  participants: BookingParticipantRequest[];
}

export interface ApiResponseBookingDetailResponse {
  success: boolean;
  code: number;
  message: string;
  data: BookingDetailResponse;
  errors?: Array<{
    field?: string;
    message?: string;
    timestamp?: string;
  }>;
  timestamp?: string;
}

export interface TourCheckpoint {
  checkpointId: string;
  tourId: string;
  checkpointName: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  altitude: number | null;
  checkpointOrder: number;
  checkpointImageUrl: string | null;
  /** Danh sách URL ảnh checkpoint đã được backend tách từ trường lưu trữ. */
  checkpointImageUrls?: string[];
}

export interface ReviewItem {
  reviewId: string;
  rating: number;
  content: string;
  status: 'PENDING' | 'APPROVED' | 'HIDDEN';
  userId: string;
  userFullName: string;
  userAvatarUrl: string | null;
  tourId: string;
  tourName: string;
  tourCoverImageUrl: string | null;
  bookingId: string;
  bookingCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewSummaryResponse {
  averageRating: number;
  totalReviews: number;
  fiveStar: number;
  fourStar: number;
  threeStar: number;
  twoStar: number;
  oneStar: number;
  reviews: {
    content: ReviewItem[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
  };
}

export interface ReviewListParams {
  rating?: number;
  keyword?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
}

export interface CreateReviewRequest {
  bookingId: string;
  rating: number;
  content: string;
}

export interface ReviewResponse {
  reviewId: string;
  rating: number;
  content: string;
  status: 'PENDING' | 'APPROVED' | 'HIDDEN';
  userId: string;
  userFullName: string;
  userAvatarUrl: string | null;
  tourId: string;
  tourName: string;
  tourCoverImageUrl: string | null;
  bookingId: string;
  bookingCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateReviewStatusRequest {
  status: 'PENDING' | 'APPROVED' | 'HIDDEN';
}
