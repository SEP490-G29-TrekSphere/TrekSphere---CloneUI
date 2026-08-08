import { ShieldAlert } from 'lucide-react';
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
            <h1 className="text-3xl font-extrabold tracking-tight text-[#0B3025]">
              Danh sách Báo cáo Vi phạm
            </h1>
          </div>
          <p className="text-sm text-zinc-500 font-medium mt-1">
            Quản lý các nội dung cộng đồng bị gắn cờ để duy trì sự an toàn và minh bạch cho nền tảng
            TrekGuard.
          </p>
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

      {/* Bottom Information Grid */}
      <div className="w-full">
        {/* Mẹo điều phối */}
        <div className="bg-[#E2ECE9] border border-[#C5DACF] rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-sm text-[#0B3025] mb-2 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-[#0B3025]" />
            Mẹo điều phối
          </h3>
          <p className="text-xs text-zinc-700 leading-relaxed font-medium">
            Ưu tiên xử lý các báo cáo có nhãn &ldquo;Ngôn ngữ thù ghét&rdquo; để đảm bảo tiêu chuẩn
            cộng đồng được thực thi nghiêm ngặt nhất.
          </p>
        </div>
      </div>
    </div>
  );
}
