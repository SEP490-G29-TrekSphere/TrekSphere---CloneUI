import { useState } from 'react';
import { ReportTable } from '../components/reports/ReportTable';
import { useAdminReports } from '../hooks/useAdminReports';
import type { ReportStatus } from '../services/adminReportService';

export default function Reports() {
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'resolved' | 'dismissed'>('all');
  const [page, setPage] = useState(0);

  const statusFilter: ReportStatus | undefined =
    activeTab === 'pending'
      ? 'PENDING'
      : activeTab === 'resolved'
        ? 'RESOLVED'
        : activeTab === 'dismissed'
          ? 'DISMISSED'
          : undefined;

  const { data, isLoading, isError, error, isFetching } = useAdminReports({
    status: statusFilter,
    page: page,
    size: 10,
  });

  const reports = data?.content || [];
  const totalElements = data?.totalElements || 0;
  const totalPages = data?.totalPages || 1;

  if (isError) {
    console.error('Lỗi khi lấy danh sách báo cáo:', error);
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 px-4 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0B3025]">
              Danh sách Báo cáo Vi phạm
            </h1>
          </div>
        </div>

        {/* Filter Tabs (All / Pending / Resolved) */}
      </div>

      {/* Main Table Container */}
      {isLoading ? (
        <div className="py-20 flex justify-center items-center">
          <div className="w-8 h-8 border-4 border-[#0B3025] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : isError ? (
        <div className="py-20 text-center text-red-500 font-medium">
          Không thể tải danh sách báo cáo. Vui lòng thử lại sau.
        </div>
      ) : (
        <ReportTable
          reports={reports}
          totalElements={totalElements}
          page={page}
          totalPages={totalPages}
          setPage={setPage}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isFetching={isFetching}
        />
      )}
    </div>
  );
}
