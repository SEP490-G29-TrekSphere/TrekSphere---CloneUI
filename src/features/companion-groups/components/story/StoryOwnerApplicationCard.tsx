import { CheckCircle2, Clock, UserCheck, XCircle } from 'lucide-react';
import type { ApplicationState, GroupRecommendation } from '../../types/groupMatchingTypes';

interface StoryOwnerApplicationCardProps {
  group: GroupRecommendation;
  applicationState: ApplicationState;
  onApprove: () => void;
  onReject: () => void;
}

/**
 * Góc nhìn Chủ nhóm trong story flow: hiển thị ĐÚNG một đơn vừa được nộp qua
 * TripDeclarationWizardModal ở bước Group Detail — không phải roster chung như
 * ApplicationsPreview (Review Workbench), vì story flow chỉ kể một câu chuyện duy nhất.
 */
export function StoryOwnerApplicationCard({
  group,
  applicationState,
  onApprove,
  onReject,
}: StoryOwnerApplicationCardProps) {
  const isTerminal = applicationState === 'ACCEPTED' || applicationState === 'REJECTED';

  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="text-sm font-extrabold text-foreground">Đơn xin vào nhóm — {group.title}</h3>
        {applicationState === 'APPLIED' && (
          <span className="rounded-full bg-blue-500/10 border border-blue-500/30 px-3 py-1 text-xs font-extrabold text-blue-700 dark:text-blue-400 flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> Đơn mới
          </span>
        )}
        {applicationState === 'ACCEPTED' && (
          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-extrabold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> Đã duyệt
          </span>
        )}
        {applicationState === 'REJECTED' && (
          <span className="rounded-full bg-rose-500/10 border border-rose-500/30 px-3 py-1 text-xs font-extrabold text-rose-700 dark:text-rose-400 flex items-center gap-1">
            <XCircle className="h-3.5 w-3.5" /> Đã từ chối
          </span>
        )}
      </div>

      <div className="flex items-center gap-3.5">
        <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black">
          D
        </div>
        <div>
          <h4 className="text-sm font-extrabold text-foreground">
            Trekker demo (bạn ở góc nhìn Tôi)
          </h4>
          <p className="text-xs text-muted-foreground">Ứng tuyển qua wizard vừa hoàn tất</p>
        </div>
      </div>

      <div className="rounded-2xl bg-background border border-border p-3.5">
        <p className="text-xs text-muted-foreground leading-relaxed italic">
          Đơn được gửi từ màn "Xin vào nhóm" — nội dung khai báo thể lực/trang thiết bị chỉ mô phỏng
          trong wizard demo, không được lưu lại ở đây.
        </p>
      </div>

      {!isTerminal && (
        <div className="flex items-center gap-2 pt-1 border-t border-border">
          <button
            type="button"
            onClick={onReject}
            className="rounded-full border border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 px-4 py-2 text-xs font-bold hover:bg-rose-100 transition"
          >
            Từ chối
          </button>
          <button
            type="button"
            onClick={onApprove}
            className="rounded-full bg-emerald-600 text-white px-5 py-2 text-xs font-extrabold hover:bg-emerald-700 shadow-xs transition"
          >
            <UserCheck className="h-3.5 w-3.5 inline mr-1" /> Duyệt vào nhóm
          </button>
        </div>
      )}
    </div>
  );
}

export default StoryOwnerApplicationCard;
