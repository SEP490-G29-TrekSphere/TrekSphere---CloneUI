import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  Filter,
  MessageSquare,
  Search,
  ShieldAlert,
  Star,
  Zap,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PATHS } from '@/constants';

export interface ViolationReport {
  id: string;
  code: string;
  type: 'blog' | 'comment' | 'review';
  targetTitle: string;
  reporterName: string;
  reporterAvatar?: string;
  reason: string;
  reasonTag: string;
  submittedAt: string;
  status: 'pending' | 'resolved';
}

const mockReports: ViolationReport[] = [];

export default function Reports() {
  const [localSearch, setLocalSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'resolved'>('all');
  const [reports] = useState<ViolationReport[]>(mockReports);

  const filteredReports = useMemo(() => {
    return reports.filter((item) => {
      // Filter by tab
      if (activeTab === 'pending' && item.status !== 'pending') return false;
      if (activeTab === 'resolved' && item.status !== 'resolved') return false;

      // Filter by search
      if (localSearch.trim()) {
        const query = localSearch.toLowerCase();
        const matchTitle = item.targetTitle.toLowerCase().includes(query);
        const matchReporter = item.reporterName.toLowerCase().includes(query);
        const matchCode = item.code.toLowerCase().includes(query);
        const matchReason = item.reasonTag.toLowerCase().includes(query);
        return matchTitle || matchReporter || matchCode || matchReason;
      }

      return true;
    });
  }, [reports, activeTab, localSearch]);

  const pendingCount = useMemo(
    () => reports.filter((r) => r.status === 'pending').length,
    [reports]
  );

  const getItemIcon = (type: ViolationReport['type']) => {
    switch (type) {
      case 'blog':
        return <FileText className="h-4 w-4 text-zinc-700" />;
      case 'comment':
        return <MessageSquare className="h-4 w-4 text-zinc-700" />;
      case 'review':
        return <Star className="h-4 w-4 text-zinc-700" />;
    }
  };

  const getItemTypeName = (type: ViolationReport['type']) => {
    switch (type) {
      case 'blog':
        return 'Blog';
      case 'comment':
        return 'Comment';
      case 'review':
        return 'Review';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0B3025]">
              Danh sách Báo cáo Vi phạm
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              TrekGuard Admin
            </span>
          </div>
          <p className="text-sm text-zinc-500 font-medium mt-1">
            Quản lý các nội dung cộng đồng bị gắn cờ để duy trì sự an toàn và minh bạch cho nền tảng
            TrekGuard.
          </p>
        </div>

        {/* Filter Tabs (All / Pending / Resolved) */}
        <div className="flex items-center bg-[#E5E4DE]/60 p-1.5 rounded-full self-start md:self-auto border border-[#D5D4CE]">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-5 py-1.5 text-xs font-bold rounded-full transition-all ${
              activeTab === 'all'
                ? 'bg-[#0B3025] text-white shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Tất cả
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`px-5 py-1.5 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 ${
              activeTab === 'pending'
                ? 'bg-[#0B3025] text-white shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Chờ xử lý
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] bg-red-500 text-white rounded-full font-extrabold">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('resolved')}
            className={`px-5 py-1.5 text-xs font-bold rounded-full transition-all ${
              activeTab === 'resolved'
                ? 'bg-[#0B3025] text-white shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Đã xử lý
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Reports Today */}
        <div className="bg-[#0B3025] text-white rounded-2xl p-6 shadow-md relative overflow-hidden flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold tracking-wider uppercase text-emerald-300/80">
              TỔNG SỐ BÁO CÁO HÔM NAY
            </span>
            <div className="text-4xl sm:text-5xl font-black tracking-tight mt-2 text-white">
              128
            </div>
          </div>
          <div className="text-xs font-medium text-emerald-200/90 mt-4 flex items-center gap-1">
            <span className="font-bold text-emerald-400">+12%</span> so với hôm qua
          </div>
        </div>

        {/* Pending Card */}
        <div className="bg-[#FAF9F5] border border-[#E5E4DE] rounded-2xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold tracking-wider uppercase text-zinc-500">
              ĐANG CHỜ XỬ LÝ
            </span>
            <div className="text-3xl font-extrabold sm:text-4xl text-zinc-900 mt-2">
              {pendingCount}
            </div>
          </div>
          <div className="flex size-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertCircle className="size-6 stroke-[2.5]" />
          </div>
        </div>

        {/* Performance Efficiency Card */}
        <div className="bg-[#FAF9F5] border border-[#E5E4DE] rounded-2xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold tracking-wider uppercase text-zinc-500">
              HIỆU SUẤT XỬ LÝ
            </span>
            <div className="text-3xl font-extrabold sm:text-4xl text-zinc-900 mt-2">94%</div>
          </div>
          <div className="flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <Zap className="size-6 stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-[#FAF9F5] border border-[#E5E4DE] rounded-2xl shadow-sm overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-5 border-b border-[#E5E4DE] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold tracking-wide uppercase text-zinc-700">
              HÀNG ĐỢI KIỂM DUYỆT
            </h2>
            <span className="px-2 py-0.5 text-xs font-semibold bg-zinc-200 text-zinc-700 rounded-full">
              {filteredReports.length}
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search Input inside table tool */}
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Tìm kiếm nội dung..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs rounded-full bg-[#EAE8E2] border-none focus:outline-none focus:ring-1 focus:ring-[#0B3025] text-zinc-800 placeholder-zinc-400 font-medium"
              />
            </div>
            <button
              type="button"
              className="flex items-center justify-center p-2 rounded-full bg-[#EAE8E2] hover:bg-[#E0DDD5] text-zinc-600 transition-colors"
              title="Bộ lọc nâng cao"
            >
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E5E4DE] text-zinc-400 font-bold uppercase tracking-wider text-[11px] bg-[#FAF9F5]">
                <th className="py-3.5 px-6 font-semibold">NỘI DUNG BỊ BÁO CÁO</th>
                <th className="py-3.5 px-6 font-semibold">NGƯỜI BÁO CÁO</th>
                <th className="py-3.5 px-6 font-semibold">LÝ DO</th>
                <th className="py-3.5 px-6 font-semibold">NGÀY GỬI</th>
                <th className="py-3.5 px-6 font-semibold">TRẠNG THÁI</th>
                <th className="py-3.5 px-6 font-semibold text-right">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E4DE] bg-white">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500 font-medium">
                    Không tìm thấy báo cáo vi phạm nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredReports.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FAF9F5]/70 transition-colors">
                    {/* Item title & code */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#FAF9F5] border border-[#E5E4DE]">
                          {getItemIcon(item.type)}
                        </div>
                        <div>
                          <div className="font-bold text-zinc-900 text-sm flex items-center gap-2">
                            <span>{getItemTypeName(item.type)}</span>
                            <span className="text-zinc-500 font-semibold">{item.code}</span>
                          </div>
                          <p className="text-zinc-500 font-medium text-xs truncate max-w-xs mt-0.5">
                            {item.targetTitle}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Reporter */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2.5">
                        {item.reporterAvatar ? (
                          <img
                            src={item.reporterAvatar}
                            alt={item.reporterName}
                            className="size-7 rounded-full object-cover border border-[#E5E4DE]"
                          />
                        ) : (
                          <div className="flex size-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                            {item.reporterName.charAt(0)}
                          </div>
                        )}
                        <span className="font-semibold text-zinc-800">{item.reporterName}</span>
                      </div>
                    </td>

                    {/* Reason badge */}
                    <td className="py-4 px-6">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#EAE8E2] text-zinc-700 border border-[#D8D5CC]">
                        {item.reasonTag}
                      </span>
                    </td>

                    {/* Timestamp */}
                    <td className="py-4 px-6 font-medium text-zinc-600 whitespace-nowrap">
                      {item.submittedAt}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      {item.status === 'pending' ? (
                        <div className="flex items-center gap-1.5 text-red-600 font-bold text-xs uppercase">
                          <span className="size-2 rounded-full bg-red-600 animate-pulse" />
                          CHỜ XỬ LÝ
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs uppercase">
                          <span className="size-2 rounded-full bg-emerald-600" />
                          ĐÃ XỬ LÝ
                        </div>
                      )}
                    </td>

                    {/* Action button */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      {item.status === 'pending' ? (
                        <Link
                          to={PATHS.ADMIN_REPORT_DETAIL.replace(':id', item.id)}
                          className="inline-block px-5 py-2 text-xs font-bold rounded-full bg-[#0B3025] text-white hover:bg-[#08241C] shadow-sm transition-all"
                        >
                          Xử lý
                        </Link>
                      ) : (
                        <Link
                          to={PATHS.ADMIN_REPORT_DETAIL.replace(':id', item.id)}
                          className="inline-block px-5 py-2 text-xs font-bold rounded-full bg-white border border-[#D5D4CE] text-zinc-700 hover:bg-[#FAF9F5] transition-all"
                        >
                          Chi tiết
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Pagination */}
        <div className="p-4 border-t border-[#E5E4DE] flex flex-col gap-2 text-xs text-zinc-500 font-medium bg-[#FAF9F5] sm:flex-row sm:items-center sm:justify-between">
          <span>
            Hiển thị 1 - {filteredReports.length} trên tổng số {filteredReports.length} báo cáo
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled
              className="flex size-7 items-center justify-center rounded-full border border-[#E5E4DE] opacity-40 cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="flex size-7 items-center justify-center rounded-full bg-[#0B3025] text-white font-bold"
            >
              1
            </button>
            <button
              type="button"
              className="flex size-7 items-center justify-center rounded-full border border-[#E5E4DE] text-zinc-700 hover:bg-[#EAE8E2]"
            >
              2
            </button>
            <button
              type="button"
              className="flex size-7 items-center justify-center rounded-full border border-[#E5E4DE] text-zinc-700 hover:bg-[#EAE8E2]"
            >
              3
            </button>
            <span className="px-1 text-zinc-400">...</span>
            <button
              type="button"
              className="flex size-7 items-center justify-center rounded-full border border-[#E5E4DE] text-zinc-700 hover:bg-[#EAE8E2]"
            >
              13
            </button>
            <button
              type="button"
              className="flex size-7 items-center justify-center rounded-full border border-[#E5E4DE] text-zinc-700 hover:bg-[#EAE8E2]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

        {/* Nhật ký hoạt động gần đây */}
        <div className="bg-[#FAF9F5] border border-[#E5E4DE] rounded-2xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-3">
            <h3 className="font-bold text-xs tracking-wider uppercase text-zinc-800">
              Nhật ký hoạt động gần đây
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-3">
                <span className="size-2 rounded-full bg-zinc-800" />
                <span className="text-zinc-700 font-medium">
                  Admin #02 đã khóa bài viết #TG-112
                </span>
                <span className="text-zinc-400 font-normal ml-auto">5 phút trước</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="size-2 rounded-full bg-zinc-800" />
                <span className="text-zinc-700 font-medium">
                  Hệ thống tự động ẩn comment có từ khóa cấm
                </span>
                <span className="text-zinc-400 font-normal ml-auto">12 phút trước</span>
              </div>
            </div>
          </div>
          <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[#EAE8E2] text-zinc-500">
            <ShieldAlert className="size-7" />
          </div>
        </div>
      </div>
    </div>
  );
}
