/**
 * Types cho màn Báo cáo & Thống kê của Vendor.
 *
 * Nguồn dữ liệu: `/api/v1/vendor/dashboard/*` — BE tự trích Vendor từ tài khoản
 * đang đăng nhập nên FE không cần truyền vendorId.
 */

/** Khoảng thời gian thống kê. `CUSTOM` mới cần `startDate`/`endDate`. */
export type TimeRange = 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'THIS_QUARTER' | 'CUSTOM';

/** Mốc gộp dữ liệu của biểu đồ doanh thu. */
export type GroupBy = 'DAY' | 'MONTH';

/**
 * Mức độ rủi ro của một lịch khởi hành:
 * - SAFE    : đủ minCapacity và tỷ lệ lấp đầy >= 70%
 * - WARNING : đã mở bán nhưng chưa đủ minCapacity hoặc dưới 70%
 * - DANGER  : còn dưới 7 ngày khởi hành mà vẫn chưa đạt minCapacity
 */
export type RiskLevel = 'SAFE' | 'WARNING' | 'DANGER';

/**
 * Trạng thái thanh toán của hành khách trong manifest.
 * Lấy đúng theo enum `ParticipantManifestResponse.paymentStatus` của BE —
 * KHÔNG có `DEPOSITED`, thay vào đó là hai trạng thái hoàn tiền.
 */
export type ManifestPaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED' | 'PARTIALLY_REFUNDED';

/**
 * Bộ lọc dùng chung cho 3 API overview / revenue-chart / top-tours.
 * `startDate`/`endDate` ở dạng `yyyy-MM-dd`.
 */
export interface ReportFilter {
  timeRange: TimeRange;
  startDate?: string;
  endDate?: string;
  groupBy: GroupBy;
}

/** 4 thẻ KPI tổng quan kèm % thay đổi so với kỳ liền trước cùng độ dài. */
export interface DashboardOverview {
  totalRevenue: number;
  revenueChangePercentage: number;
  totalTravelers: number;
  travelersChangePercentage: number;
  avgOccupancyRate: number;
  occupancyRateChangePercentage: number;
  cancellationRate: number;
  cancellationRateChangePercentage: number;
}

/** Một điểm trên biểu đồ doanh thu (`label` là 'dd/MM' hoặc 'MM/yyyy'). */
export interface RevenueChartPoint {
  label: string;
  revenue: number;
  bookingCount: number;
}

/** Một tour trong bảng xếp hạng bán chạy. BE không trả ảnh bìa ở endpoint này. */
export interface TopTourItem {
  tourId: string;
  tourName: string;
  totalTravelers: number;
  totalRevenue: number;
}

/**
 * Một lịch khởi hành sắp tới kèm tỷ lệ lấp đầy và mức rủi ro.
 * `daysUntilDeparture` do FE tự tính từ `departureDate` — BE không trả field này.
 */
export interface UpcomingSchedule {
  scheduleId: string;
  tourId?: string;
  tourName: string;
  departureDate: string;
  currentBookings: number;
  minCapacity: number;
  maxCapacity: number;
  occupancyRate: number;
  riskLevel: RiskLevel;
  daysUntilDeparture: number;
}

/** Cảnh báo chuyến sắp khởi hành nhưng chưa gom đủ `minCapacity`. */
export interface UnderCapacityAlert {
  scheduleId: string;
  tourName: string;
  departureDate: string;
  currentBookings: number;
  minCapacity: number;
  missingSlots: number;
  daysUntilDeparture: number;
  alertMessage: string;
}

/** Một hành khách trong danh sách đi tour. */
export interface ManifestPassenger {
  /** Id hành khách nếu BE có trả — dùng làm key khi render bảng. */
  id?: string;
  bookingCode?: string;
  fullName: string;
  phoneNumber?: string;
  email?: string;
  gender?: string;
  dateOfBirth?: string;
  specialRequirements?: string;
  paymentStatus: ManifestPaymentStatus;
}

/** Danh sách hành khách của một lịch khởi hành. */
export interface ScheduleManifest {
  scheduleId: string;
  tourName: string;
  departureDate: string;
  totalPassengers: number;
  passengers: ManifestPassenger[];
}
