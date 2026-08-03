import { type ApiResponse, ApiService, ApiUpload } from '@/config/apiClient';
import type {
  BookingDetailResponse,
  BookingHistoryApiResponse,
  BookingHistoryParams,
  CreateBookingRequest,
  CreateReviewRequest,
  ReviewListParams,
  ReviewResponse,
  ReviewSummaryResponse,
  TourCheckpoint,
  TourDetailFromApi,
  TourDetailScheduleApi,
  TourListApiResponse,
  TourListParams,
} from '@/features/tours/types';

export interface TourListResponse {
  content: TourListApiResponse['content'];
  totalElements: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
  last: boolean;
}

export const PAYMENT_DEADLINE_SECONDS = 900;

/**
 * Serialize a `TourListParams` object into a query string. Only includes
 * keys with defined, non-empty values — the backend treats `keyword=` as
 * a meaningful (empty) search, but `keyword` absent means "no filter".
 */
function buildQuery(params: TourListParams): string {
  const search = new URLSearchParams();

  if (params.keyword !== undefined && params.keyword !== '') {
    search.set('keyword', params.keyword);
  }
  if (params.location !== undefined && params.location !== '') {
    search.set('location', params.location);
  }
  if (params.difficulty) {
    search.set('difficulty', params.difficulty);
  }
  if (params.page !== undefined) {
    search.set('page', String(params.page));
  }
  if (params.size !== undefined) {
    search.set('size', String(params.size));
  }
  if (params.sortBy) {
    search.set('sortBy', params.sortBy);
  }
  if (params.sortDir) {
    search.set('sortDir', params.sortDir);
  }

  return search.toString();
}

function unwrapResponse<T>(response: ApiResponse<T>): T {
  if (response.error) {
    throw new Error(response.error);
  }
  if (!response.data) {
    throw new Error('No data received from API');
  }
  return response.data;
}

export interface MockBooking {
  bookingId: string;
  tourId: string;
  tourName: string;
  coverImageUrl: string;
  departureDate: string;
  returnDate: string;
  duration: string;
  participants: Array<{ fullName: string; phone: string; email: string }>;
  status:
    | 'PENDING'
    | 'AWAITING_CONFIRMATION'
    | 'CONFIRMED'
    | 'CANCELLED'
    | 'PENDING_CANCEL'
    | 'COMPLETED';
  tourPrice: number;
  discountAmount: number;
  totalPrice: number;
  cancellationDeadline: string;
  createdAt: string;
  paymentProofUrl?: string;
  paymentMethod: string;
  notes?: string;
  cancelReason?: string;
  cancellationRefund?: number;
}

const mockBookingsDb: Record<string, MockBooking> = Object.assign(Object.create(null), {
  'TS-10293': {
    bookingId: 'TS-10293',
    tourId: '1',
    tourName: 'Khám phá Tây Bắc Mùa Lúa Chín',
    coverImageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
    departureDate: '2026-10-15',
    returnDate: '2026-10-17',
    duration: '3 ngày 2 đêm',
    participants: [
      { fullName: 'Nguyễn Văn A', phone: '0901234567', email: 'nguyenvana@gmail.com' },
      { fullName: 'Trần Thị B', phone: '0902345678', email: 'tranthib@gmail.com' },
    ],
    status: 'PENDING',
    tourPrice: 3000000,
    discountAmount: 200000,
    totalPrice: 2800000,
    cancellationDeadline: '2026-10-10',
    createdAt: new Date().toISOString(),
    paymentMethod: 'bank',
  },
  'TS-09821': {
    bookingId: 'TS-09821',
    tourId: '2',
    tourName: 'Trekking Tà Năng - Phan Dũng',
    coverImageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
    departureDate: '2026-05-12',
    returnDate: '2026-05-14',
    duration: '3 ngày 2 đêm (28km)',
    participants: [
      { fullName: 'Nguyễn Văn A', phone: '0901234567', email: 'nguyenvana@gmail.com' },
    ],
    status: 'COMPLETED',
    tourPrice: 3000000,
    discountAmount: 0,
    totalPrice: 3000000,
    cancellationDeadline: '2026-05-05',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    paymentMethod: 'bank',
  },
  'TS-08472': {
    bookingId: 'TS-08472',
    tourId: '3',
    tourName: 'Chinh phục đỉnh Fansipan',
    coverImageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
    departureDate: '2026-03-20',
    returnDate: '2026-03-22',
    duration: '3 ngày 2 đêm',
    participants: [
      { fullName: 'Nguyễn Văn A', phone: '0901234567', email: 'nguyenvana@gmail.com' },
    ],
    status: 'CANCELLED',
    tourPrice: 4000000,
    discountAmount: 0,
    totalPrice: 4000000,
    cancellationDeadline: '2026-03-13',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    paymentMethod: 'bank',
  },
});

