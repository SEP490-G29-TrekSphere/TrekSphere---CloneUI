import { type ApiResponse, ApiService } from '@/config/apiClient';
import type {
  BookingDetailResponse,
  BookingStats,
  VendorBookingFilter,
  VendorBookingItem,
  VendorBookingListResponse,
} from '../types';

interface ApiBookingDto {
  bookingId: string;
  bookingCode: string;
  tourName: string;
  coverImageUrl?: string | null;
  departureDate: string;
  returnDate: string;
  numberOfParticipants: number;
  totalPrice: number;
  bookingStatus: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
  createdAt: string;
  customerName?: string;
  proofImageUrl?: string | null;
}

interface PaginationBookingDto {
  content: ApiBookingDto[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

function unwrapResponse<T>(response: ApiResponse<T>): T {
  if (response.error) {
    throw new Error(response.error);
  }
  if (response.data === undefined) {
    throw new Error('Không nhận được dữ liệu từ máy chủ');
  }
  return response.data;
}

function mapBookingItem(dto: ApiBookingDto): VendorBookingItem {
  return {
    bookingId: dto.bookingId,
    bookingCode: dto.bookingCode,
    tourName: dto.tourName,
    coverImageUrl: dto.coverImageUrl ?? undefined,
    departureDate: dto.departureDate,
    returnDate: dto.returnDate,
    numberOfParticipants: dto.numberOfParticipants,
    totalPrice: dto.totalPrice,
    bookingStatus: dto.bookingStatus,
    paymentStatus: dto.paymentStatus,
    createdAt: dto.createdAt,
    customerName: dto.customerName,
    proofImageUrl: dto.proofImageUrl ?? undefined,
  };
}

export const vendorBookingService = {
  /**
   * Lấy tổng số lượng thống kê các đơn hàng thực tế từ backend.
   */
  async getStats(): Promise<BookingStats> {
    const [totalRes, pendingPaymentRes, confirmedRes, refundedRes] = await Promise.all([
      ApiService<PaginationBookingDto>('/vendor/bookings', 'GET', undefined, {
        page: '0',
        size: '1',
      }),
      ApiService<PaginationBookingDto>('/vendor/bookings', 'GET', undefined, {
        page: '0',
        size: '1',
        paymentStatus: 'PENDING',
      }),
      ApiService<PaginationBookingDto>('/vendor/bookings', 'GET', undefined, {
        page: '0',
        size: '1',
        bookingStatus: 'CONFIRMED',
      }),
      ApiService<PaginationBookingDto>('/vendor/bookings', 'GET', undefined, {
        page: '0',
        size: '1',
        paymentStatus: 'REFUNDED',
      }),
    ]);

    return {
      totalBookings: unwrapResponse(totalRes).totalElements ?? 0,
      pendingPayments: unwrapResponse(pendingPaymentRes).totalElements ?? 0,
      confirmedTreks: unwrapResponse(confirmedRes).totalElements ?? 0,
      refunded: unwrapResponse(refundedRes).totalElements ?? 0,
    };
  },

  /**
   * Lấy danh sách các đơn đặt tour với các bộ lọc phân trang, trạng thái, tour, từ khoá.
   * Endpoint: GET /api/v1/vendor/bookings
   */
  async listBookings(
    filter: VendorBookingFilter = {},
    page = 1,
    size = 10
  ): Promise<VendorBookingListResponse> {
    // API backend dùng 0-indexed page number
    const pageIndex = Math.max(0, page - 1);

    const queryParams: Record<string, string> = {
      page: pageIndex.toString(),
      size: size.toString(),
      sortBy: filter.sortBy || 'createdAt',
      sortDir: filter.sortDir || 'desc',
    };

    if (filter.bookingStatus) queryParams.bookingStatus = filter.bookingStatus;
    if (filter.paymentStatus) queryParams.paymentStatus = filter.paymentStatus;
    if (filter.tourId) queryParams.tourId = filter.tourId;
    if (filter.keyword?.trim()) queryParams.keyword = filter.keyword.trim();

    const response = await ApiService<PaginationBookingDto>(
      '/vendor/bookings',
      'GET',
      undefined,
      queryParams
    );

    const data = unwrapResponse(response);

    return {
      content: (data.content || []).map(mapBookingItem),
      pageNumber: data.pageNumber,
      pageSize: data.pageSize,
      totalElements: data.totalElements,
      totalPages: data.totalPages,
      last: data.last,
    };
  },

  /**
   * Xác nhận giữ chỗ chính thức cho đơn đặt tour.
   * Endpoint: PUT /api/v1/vendor/bookings/{id}/confirm-booking
   */
  async confirmBooking(bookingId: string): Promise<BookingDetailResponse> {
    const response = await ApiService<BookingDetailResponse>(
      `/vendor/bookings/${bookingId}/confirm-booking`,
      'PUT'
    );
    return unwrapResponse(response);
  },

  /**
   * Xác nhận đã nhận tiền thanh toán thành công cho đơn đặt tour (chuyển sang PAID).
   * Endpoint: PUT /api/v1/vendor/bookings/{id}/confirm-payment
   */
  async confirmPayment(bookingId: string): Promise<BookingDetailResponse> {
    const response = await ApiService<BookingDetailResponse>(
      `/vendor/bookings/${bookingId}/confirm-payment`,
      'PUT'
    );
    return unwrapResponse(response);
  },

  /**
   * Xác nhận đã hoàn tiền cho khách cho đơn bị hủy (chuyển sang REFUNDED).
   * Endpoint: PUT /api/v1/vendor/bookings/{id}/refund
   */
  async confirmRefund(bookingId: string): Promise<BookingDetailResponse> {
    const response = await ApiService<BookingDetailResponse>(
      `/vendor/bookings/${bookingId}/refund`,
      'PUT'
    );
    return unwrapResponse(response);
  },

  /**
   * Từ chối / Hủy đơn đặt tour của khách.
   * Endpoint: PUT /api/v1/vendor/bookings/{id}/reject
   */
  async rejectBooking(
    bookingId: string,
    cancellationReason: string
  ): Promise<BookingDetailResponse> {
    const response = await ApiService<BookingDetailResponse>(
      `/vendor/bookings/${bookingId}/reject`,
      'PUT',
      { cancellationReason }
    );
    return unwrapResponse(response);
  },
};
