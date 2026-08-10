import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { vendorReportService } from '../services/vendorReportService';
import type { ReportFilter } from '../types';

/**
 * Mỗi khối trên màn Báo cáo dùng một query riêng thay vì gộp `Promise.all`:
 * một endpoint lỗi thì chỉ khối đó báo lỗi, các khối còn lại vẫn dùng được.
 */

const STALE_TIME = 60_000;

export function useVendorOverview(filter: ReportFilter) {
  return useQuery({
    queryKey: ['vendor-report', 'overview', filter.timeRange, filter.startDate, filter.endDate],
    queryFn: () => vendorReportService.getOverview(filter),
    placeholderData: keepPreviousData,
    staleTime: STALE_TIME,
  });
}

export function useRevenueChart(filter: ReportFilter) {
  return useQuery({
    queryKey: [
      'vendor-report',
      'revenue-chart',
      filter.timeRange,
      filter.startDate,
      filter.endDate,
      filter.groupBy,
    ],
    queryFn: () => vendorReportService.getRevenueChart(filter),
    placeholderData: keepPreviousData,
    staleTime: STALE_TIME,
  });
}

export function useTopTours(filter: ReportFilter, limit = 5) {
  return useQuery({
    queryKey: [
      'vendor-report',
      'top-tours',
      filter.timeRange,
      filter.startDate,
      filter.endDate,
      limit,
    ],
    queryFn: () => vendorReportService.getTopTours(filter, limit),
    placeholderData: keepPreviousData,
    staleTime: STALE_TIME,
  });
}

/**
 * Không phụ thuộc bộ lọc thời gian — lịch khởi hành luôn nhìn về phía trước,
 * đổi khoảng thống kê không được làm mất danh sách này.
 */
export function useUpcomingSchedules(limit = 10, daysAhead?: number) {
  return useQuery({
    queryKey: ['vendor-report', 'upcoming-schedules', limit, daysAhead],
    queryFn: () => vendorReportService.getUpcomingSchedules(limit, daysAhead),
    staleTime: STALE_TIME,
  });
}

/** Cũng độc lập với bộ lọc, dùng ngưỡng ngày riêng. */
export function useUnderCapacityAlerts(alertDaysThreshold = 7) {
  return useQuery({
    queryKey: ['vendor-report', 'under-capacity-alerts', alertDaysThreshold],
    queryFn: () => vendorReportService.getUnderCapacityAlerts(alertDaysThreshold),
    staleTime: STALE_TIME,
  });
}

/** Chỉ chạy khi modal manifest được mở (`scheduleId` khác null). */
export function useScheduleManifest(scheduleId: string | null) {
  return useQuery({
    queryKey: ['vendor-report', 'manifest', scheduleId],
    queryFn: () => vendorReportService.getScheduleManifest(scheduleId as string),
    enabled: Boolean(scheduleId),
    staleTime: STALE_TIME,
  });
}
