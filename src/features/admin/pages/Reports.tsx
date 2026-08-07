import { ShieldAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from '@/store/useToastStore';
import { ReportFilterTabs } from '../components/reports/ReportFilterTabs';
import { ReportStatCards } from '../components/reports/ReportStatCards';
import { ReportTable } from '../components/reports/ReportTable';
import {
  adminReportService,
  type ReportResponse,
  type ReportStatus,
} from '../services/adminReportService';

export default function Reports() {
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'resolved' | 'dismissed'>('all');
  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const fetchReports = async () => {
    try {
      const statusFilter: ReportStatus | undefined =
        activeTab === 'pending'
          ? 'PENDING'
          : activeTab === 'resolved'
            ? 'RESOLVED'
            : activeTab === 'dismissed'
              ? 'DISMISSED'
              : undefined;
      const res = await adminReportService.getReports({
        status: statusFilter,
        page: page,
        size: 10,
      });
      setReports(res.content);
      setTotalElements(res.totalElements);
      setTotalPages(res.totalPages);
      // biome-ignore lint/suspicious/noExplicitAny: API error
    } catch (error: any) {
      console.error('Lỗi khi lấy danh sách báo cáo:', error);
      toast.error(error.response?.data?.message || 'Không thể tải danh sách báo cáo');
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional
  useEffect(() => {
    fetchReports();
  }, [activeTab, page]);

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
        <ReportFilterTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Overview Stat Cards */}
      <ReportStatCards totalElements={totalElements} />

      {/* Main Table Container */}
      <ReportTable
        reports={reports}
        totalElements={totalElements}
        page={page}
        totalPages={totalPages}
        setPage={setPage}
      />

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
