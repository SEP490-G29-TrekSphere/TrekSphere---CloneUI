import { type ApiResponse, ApiService } from '@/config/apiClient';
import type {
  BookingDetailResponse,
  BookingStats,
  BookingStatus,
  PaymentStatus,
  ScheduleBookingItem,
  ScheduleBookingManifest,
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
  bookingStatus:
    | 'PENDING'
    | 'PAYMENT_PENDING'
    | 'PENDING_CONFIRMATION'
    | 'CONFIRMED'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'EXPIRED'
    | 'REJECTED'
    | 'CANCELLED';
  paymentStatus:
    | 'PENDING'
    | 'UNPAID'
    | 'PARTIALLY_PAID'
    | 'PAID'
    | 'REFUND_PENDING'
    | 'PARTIALLY_REFUNDED'
    | 'REFUNDED';
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

interface ApiManifestParticipantDto {
  bookingId?: string;
  bookingCode?: string;
  bookingStatus?: ApiBookingDto['bookingStatus'];
  paymentStatus?: ApiBookingDto['paymentStatus'];
}

interface ApiScheduleManifestDto {
  scheduleId?: string;
  bookedSlots?: number;
  participants?: ApiManifestParticipantDto[];
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
  const paymentStatus = dto.paymentStatus === 'PENDING' ? 'UNPAID' : dto.paymentStatus;
  const bookingStatus =
    dto.bookingStatus === 'PENDING'
      ? paymentStatus === 'PAID'
        ? 'PENDING_CONFIRMATION'
        : 'PAYMENT_PENDING'
      : dto.bookingStatus;
  return {
    bookingId: dto.bookingId,
    bookingCode: dto.bookingCode,
    tourName: dto.tourName,
    coverImageUrl: dto.coverImageUrl ?? undefined,
    departureDate: dto.departureDate,
    returnDate: dto.returnDate,
    numberOfParticipants: dto.numberOfParticipants,
    totalPrice: dto.totalPrice,
    bookingStatus,
    paymentStatus,
    createdAt: dto.createdAt,
    customerName: dto.customerName,
    proofImageUrl: dto.proofImageUrl ?? undefined,
  };
}

function normalizeBookingStatus(
  status: ApiBookingDto['bookingStatus'],
  paymentStatus: PaymentStatus
): BookingStatus {
  if (status !== 'PENDING') return status;
  return paymentStatus === 'PAID' ? 'PENDING_CONFIRMATION' : 'PAYMENT_PENDING';
}

function normalizePaymentStatus(status: ApiBookingDto['paymentStatus']): PaymentStatus {
  return status === 'PENDING' ? 'UNPAID' : status;
}

async function countBookings(params: Record<string, string>): Promise<number> {
  const response = await ApiService<PaginationBookingDto>('/vendor/bookings', 'GET', undefined, {
    page: '0',
    size: '1',
    ...params,
  });
  if (response.error || !response.data) return 0;
  return response.data.totalElements ?? 0;
}

export const vendorBookingService = {
  /**
   * Lấy tổng số lượng thống kê các đơn hàng thực tế từ backend.
   */
  async getStats(): Promise<BookingStats> {
    const [totalBookings, pendingPayments, confirmedTreks, pendingRefunds] = await Promise.all([
      countBookings({}),
      countBookings({ paymentStatus: 'UNPAID' }),
      countBookings({ bookingStatus: 'CONFIRMED' }),
      countBookings({ paymentStatus: 'REFUND_PENDING' }),
    ]);

    return {
      totalBookings,
      pendingPayments,
      confirmedTreks,
      pendingRefunds,
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
   * Lấy booking theo chính xác `scheduleId` từ manifest, sau đó nhóm các dòng
   * hành khách về một booking. Không dùng cặp ngày vì hai lịch có thể trùng ngày.
   */
  async getScheduleBookingManifest(scheduleId: string): Promise<ScheduleBookingManifest> {
    const response = await ApiService<ApiScheduleManifestDto>(
      `/vendor/dashboard/schedules/${scheduleId}/manifest`,
      'GET'
    );
    const data = unwrapResponse(response);

    if (data.scheduleId && data.scheduleId !== scheduleId) {
      throw new Error('Dữ liệu manifest không khớp lịch khởi hành cần xử lý.');
    }

    const groupedBookings = new Map<string, ScheduleBookingItem>();
    for (const participant of data.participants ?? []) {
      if (
        !participant.bookingId ||
        !participant.bookingCode ||
        !participant.bookingStatus ||
        !participant.paymentStatus
      ) {
        throw new Error('Manifest thiếu thông tin booking cần thiết để hủy lịch an toàn.');
      }

      const paymentStatus = normalizePaymentStatus(participant.paymentStatus);
      const bookingStatus = normalizeBookingStatus(participant.bookingStatus, paymentStatus);
      const current = groupedBookings.get(participant.bookingId);

      if (current) {
        if (
          current.bookingCode !== participant.bookingCode ||
          current.bookingStatus !== bookingStatus ||
          current.paymentStatus !== paymentStatus
        ) {
          throw new Error('Manifest có dữ liệu không đồng nhất trong cùng một booking.');
        }
        current.numberOfParticipants += 1;
        continue;
      }

      groupedBookings.set(participant.bookingId, {
        bookingId: participant.bookingId,
        bookingCode: participant.bookingCode,
        numberOfParticipants: 1,
        bookingStatus,
        paymentStatus,
      });
    }

    return {
      scheduleId: data.scheduleId ?? scheduleId,
      bookedSlots: data.bookedSlots ?? 0,
      bookings: [...groupedBookings.values()],
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
