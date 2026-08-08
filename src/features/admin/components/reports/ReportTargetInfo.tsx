import { AlertTriangle } from 'lucide-react';
import { AppIdDisplay } from '@/shared/ui';

export interface ReportTargetInfoProps {
  reason: string;
  reporterAvatar?: string | null;
  reporterFullName: string;
  reporterEmail: string;
  createdAt: string;
  targetType: string;
  targetId: string;
  targetTitle: string | null;
  targetContent: string | null;
}

export function ReportTargetInfo({
  reason,
  reporterAvatar,
  reporterFullName,
  reporterEmail,
  createdAt,
  targetType,
  targetId,
  targetTitle,
  targetContent,
}: ReportTargetInfoProps) {
  return (
    <div className="bg-[#FAF9F5] border border-[#E5E4DE] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      {/* Report Reason Highlight Box */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex gap-4 items-start shadow-sm">
        <div className="size-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
          <AlertTriangle className="size-6 text-red-600" />
        </div>
        <div>
          <h4 className="text-red-900 font-extrabold text-sm uppercase tracking-wider mb-1.5">
            Lý do báo cáo
          </h4>
          <p className="text-red-800 font-medium text-base leading-snug">{reason}</p>
        </div>
      </div>

      {/* Reporter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E4DE]">
        <div className="flex items-center gap-3.5">
          {reporterAvatar ? (
            <img
              src={reporterAvatar}
              alt={reporterFullName}
              className="size-11 rounded-full object-cover border border-[#E5E4DE]"
            />
          ) : (
            <div className="flex size-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-lg uppercase">
              {reporterFullName.charAt(0)}
            </div>
          )}
          <div>
            <h3 className="font-extrabold text-sm text-zinc-900">{reporterFullName}</h3>
            <p className="text-xs text-zinc-500 font-medium">{reporterEmail}</p>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider block">
            Thời gian báo cáo
          </span>
          <span className="text-xs font-bold text-zinc-800">
            {new Date(createdAt).toLocaleDateString('vi-VN')}
          </span>
        </div>
      </div>

      {/* Target Content Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-extrabold tracking-wider text-zinc-500 uppercase">
          NỘI DUNG BỊ BÁO CÁO ({targetType})
        </span>
        <AppIdDisplay id={targetId} label="ID" />
      </div>

      {/* Target Content Body Box */}
      <div className="bg-[#EAE8E2]/60 border border-[#DCD9CF] rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-bold text-zinc-900 leading-snug">
          {targetTitle || 'Bình luận / Đánh giá'}
        </h2>
        <div className="text-sm text-zinc-700 leading-relaxed font-medium whitespace-pre-line">
          {targetContent}
        </div>
      </div>
    </div>
  );
}
