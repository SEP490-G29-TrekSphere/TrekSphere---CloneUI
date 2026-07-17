import { type ApiResponse, ApiService } from '@/config/apiClient';
import type {
  TourDetailFromApi,
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

  async getAvailableVouchers(): Promise<
    Array<{
      code: string;
      description: string;
      discountAmount: number;
      minSpend: number;
      isExceeded: boolean;
      isExpired: boolean;
    }>
  > {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            code: 'TREKNEW',
            description: 'Giảm 200.000đ cho mọi đơn hàng',
            discountAmount: 200000,
            minSpend: 0,
            isExceeded: false,
            isExpired: false,
          },
          {
            code: 'SUMMER50',
            description: 'Giảm 500.000đ cho đơn hàng từ 3.000.000đ',
            discountAmount: 500000,
            minSpend: 3000000,
            isExceeded: false,
            isExpired: false,
          },
          {
            code: 'LIMITEXCEEDED',
            description: 'Giảm 100.000đ (Voucher đã đạt giới hạn)',
            discountAmount: 100000,
            minSpend: 0,
            isExceeded: true,
            isExpired: false,
          },
          {
            code: 'EXPIRED',
            description: 'Giảm 150.000đ (Voucher đã hết hạn)',
            discountAmount: 150000,
            minSpend: 0,
            isExceeded: false,
            isExpired: true,
          },
        ]);
      }, 300);
    });
  },

  async validateVoucher(
    code: string,
    subtotal: number
  ): Promise<{ discountAmount: number; isValid: boolean }> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const uppercaseCode = code.toUpperCase();
        if (uppercaseCode === 'TREKNEW') {
          resolve({ discountAmount: 200000, isValid: true });
        } else if (uppercaseCode === 'SUMMER50') {
          if (subtotal < 3000000) {
            reject(
              new Error('Đơn hàng chưa đạt giá trị tối thiểu 3.000.000đ để áp dụng voucher này')
            );
          } else {
            resolve({ discountAmount: 500000, isValid: true });
          }
        } else if (uppercaseCode === 'LIMITEXCEEDED') {
          reject(new Error('Voucher này đã hết lượt sử dụng'));
        } else {
          reject(new Error('Voucher is invalid or has expired'));
        }
      }, 500);
    });
  },

  async createBooking(bookingData: {
    tourId: string;
    scheduleId: string;
    fullName: string;
    phone: string;
    email: string;
    notes?: string;
    participants: number;
    paymentMethod: string;
    voucherCode?: string;
    tourName?: string;
    tourPrice?: number;
    discountAmount?: number;
    totalPrice?: number;
  }): Promise<{ bookingId: string; status: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const bookingId = `BK-${Math.floor(100000 + Math.random() * 900000)}`;
        const newBooking: MockBooking = {
          bookingId,
          tourId: bookingData.tourId,
          tourName: bookingData.tourName || 'Trekking Tà Năng - Phan Dũng',
          coverImageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
          departureDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          returnDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          duration: '3 ngày 2 đêm',
          participants: Array.from({ length: bookingData.participants }).map((_, i) => ({
            fullName: i === 0 ? bookingData.fullName : `Khách đi cùng ${i}`,
            phone: i === 0 ? bookingData.phone : '',
            email: i === 0 ? bookingData.email : '',
          })),
          status: 'PENDING',
          tourPrice: bookingData.tourPrice ?? 3000000,
          discountAmount: bookingData.discountAmount ?? 0,
          totalPrice: bookingData.totalPrice ?? 3000000,
          cancellationDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          createdAt: new Date().toISOString(),
          paymentMethod: bookingData.paymentMethod,
          notes: bookingData.notes,
        };
        mockBookingsDb[bookingId] = newBooking;
        resolve({
          bookingId,
          status: 'PENDING',
        });
      }, 1000);
    });
  },

  async getBookingDetail(bookingId: string): Promise<MockBooking> {
    return new Promise((resolve, _reject) => {
      setTimeout(() => {
        const booking = mockBookingsDb[bookingId];
        if (booking) {
          resolve(booking);
        } else {
          // If not found, create a temporary PENDING one for backward compatibility / debug
          const tempBooking: MockBooking = {
            bookingId: bookingId || 'TS-10293',
            tourId: '1',
            tourName: 'Trekking Tà Năng - Phan Dũng',
            coverImageUrl:
              'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
            departureDate: '2026-10-15',
            returnDate: '2026-10-17',
            duration: '3 ngày 2 đêm (28km)',
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
          };
          mockBookingsDb[tempBooking.bookingId] = tempBooking;
          resolve(tempBooking);
        }
      }, 500);
    });
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

  async requestCancel(
    bookingId: string,
    refundAmount: number,
    reason?: string
  ): Promise<{ status: 'PENDING_CANCEL' }> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const booking = mockBookingsDb[bookingId];
        if (!booking) {
          reject(new Error('Không tìm thấy đơn đặt chỗ'));
          return;
        }
        const nonCancellable = ['CANCELLED', 'COMPLETED', 'PENDING_CANCEL'];
        if (nonCancellable.includes(booking.status)) {
          reject(new Error('Đơn đặt chỗ không ở trạng thái có thể yêu cầu hủy.'));
          return;
        }
        booking.status = 'PENDING_CANCEL';
        booking.cancelReason = reason;
        booking.cancellationRefund = refundAmount;
        resolve({ status: 'PENDING_CANCEL' });
      }, 500);
    });
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

  async uploadPaymentProof(
    bookingId: string,
    file: File
  ): Promise<{ status: 'AWAITING_CONFIRMATION'; paymentProofUrl: string }> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const booking = mockBookingsDb[bookingId];
        if (!booking) {
          reject(new Error('Không tìm thấy đơn đặt chỗ'));
          return;
        }
        if (booking.status !== 'PENDING') {
          reject(new Error('Đơn hàng không ở trạng thái chờ thanh toán.'));
          return;
        }
        const createdTime = new Date(booking.createdAt).getTime();
        const elapsedSeconds = Math.floor((Date.now() - createdTime) / 1000);
        if (elapsedSeconds >= PAYMENT_DEADLINE_SECONDS) {
          booking.status = 'CANCELLED';
          reject(new Error('Đã quá thời hạn thanh toán 15 phút.'));
          return;
        }
        const dummyUrl = URL.createObjectURL(file);
        booking.status = 'AWAITING_CONFIRMATION';
        booking.paymentProofUrl = dummyUrl;
        resolve({
          status: 'AWAITING_CONFIRMATION',
          paymentProofUrl: dummyUrl,
        });
      }, 1500);
    });
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

  async getMyBookings(
    page = 1,
    limit = 5
  ): Promise<{
    content: Array<{
      bookingId: string;
      tourName: string;
      departureDate: string;
      status: MockBooking['status'];
    }>;
    hasMore: boolean;
  }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const allBookings = Object.values(mockBookingsDb).map((b) => ({
          bookingId: b.bookingId,
          tourName: b.tourName,
          departureDate: b.departureDate,
          status: b.status,
        }));
        const start = (page - 1) * limit;
        const end = start + limit;
        const pageContent = allBookings.slice(start, end);
        const hasMore = end < allBookings.length;
        resolve({
          content: pageContent,
          hasMore,
        });
      }, 500);
    });
  },
};
