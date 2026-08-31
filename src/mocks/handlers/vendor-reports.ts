import { http } from 'msw';
import { ok } from '../envelope';

/**
 * Mock cho `vendorReportService` (`src/features/vendor-reports/services/vendorReportService.ts`).
 * Base path: `/vendor/dashboard`.
 *
 *   GET /vendor/dashboard/overview                          — 4 thẻ KPI tổng quan.
 *   GET /vendor/dashboard/revenue-chart                      — chuỗi điểm doanh thu theo ngày/tháng.
 *   GET /vendor/dashboard/top-tours                          — xếp hạng tour bán chạy.
 *   GET /vendor/dashboard/upcoming-schedules                 — lịch khởi hành sắp tới.
 *   GET /vendor/dashboard/under-capacity-alerts               — cảnh báo chưa đủ khách tối thiểu.
 *   GET /vendor/dashboard/schedules/{scheduleId}/manifest    — danh sách hành khách một lịch.
 */

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

const overview = {
  totalRevenue: 486_500_000,
  revenueChangePercentage: 12.4,
  totalTravelers: 342,
  travelersChangePercentage: 8.1,
  avgOccupancyRate: 78.5,
  occupancyRateChangePercentage: 3.2,
  cancellationRate: 4.6,
  cancellationRateChangePercentage: -1.1,
};

const revenueChartDay = [
  { label: '24/08', revenue: 12_500_000, totalBookings: 6 },
  { label: '25/08', revenue: 18_200_000, totalBookings: 9 },
  { label: '26/08', revenue: 9_800_000, totalBookings: 4 },
  { label: '27/08', revenue: 24_600_000, totalBookings: 12 },
  { label: '28/08', revenue: 15_300_000, totalBookings: 7 },
  { label: '29/08', revenue: 21_900_000, totalBookings: 10 },
];

const revenueChartMonth = [
  { label: '03/2026', revenue: 98_000_000, totalBookings: 45 },
  { label: '04/2026', revenue: 112_500_000, totalBookings: 52 },
  { label: '05/2026', revenue: 87_300_000, totalBookings: 39 },
  { label: '06/2026', revenue: 134_200_000, totalBookings: 61 },
  { label: '07/2026', revenue: 121_800_000, totalBookings: 55 },
  { label: '08/2026', revenue: 145_600_000, totalBookings: 68 },
];

const topTours = [
  {
    tourId: 'tour-1',
    tourName: 'Chinh phục đỉnh Fansipan 3 ngày 2 đêm',
    totalTravelers: 128,
    totalRevenue: 192_000_000,
  },
  {
    tourId: 'tour-2',
    tourName: 'Trekking Tà Xùa - Săn mây',
    totalTravelers: 96,
    totalRevenue: 115_200_000,
  },
  {
    tourId: 'tour-3',
    tourName: 'Khám phá Bidoup - Núi Bà Đà Lạt',
    totalTravelers: 74,
    totalRevenue: 88_800_000,
  },
  {
    tourId: 'tour-4',
    tourName: 'Trekking Tà Năng - Phan Dũng',
    totalTravelers: 58,
    totalRevenue: 69_600_000,
  },
  {
    tourId: 'tour-5',
    tourName: 'Chinh phục Bạch Mộc Lương Tử',
    totalTravelers: 41,
    totalRevenue: 61_500_000,
  },
];

const upcomingSchedules = [
  {
    scheduleId: 'sched-1',
    tourId: 'tour-1',
    tourName: 'Chinh phục đỉnh Fansipan 3 ngày 2 đêm',
    departureDate: addDays(3),
    bookedSlots: 18,
    minCapacity: 10,
    maxCapacity: 20,
    occupancyRate: 90,
    riskStatus: 'SAFE',
  },
  {
    scheduleId: 'sched-2',
    tourId: 'tour-2',
    tourName: 'Trekking Tà Xùa - Săn mây',
    departureDate: addDays(5),
    bookedSlots: 6,
    minCapacity: 8,
    maxCapacity: 15,
    occupancyRate: 40,
    riskStatus: 'DANGER',
  },
  {
    scheduleId: 'sched-3',
    tourId: 'tour-4',
    tourName: 'Trekking Tà Năng - Phan Dũng',
    departureDate: addDays(9),
    bookedSlots: 9,
    minCapacity: 10,
    maxCapacity: 18,
    occupancyRate: 50,
    riskStatus: 'WARNING',
  },
  {
    scheduleId: 'sched-4',
    tourId: 'tour-3',
    tourName: 'Khám phá Bidoup - Núi Bà Đà Lạt',
    departureDate: addDays(14),
    bookedSlots: 12,
    minCapacity: 8,
    maxCapacity: 16,
    occupancyRate: 75,
    riskStatus: 'SAFE',
  },
];