export const tourService = {
  async getTours(params: TourListParams = {}): Promise<TourListResponse> {
    const queryString = buildQuery(params);
    const path = queryString ? `/tours?${queryString}` : '/tours';

    const response = await ApiService<TourListApiResponse>(path, 'GET');
    const data = unwrapResponse(response);

    return {
      content: data.content,
      totalElements: data.totalElements,
      totalPages: data.totalPages,
      pageNumber: data.pageNumber,
      pageSize: data.pageSize,
      last: data.last,
    };
  },

  async getTourById(tourId: string): Promise<TourDetailFromApi> {
    const response = await ApiService<TourDetailFromApi>(`/tours/${tourId}`, 'GET');
    return unwrapResponse(response);
  },

  async validateVoucher(
    code: string,
    subtotal: number,
    vendorId?: string
  ): Promise<{ discountAmount: number; isValid: boolean }> {
    const response = await ApiService<{
      discountAmount: number;
      message: string;
      valid: boolean;
    }>('/vouchers/validate', 'POST', {
      code,
      orderValue: subtotal,
      vendorId: vendorId || '',
    });

    if (response.error) {
      throw new Error(response.error);
    }

    if (!response.data) {
      throw new Error(response.message || 'Mã giảm giá không hợp lệ hoặc đã hết hạn');
    }

    return {
      discountAmount: response.data.discountAmount,
      isValid: response.data.valid,
    };
  },

  async createBooking(bookingData: CreateBookingRequest): Promise<BookingDetailResponse> {
    const response = await ApiService<BookingDetailResponse>('/bookings', 'POST', bookingData);
    return unwrapResponse(response);
  },

  async getBookingDetail(bookingId: string): Promise<BookingDetailResponse> {
    const response = await ApiService<BookingDetailResponse>(`/bookings/${bookingId}`, 'GET');
    return unwrapResponse(response);
  },

  async updateParticipants(
    bookingId: string,
    participants: MockBooking['participants']
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (mockBookingsDb[bookingId]) {
          mockBookingsDb[bookingId].participants = participants;
          resolve();
        } else {
          reject(new Error('Không tìm thấy đơn đặt chỗ'));
        }
      }, 500);
    });
  },

  async cancelBooking(
    bookingId: string,
    cancellationReason: string
  ): Promise<BookingDetailResponse> {
    const response = await ApiService<BookingDetailResponse>(
      `/bookings/${bookingId}/cancel`,
      'POST',
      { cancellationReason }
    );
    return unwrapResponse(response);
  },

  async reviewCancelRequest(
    bookingId: string,
    approved: boolean
  ): Promise<{ status: 'CANCELLED' | 'CONFIRMED' }> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const booking = mockBookingsDb[bookingId];
        if (!booking) {
          reject(new Error('Không tìm thấy đơn đặt chỗ'));
          return;
        }
        const nextStatus = approved ? 'CANCELLED' : 'CONFIRMED';
        booking.status = nextStatus;
        if (!approved) {
          booking.cancelReason = undefined;
          booking.cancellationRefund = undefined;
        }
        resolve({ status: nextStatus });
      }, 500);
    });
  },

  async rejectPayment(bookingId: string): Promise<MockBooking> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const booking = mockBookingsDb[bookingId];
        if (!booking) {
          reject(new Error('Không tìm thấy đơn đặt chỗ'));
          return;
        }
        booking.status = 'PENDING';
        booking.createdAt = new Date().toISOString();
        booking.paymentProofUrl = undefined;
        resolve(booking);
      }, 500);
    });
  },

  async updatePaymentProof(bookingId: string, file: File): Promise<BookingDetailResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await ApiUpload<BookingDetailResponse>(
      `/bookings/${bookingId}/payment-proof`,
      formData,
      'POST'
    );
    return unwrapResponse(response);
  },

  async updateBookingStatus(
    bookingId: string,
    status: MockBooking['status']
  ): Promise<{ status: MockBooking['status'] }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (mockBookingsDb[bookingId]) {
          mockBookingsDb[bookingId].status = status;
        }
        resolve({ status });
      }, 300);
    });
  },

  async getMyBookings(params: BookingHistoryParams = {}): Promise<BookingHistoryApiResponse> {
    const queryParams: Record<string, string> = {};

    if (params.status) {
      queryParams.status = params.status;
    }
    if (params.keyword !== undefined && params.keyword !== '') {
      queryParams.keyword = params.keyword;
    }
    if (params.page !== undefined) {
      queryParams.page = String(params.page);
    }
    if (params.size !== undefined) {
      queryParams.size = String(params.size);
    }
    if (params.sortBy) {
      queryParams.sortBy = params.sortBy;
    }
    if (params.sortDir) {
      queryParams.sortDir = params.sortDir;
    }

    const response = await ApiService<BookingHistoryApiResponse>(
      '/bookings/my-history',
      'GET',
      undefined,
      queryParams
    );
    return unwrapResponse(response);
  },

  async getTourCheckpoints(tourId: string): Promise<TourCheckpoint[]> {
    const response = await ApiService<TourCheckpoint[]>(`/tours/${tourId}/checkpoints`, 'GET');
    return unwrapResponse(response);
  },

  async getTourSchedules(tourId: string): Promise<TourDetailScheduleApi[]> {
    const response = await ApiService<TourDetailScheduleApi[]>(`/tours/${tourId}/schedules`, 'GET');
    return unwrapResponse(response);
  },

  async getTourReviews(
    tourId: string,
    params: ReviewListParams = {}
  ): Promise<ReviewSummaryResponse> {
    const searchParams = new URLSearchParams();
    if (params.rating !== undefined) {
      searchParams.set('rating', String(params.rating));
    }
    if (params.keyword !== undefined && params.keyword !== '') {
      searchParams.set('keyword', params.keyword);
    }
    if (params.page !== undefined) {
      searchParams.set('page', String(params.page));
    }
    if (params.size !== undefined) {
      searchParams.set('size', String(params.size));
    }
    if (params.sortBy) {
      searchParams.set('sortBy', params.sortBy);
    }
    if (params.sortDir) {
      searchParams.set('sortDir', params.sortDir);
    }
    const queryString = searchParams.toString();
    const path = queryString
      ? `/tours/${tourId}/reviews?${queryString}`
      : `/tours/${tourId}/reviews`;
    const response = await ApiService<ReviewSummaryResponse>(path, 'GET');
    return unwrapResponse(response);
  },

  async createReview(reviewData: CreateReviewRequest): Promise<ReviewResponse> {
    const response = await ApiService<ReviewResponse>('/reviews', 'POST', reviewData);
    return unwrapResponse(response);
  },

  async updateReviewStatus(
    reviewId: string,
    status: 'PENDING' | 'APPROVED' | 'HIDDEN'
  ): Promise<ReviewResponse> {
    const response = await ApiService<ReviewResponse>(`/reviews/${reviewId}/status`, 'PATCH', {
      status,
    });
    return unwrapResponse(response);
  },
};
