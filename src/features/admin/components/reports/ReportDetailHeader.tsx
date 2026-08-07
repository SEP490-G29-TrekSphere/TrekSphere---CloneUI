import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PATHS } from '@/constants';
import { AppIdDisplay } from '@/shared/ui';
import type { ReportStatus } from '../../services/adminReportService';

export interface ReportDetailHeaderProps {
  id: string;
  status: ReportStatus;
}

export function ReportDetailHeader({ id, status }: ReportDetailHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Breadcrumb & Back */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-zinc-500 font-medium">
          <Link to={PATHS.ADMIN_REPORTS} className="hover:text-zinc-900 transition-colors">
            Báo cáo
          </Link>
          <span>/</span>
          <span className="text-zinc-900">Xử lý Báo cáo</span>
        </div>

        <Link
          to={PATHS.ADMIN_REPORTS}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-900 transition-colors bg-[#FAF9F5] border border-[#E5E4DE] px-3.5 py-1.5 rounded-full"
        >
          <ArrowLeft className="size-3.5" />
          Quay lại danh sách
        </Link>
      </div>

      {/* Top Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0B3025]">Xử lý Báo cáo</h1>
          <AppIdDisplay id={id} />
        </div>

        {/* Badges */}
        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#FAF9F5] border border-[#E5E4DE] flex items-center gap-2">
            Trạng thái:
            {status === 'PENDING' ? (
              <div className="flex items-center gap-1.5 text-red-600 uppercase">
                <span className="size-2 rounded-full bg-red-600 animate-pulse" />
                CHỜ XỬ LÝ
              </div>
            ) : status === 'RESOLVED' ? (
              <div className="flex items-center gap-1.5 text-emerald-600 uppercase">
                <span className="size-2 rounded-full bg-emerald-600" />
                ĐÃ XỬ LÝ
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-zinc-500 uppercase">
                <span className="size-2 rounded-full bg-zinc-500" />
                BỎ QUA
              </div>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