const underCapacityAlerts = [
  {
    scheduleId: 'sched-2',
    tourName: 'Trekking Tà Xùa - Săn mây',
    departureDate: addDays(5),
    daysLeft: 5,
    bookedSlots: 6,
    minCapacity: 8,
    missingSlots: 2,
    alertMessage: 'Còn 5 ngày khởi hành nhưng thiếu 2 khách để đạt số lượng tối thiểu.',
  },
  {
    scheduleId: 'sched-3',
    tourName: 'Trekking Tà Năng - Phan Dũng',
    departureDate: addDays(9),
    daysLeft: 9,
    bookedSlots: 9,
    minCapacity: 10,
    missingSlots: 1,
    alertMessage: 'Còn 9 ngày khởi hành nhưng thiếu 1 khách để đạt số lượng tối thiểu.',
  },
];

const manifestsByScheduleId: Record<
  string,
  {
    scheduleId: string;
    tourName: string;
    departureDate: string;
    returnDate: string;
    bookedSlots: number;
    maxCapacity: number;
    minCapacity: number;
    participants: Array<{
      bookingId: string;
      bookingCode: string;
      bookerName: string;
      bookerPhone: string;
      bookerEmail: string;
      participantId: string;
      fullName: string;
      gender: string;
      dateOfBirth: string;
      phoneNumber?: string;
      specialNote?: string;
      paymentStatus: string;
      bookingStatus: string;
    }>;
  }
> = {
  'sched-1': {
    scheduleId: 'sched-1',
    tourName: 'Chinh phục đỉnh Fansipan 3 ngày 2 đêm',
    departureDate: addDays(3),
    returnDate: addDays(5),
    bookedSlots: 18,
    maxCapacity: 20,
    minCapacity: 10,
    participants: [
      {
        bookingId: 'booking-1',
        bookingCode: 'TS-BK00123',
        bookerName: 'Nguyễn Văn An',
        bookerPhone: '0901112223',
        bookerEmail: 'an.nguyen@gmail.com',
        participantId: 'part-1',
        fullName: 'Nguyễn Văn An',
        gender: 'MALE',
        dateOfBirth: '1994-02-10',
        phoneNumber: '0901112223',
        specialNote: 'Ăn chay',
        paymentStatus: 'PAID',
        bookingStatus: 'CONFIRMED',
      },
      {
        bookingId: 'booking-1',
        bookingCode: 'TS-BK00123',
        bookerName: 'Nguyễn Văn An',
        bookerPhone: '0901112223',
        bookerEmail: 'an.nguyen@gmail.com',
        participantId: 'part-2',
        fullName: 'Trần Thị Bích',
        gender: 'FEMALE',
        dateOfBirth: '1996-07-19',
        paymentStatus: 'PAID',
        bookingStatus: 'CONFIRMED',
      },
      {
        bookingId: 'booking-2',
        bookingCode: 'TS-BK00124',
        bookerName: 'Lê Hoàng Nam',
        bookerPhone: '0903334445',
        bookerEmail: 'nam.le@gmail.com',
        participantId: 'part-3',
        fullName: 'Lê Hoàng Nam',
        gender: 'MALE',
        dateOfBirth: '1990-11-03',
        phoneNumber: '0903334445',
        paymentStatus: 'PENDING',
        bookingStatus: 'PENDING',
      },
    ],
  },
};

export const vendorReportHandlers = [
  http.get('*/vendor/dashboard/overview', async () => ok(overview)),

  http.get('*/vendor/dashboard/revenue-chart', async ({ request }) => {
    const url = new URL(request.url);
    const groupBy = url.searchParams.get('groupBy');
    return ok(groupBy === 'MONTH' ? revenueChartMonth : revenueChartDay);
  }),

  http.get('*/vendor/dashboard/top-tours', async ({ request }) => {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get('limit') ?? '5');
    return ok(topTours.slice(0, limit));
  }),

  http.get('*/vendor/dashboard/upcoming-schedules', async ({ request }) => {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get('limit') ?? '10');
    return ok(upcomingSchedules.slice(0, limit));
  }),

  http.get('*/vendor/dashboard/under-capacity-alerts', async () => ok(underCapacityAlerts)),

  http.get('*/vendor/dashboard/schedules/:scheduleId/manifest', async ({ params }) => {
    const scheduleId = params.scheduleId as string;
    const manifest = manifestsByScheduleId[scheduleId] ?? {
      scheduleId,
      tourName: 'Không rõ tên tour',
      departureDate: addDays(7),
      returnDate: addDays(9),
      bookedSlots: 0,
      maxCapacity: 0,
      minCapacity: 0,
      participants: [],
    };
    return ok(manifest);
  }),
];
