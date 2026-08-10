import { type ApiResponse, ApiService } from '@/config/apiClient';
import type {
  DashboardOverview,
  ManifestPassenger,
  ManifestPaymentStatus,
  ReportFilter,
  RevenueChartPoint,
  RiskLevel,
  ScheduleManifest,
  TopTourItem,
  UnderCapacityAlert,
  UpcomingSchedule,
} from '../types';

const BASE = '/vendor/dashboard';

function unwrapResponse<T>(response: ApiResponse<T>): T {
  if (response.error) {
    throw new Error(response.error);
  }
  if (response.data === undefined) {
    throw new Error('Không nhận được dữ liệu từ máy chủ');
  }
  return response.data;
}

function toNumber(value: unknown): number {
  const parsed = typeof value === 'string' ? Number(value) : value;
  return typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Chuẩn hoá payload dạng danh sách về mảng.
 *
 * BE trả list ở ba dạng khác nhau tuỳ endpoint: mảng trần, `{ content: [...] }`
 * kiểu Spring Page, hoặc bọc trong một DTO có thêm metadata
 * (`{ groupBy, dataPoints: [...] }`). Thay vì liệt kê từng tên field có thể
 * gặp, lấy luôn mảng đầu tiên tìm thấy trong object — sai tên field sẽ chỉ làm
 * biểu đồ trống một cách âm thầm, rất khó phát hiện.
 */
function toArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (!value || typeof value !== 'object') return [];

  const record = value as Record<string, unknown>;
  if (Array.isArray(record.content)) return record.content as T[];

  const firstArray = Object.values(record).find((field) => Array.isArray(field));
  return (firstArray as T[] | undefined) ?? [];
}

const RISK_LEVELS: readonly RiskLevel[] = ['SAFE', 'WARNING', 'DANGER'];
const PAYMENT_STATUSES: readonly ManifestPaymentStatus[] = [
  'PENDING',
  'PAID',
  'REFUNDED',
  'PARTIALLY_REFUNDED',
];

/**
 * Số ngày còn lại tới ngày khởi hành, tính theo mốc 00:00 giờ địa phương để
 * không bị lệch một ngày do giờ trong `departureDate`.
 * BE chỉ trả `daysLeft` ở endpoint cảnh báo, còn `upcoming-schedules` thì không.
 */
function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  if (Number.isNaN(target.getTime())) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

function toRiskLevel(value: unknown): RiskLevel {
  const upper = String(value ?? '').toUpperCase() as RiskLevel;
  return RISK_LEVELS.includes(upper) ? upper : 'WARNING';
}

function toPaymentStatus(value: unknown): ManifestPaymentStatus {
  const upper = String(value ?? '').toUpperCase() as ManifestPaymentStatus;
  return PAYMENT_STATUSES.includes(upper) ? upper : 'PENDING';
}

/**
 * Query params dùng chung cho overview / revenue-chart / top-tours.
 * Chỉ gửi `startDate`/`endDate` khi `timeRange = CUSTOM` — gửi thừa có thể
 * khiến BE hiểu nhầm là muốn override khoảng thời gian preset.
 */
function buildRangeParams(filter: ReportFilter): Record<string, string> {
  const params: Record<string, string> = { timeRange: filter.timeRange };
  if (filter.timeRange === 'CUSTOM') {
    if (filter.startDate) params.startDate = filter.startDate;
    if (filter.endDate) params.endDate = filter.endDate;
  }
  return params;
}

interface ApiOverviewDto {
  totalRevenue?: number;
  revenueChangePercentage?: number;
  totalTravelers?: number;
  travelersChangePercentage?: number;
  avgOccupancyRate?: number;
  occupancyRateChangePercentage?: number;
  cancellationRate?: number;
  cancellationRateChangePercentage?: number;
}

/** `RevenueChartPointResponse` */
interface ApiRevenuePointDto {
  label?: string;
  revenue?: number;
  totalBookings?: number;
}

/** `TopSellingTourResponse` */
interface ApiTopTourDto {
  tourId?: string;
  tourName?: string;
  totalTravelers?: number;
  totalRevenue?: number;
}

