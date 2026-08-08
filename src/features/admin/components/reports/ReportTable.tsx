import { ChevronLeft, ChevronRight, FileText, MessageSquare, Star } from 'lucide-react';
import type React from 'react';
import { Link } from 'react-router-dom';
import { PATHS } from '@/constants';
import type { ReportResponse, ReportTargetType } from '../../services/adminReportService';
import { ReportFilterTabs } from './ReportFilterTabs';

export interface ReportTableProps {
  reports: ReportResponse[];
  totalElements: number;
  page: number;
  totalPages: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  activeTab: 'all' | 'pending' | 'resolved' | 'dismissed';
  setActiveTab: (tab: 'all' | 'pending' | 'resolved' | 'dismissed') => void;
  isFetching?: boolean;
}

export function ReportTable({
  reports,
  totalElements,
  page,
  totalPages,
  setPage,
  activeTab,
  setActiveTab,
  isFetching = false,
}: ReportTableProps) {
  const getItemIcon = (type: ReportTargetType) => {
    switch (type) {
      case 'BLOG':
        return <FileText className="h-4 w-4 text-zinc-700" />;
      case 'COMMENT':
        return <MessageSquare className="h-4 w-4 text-zinc-700" />;
      case 'REVIEW':
        return <Star className="h-4 w-4 text-zinc-700" />;
      default:
        return <FileText className="h-4 w-4 text-zinc-700" />;
    }
  };

  const getItemTypeName = (type: ReportTargetType) => {
    switch (type) {
      case 'BLOG':
        return 'Blog';
      case 'COMMENT':
        return 'Bình luận';
      case 'REVIEW':
        return 'Đánh giá';
      default:
        return 'Khác';
    }
  };

  return (
    <div className="bg-[#FAF9F5] border border-[#E5E4DE] rounded-2xl shadow-sm overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-5 border-b border-[#E5E4DE] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold tracking-wide uppercase text-zinc-700">
            DANH SÁCH BÁO CÁO
          </h2>
          <span className="px-2 py-0.5 text-xs font-semibold bg-zinc-200 text-zinc-700 rounded-full">
            {totalElements}
          </span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <ReportFilterTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto relative min-h-[200px]">
        {/* Loading Overlay */}
        {isFetching && (
          <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#0B3025] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#E5E4DE] text-zinc-400 font-bold uppercase tracking-wider text-[11px] bg-[#FAF9F5]">
              <th className="py-3.5 px-6 font-semibold whitespace-nowrap">NỘI DUNG BỊ BÁO CÁO</th>
              <th className="py-3.5 px-6 font-semibold whitespace-nowrap">NGƯỜI BÁO CÁO</th>
              <th className="py-3.5 px-6 font-semibold whitespace-nowrap">LÝ DO</th>
              <th className="py-3.5 px-6 font-semibold whitespace-nowrap">NGÀY GỬI</th>
              <th className="py-3.5 px-6 font-semibold whitespace-nowrap">TRẠNG THÁI</th>
              <th className="py-3.5 px-6 font-semibold text-right whitespace-nowrap">THAO TÁC</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E4DE] bg-white">
            {reports.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-zinc-500 font-medium">
                  Không tìm thấy báo cáo vi phạm nào phù hợp.
                </td>
              </tr>
            ) : (
              reports.map((item) => (
                <tr key={item.id} className="hover:bg-[#FAF9F5]/70 transition-colors">
                  {/* Item title & code */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#FAF9F5] border border-[#E5E4DE]">
                        {getItemIcon(item.targetType)}
                      </div>
                      <div>
                        <div className="font-bold text-zinc-900 text-sm flex items-center gap-2">
                          <span>{getItemTypeName(item.targetType)}</span>
                          <span className="text-zinc-500 font-semibold text-xs">
                            ID: {item.targetId.substring(0, 8)}...
                          </span>
                        </div>
                        <p className="text-zinc-500 font-medium text-xs truncate max-w-xs mt-0.5">
                          {item.targetTitle || 'Nội dung...'}
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
                          alt={item.reporterFullName}
                          className="size-7 rounded-full object-cover border border-[#E5E4DE]"
                        />
                      ) : (
                        <div className="flex size-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs uppercase">
                          {item.reporterFullName.charAt(0)}
                        </div>
                      )}
                      <span className="font-semibold text-zinc-800">{item.reporterFullName}</span>
                    </div>
                  </td>

                  {/* Reason badge */}
                  <td className="py-4 px-6">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#EAE8E2] text-zinc-700 border border-[#D8D5CC]">
                      {item.reason}
                    </span>
                  </td>

                  {/* Timestamp */}
                  <td className="py-4 px-6 font-medium text-zinc-600 whitespace-nowrap">
                    {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                  </td>

                  {/* Status */}
                  <td className="py-4 px-6 whitespace-nowrap">
                    {item.status === 'PENDING' ? (
                      <div className="flex items-center gap-1.5 text-red-600 font-bold text-xs uppercase">
                        <span className="size-2 rounded-full bg-red-600 animate-pulse" />
                        CHỜ XỬ LÝ
                      </div>
                    ) : item.status === 'RESOLVED' ? (
                      <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs uppercase">
                        <span className="size-2 rounded-full bg-emerald-600" />
                        ĐÃ XỬ LÝ
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-zinc-500 font-bold text-xs uppercase">
                        <span className="size-2 rounded-full bg-zinc-500" />
                        BỎ QUA
                      </div>
                    )}
                  </td>

                  {/* Action button */}
                  <td className="py-4 px-6 text-right whitespace-nowrap">
                    {item.status === 'PENDING' ? (
                      <Link
                        to={PATHS.ADMIN_REPORT_DETAIL.replace(':id', item.id)}
                        className="inline-block w-24 text-center px-0 py-2 text-xs font-bold rounded-full bg-[#0B3025] text-white hover:bg-[#08241C] shadow-sm transition-all"
                      >
                        Xử lý
                      </Link>
                    ) : (
                      <Link
                        to={PATHS.ADMIN_REPORT_DETAIL.replace(':id', item.id)}
                        className="inline-block w-24 text-center px-0 py-2 text-xs font-bold rounded-full bg-white border border-[#D5D4CE] text-zinc-700 hover:bg-[#FAF9F5] transition-all"
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
      <div className="p-4 border-t border-[#E5E4DE] flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0 text-xs text-zinc-500 font-medium bg-[#FAF9F5]">
        <span className="text-center sm:text-left">
          Hiển thị trang {page + 1} / {totalPages || 1} (Tổng cộng {totalElements} báo cáo)
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => setPage((prev) => Math.max(0, prev - 1))}
            className={`flex size-7 items-center justify-center rounded-full border border-[#E5E4DE] ${
              page === 0 ? 'opacity-40 cursor-not-allowed' : 'text-zinc-700 hover:bg-[#EAE8E2]'
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="flex size-7 items-center justify-center rounded-full bg-[#0B3025] text-white font-bold"
          >
            {page + 1}
          </button>
          <button
            type="button"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
            className={`flex size-7 items-center justify-center rounded-full border border-[#E5E4DE] ${
              page >= totalPages - 1
                ? 'opacity-40 cursor-not-allowed'
                : 'text-zinc-700 hover:bg-[#EAE8E2]'
            }`}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
