import { useState } from 'react';
import { ManifestModal } from '../components/ManifestModal';
import { ReportFilterBar } from '../components/ReportFilterBar';
import { ReportKpiCards } from '../components/ReportKpiCards';
import { RevenueChart } from '../components/RevenueChart';
import { TopToursCard } from '../components/TopToursCard';
import { UnderCapacityBanner } from '../components/UnderCapacityBanner';
import { UpcomingSchedulesTable } from '../components/UpcomingSchedulesTable';
import {
  useRevenueChart,
  useTopTours,
  useUnderCapacityAlerts,
  useUpcomingSchedules,
  useVendorOverview,
} from '../hooks/useVendorReports';
import type { ReportFilter } from '../types';

/** Ngưỡng cảnh báo thiếu khách và số lịch khởi hành hiển thị — theo mặc định của BE. */
const ALERT_DAYS_THRESHOLD = 7;
const UPCOMING_LIMIT = 10;
const TOP_TOURS_LIMIT = 5;

export default function VendorReports() {
  const [filter, setFilter] = useState<ReportFilter>({
    timeRange: 'LAST_30_DAYS',
    groupBy: 'DAY',
  });
  const [manifestScheduleId, setManifestScheduleId] = useState<string | null>(null);

  const overviewQuery = useVendorOverview(filter);
  const revenueQuery = useRevenueChart(filter);
  const topToursQuery = useTopTours(filter, TOP_TOURS_LIMIT);
  const schedulesQuery = useUpcomingSchedules(UPCOMING_LIMIT);
  const alertsQuery = useUnderCapacityAlerts(ALERT_DAYS_THRESHOLD);

  const handleFilterChange = (patch: Partial<ReportFilter>) => {
    setFilter((prev) => ({ ...prev, ...patch }));
  };

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: '#06261D' }}>
            Báo cáo &amp; Thống kê
          </h1>
        </div>
        <ReportFilterBar filter={filter} onChange={handleFilterChange} />
      </header>

      <UnderCapacityBanner
        alerts={alertsQuery.data}
        daysThreshold={ALERT_DAYS_THRESHOLD}
        onViewManifest={setManifestScheduleId}
      />

      <ReportKpiCards
        overview={overviewQuery.data}
        isLoading={overviewQuery.isLoading}
        isError={overviewQuery.isError}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart
            data={revenueQuery.data}
            groupBy={filter.groupBy}
            onGroupByChange={(groupBy) => handleFilterChange({ groupBy })}
            isLoading={revenueQuery.isLoading}
            isError={revenueQuery.isError}
          />
        </div>
        <TopToursCard
          tours={topToursQuery.data}
          isLoading={topToursQuery.isLoading}
          isError={topToursQuery.isError}
        />
      </div>

      <UpcomingSchedulesTable
        schedules={schedulesQuery.data}
        isLoading={schedulesQuery.isLoading}
        isError={schedulesQuery.isError}
        onViewManifest={setManifestScheduleId}
      />

      <ManifestModal scheduleId={manifestScheduleId} onClose={() => setManifestScheduleId(null)} />
    </div>
  );
}