/** `UpcomingScheduleResponse` */
interface ApiUpcomingScheduleDto {
  scheduleId?: string;
  tourId?: string;
  tourName?: string;
  departureDate?: string;
  bookedSlots?: number;
  minCapacity?: number;
  maxCapacity?: number;
  occupancyRate?: number;
  riskStatus?: string;
  statusColor?: string;
}

/** `UnderCapacityAlertResponse` */
interface ApiUnderCapacityAlertDto {
  scheduleId?: string;
  tourName?: string;
  departureDate?: string;
  daysLeft?: number;
  bookedSlots?: number;
  minCapacity?: number;
  missingSlots?: number;
  alertMessage?: string;
}

/** `ParticipantManifestResponse` */
interface ApiPassengerDto {
  bookingId?: string;
  bookingCode?: string;
  bookerName?: string;
  bookerPhone?: string;
  bookerEmail?: string;
  participantId?: string;
  fullName?: string;
  gender?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  specialNote?: string;
  paymentStatus?: string;
  bookingStatus?: string;
}

/** `ScheduleManifestResponse` */
interface ApiManifestDto {
  scheduleId?: string;
  tourName?: string;
  departureDate?: string;
  returnDate?: string;
  bookedSlots?: number;
  maxCapacity?: number;
  minCapacity?: number;
  participants?: unknown;
}

function mapRevenuePoint(dto: ApiRevenuePointDto): RevenueChartPoint {
  return {
    label: dto.label ?? '',
    revenue: toNumber(dto.revenue),
    bookingCount: toNumber(dto.totalBookings),
  };
}

function mapTopTour(dto: ApiTopTourDto): TopTourItem {
  return {
    tourId: dto.tourId ?? '',
    tourName: dto.tourName ?? 'Không rõ tên tour',
    totalTravelers: toNumber(dto.totalTravelers),
    totalRevenue: toNumber(dto.totalRevenue),
  };
}

function mapUpcomingSchedule(dto: ApiUpcomingScheduleDto): UpcomingSchedule {
  const departureDate = dto.departureDate ?? '';
  return {
    scheduleId: dto.scheduleId ?? '',
    tourId: dto.tourId,
    tourName: dto.tourName ?? 'Không rõ tên tour',
    departureDate,
    currentBookings: toNumber(dto.bookedSlots),
    minCapacity: toNumber(dto.minCapacity),
    maxCapacity: toNumber(dto.maxCapacity),
    occupancyRate: toNumber(dto.occupancyRate),
    riskLevel: toRiskLevel(dto.riskStatus),
    daysUntilDeparture: daysUntil(departureDate),
  };
}

function mapUnderCapacityAlert(dto: ApiUnderCapacityAlertDto): UnderCapacityAlert {
  return {
    scheduleId: dto.scheduleId ?? '',
    tourName: dto.tourName ?? 'Không rõ tên tour',
    departureDate: dto.departureDate ?? '',
    currentBookings: toNumber(dto.bookedSlots),
    minCapacity: toNumber(dto.minCapacity),
    missingSlots: toNumber(dto.missingSlots),
    daysUntilDeparture: toNumber(dto.daysLeft),
    alertMessage: dto.alertMessage ?? '',
  };
}

/**
 * Hành khách chỉ có SĐT riêng, còn email thì BE gắn ở cấp người đặt đơn
 * (`bookerEmail`) — dùng thông tin người đặt để lấp chỗ trống khi cần liên hệ.
 */
function mapPassenger(dto: ApiPassengerDto): ManifestPassenger {
  return {
    id: dto.participantId,
    bookingCode: dto.bookingCode,
    fullName: dto.fullName ?? '—',
    phoneNumber: dto.phoneNumber ?? dto.bookerPhone,
    email: dto.bookerEmail,
    gender: dto.gender,
    dateOfBirth: dto.dateOfBirth,
    specialRequirements: dto.specialNote,
    paymentStatus: toPaymentStatus(dto.paymentStatus),
  };
}

export const vendorReportService = {
  /**
   * 4 thẻ KPI tổng quan (doanh thu, lượt khách, tỷ lệ lấp đầy, tỷ lệ hủy).
   * Endpoint: GET /api/v1/vendor/dashboard/overview
   */
  async getOverview(filter: ReportFilter): Promise<DashboardOverview> {
    const response = await ApiService<ApiOverviewDto>(
      `${BASE}/overview`,
      'GET',
      undefined,
      buildRangeParams(filter)
    );
    const dto = unwrapResponse(response);

    return {
      totalRevenue: toNumber(dto.totalRevenue),
      revenueChangePercentage: toNumber(dto.revenueChangePercentage),
      totalTravelers: toNumber(dto.totalTravelers),
      travelersChangePercentage: toNumber(dto.travelersChangePercentage),
      avgOccupancyRate: toNumber(dto.avgOccupancyRate),
      occupancyRateChangePercentage: toNumber(dto.occupancyRateChangePercentage),
      cancellationRate: toNumber(dto.cancellationRate),
      cancellationRateChangePercentage: toNumber(dto.cancellationRateChangePercentage),
    };
  },

  /**
   * Chuỗi điểm dữ liệu doanh thu + số booking theo ngày hoặc theo tháng.
   * Endpoint: GET /api/v1/vendor/dashboard/revenue-chart
   */
  async getRevenueChart(filter: ReportFilter): Promise<RevenueChartPoint[]> {
    const response = await ApiService<unknown>(`${BASE}/revenue-chart`, 'GET', undefined, {
      ...buildRangeParams(filter),
      groupBy: filter.groupBy,
    });
    return toArray<ApiRevenuePointDto>(unwrapResponse(response)).map(mapRevenuePoint);
  },

  /**
   * Xếp hạng tour có nhiều hành khách đăng ký nhất.
   * Endpoint: GET /api/v1/vendor/dashboard/top-tours
   */
  async getTopTours(filter: ReportFilter, limit = 5): Promise<TopTourItem[]> {
    const response = await ApiService<unknown>(`${BASE}/top-tours`, 'GET', undefined, {
      ...buildRangeParams(filter),
      limit: String(limit),
    });
    return toArray<ApiTopTourDto>(unwrapResponse(response)).map(mapTopTour);
  },

  /**
   * Lịch khởi hành sắp tới kèm tỷ lệ lấp đầy và mức rủi ro.
   * Endpoint: GET /api/v1/vendor/dashboard/upcoming-schedules
   */
  async getUpcomingSchedules(limit = 10, daysAhead?: number): Promise<UpcomingSchedule[]> {
    const params: Record<string, string> = { limit: String(limit) };
    if (daysAhead !== undefined) params.daysAhead = String(daysAhead);

    const response = await ApiService<unknown>(
      `${BASE}/upcoming-schedules`,
      'GET',
      undefined,
      params
    );
    return toArray<ApiUpcomingScheduleDto>(unwrapResponse(response)).map(mapUpcomingSchedule);
  },

  /**
   * Các chuyến sắp khởi hành trong X ngày tới nhưng chưa đủ số khách tối thiểu.
   * Endpoint: GET /api/v1/vendor/dashboard/under-capacity-alerts
   */
  async getUnderCapacityAlerts(alertDaysThreshold = 7): Promise<UnderCapacityAlert[]> {
    const response = await ApiService<unknown>(`${BASE}/under-capacity-alerts`, 'GET', undefined, {
      alertDaysThreshold: String(alertDaysThreshold),
    });
    return toArray<ApiUnderCapacityAlertDto>(unwrapResponse(response)).map(mapUnderCapacityAlert);
  },

  /**
   * Danh sách toàn bộ hành khách của một lịch khởi hành.
   * Endpoint: GET /api/v1/vendor/dashboard/schedules/{scheduleId}/manifest
   */
  async getScheduleManifest(scheduleId: string): Promise<ScheduleManifest> {
    const response = await ApiService<ApiManifestDto>(
      `${BASE}/schedules/${scheduleId}/manifest`,
      'GET'
    );
    const dto = unwrapResponse(response);
    const passengers = toArray<ApiPassengerDto>(dto.participants).map(mapPassenger);

    return {
      scheduleId: dto.scheduleId ?? scheduleId,
      tourName: dto.tourName ?? 'Không rõ tên tour',
      departureDate: dto.departureDate ?? '',
      totalPassengers: dto.bookedSlots ?? passengers.length,
      passengers,
    };
  },
};
