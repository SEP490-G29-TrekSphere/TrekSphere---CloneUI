import { AlertTriangle, CheckCircle2, EyeOff, XCircle } from 'lucide-react';
import type { ReportAction } from '../../services/adminReportService';

export interface ReportDecisionPanelProps {
  isSubmitted: boolean;
  selectedDecision: ReportAction | null;
  note: string;
  isSubmitting: boolean;
  onDecisionChange: (decision: ReportAction | null) => void;
  onNoteChange: (note: string) => void;
  onSubmit: () => void;
  onEditDecision: () => void;
}

export function ReportDecisionPanel({
  isSubmitted,
  selectedDecision,
  note,
  isSubmitting,
  onDecisionChange,
  onNoteChange,
  onSubmit,
  onEditDecision,
}: ReportDecisionPanelProps) {
  return (
    <div className="bg-[#FAF9F5] border border-[#E5E4DE] rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
      <h3 className="font-extrabold text-xs tracking-wider uppercase text-zinc-800">
        QUYẾT ĐỊNH ĐIỀU HÀNH
      </h3>

      {isSubmitted ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center space-y-3">
          <div className="size-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="size-6 stroke-[2.5]" />
          </div>
          <div>
            <h4 className="font-bold text-emerald-900 text-sm">Báo cáo đã được xử lý!</h4>
            <p className="text-xs text-emerald-700 mt-1">
              Hệ thống đã ghi nhận quyết định của quản trị viên và áp dụng lên nội dung/tài khoản vi
              phạm.
            </p>
          </div>
          <button
            type="button"
            onClick={onEditDecision}
            className="text-xs font-bold text-emerald-800 hover:underline pt-2 inline-block"
          >
            Chỉnh sửa quyết định
          </button>
        </div>
      ) : (
        <>
          {/* Executive Options */}
          <div className="space-y-3">
            {/* Option 1: Hide Content */}
            <label
              className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer ${
                selectedDecision === 'HIDE_CONTENT'
                  ? 'bg-white border-[#0B3025] shadow-md ring-1 ring-[#0B3025]'
                  : 'bg-white/60 border-[#E5E4DE] hover:border-zinc-400'
              }`}
            >
              <input
                type="radio"
                name="decision"
                value="HIDE_CONTENT"
                checked={selectedDecision === 'HIDE_CONTENT'}
                onChange={() => onDecisionChange('HIDE_CONTENT')}
                className="mt-1 accent-[#0B3025]"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-zinc-900">Ẩn nội dung</span>
                  <EyeOff className="size-4 text-zinc-600" />
                </div>
                <p className="text-[11px] text-zinc-500 font-medium leading-normal mt-0.5">
                  Nội dung sẽ không còn hiển thị với công chúng.
                </p>
              </div>
            </label>

            {/* Option 2: Warn User */}
            <label
              className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer ${
                selectedDecision === 'WARNING'
                  ? 'bg-white border-[#0B3025] shadow-md ring-1 ring-[#0B3025]'
                  : 'bg-white/60 border-[#E5E4DE] hover:border-zinc-400'
              }`}
            >
              <input
                type="radio"
                name="decision"
                value="WARNING"
                checked={selectedDecision === 'WARNING'}
                onChange={() => onDecisionChange('WARNING')}
                className="mt-1 accent-[#0B3025]"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-zinc-900">Gửi cảnh báo người dùng</span>
                  <AlertTriangle className="size-4 text-amber-600" />
                </div>
                <p className="text-[11px] text-zinc-500 font-medium leading-normal mt-0.5">
                  Thông báo vi phạm sẽ được gửi tới email/inbox.
                </p>
              </div>
            </label>

            {/* Option 3: Dismiss Report */}
            <label
              className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer ${
                selectedDecision === 'DISMISS'
                  ? 'bg-white border-[#0B3025] shadow-md ring-1 ring-[#0B3025]'
                  : 'bg-white/60 border-[#E5E4DE] hover:border-zinc-400'
              }`}
            >
              <input
                type="radio"
                name="decision"
                value="DISMISS"
                checked={selectedDecision === 'DISMISS'}
                onChange={() => onDecisionChange('DISMISS')}
                className="mt-1 accent-[#0B3025]"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-zinc-900">Bác bỏ báo cáo</span>
                  <XCircle className="size-4 text-zinc-500" />
                </div>
                <p className="text-[11px] text-zinc-500 font-medium leading-normal mt-0.5">
                  Đánh dấu báo cáo là không hợp lệ.
                </p>
              </div>
            </label>
          </div>

          {/* Note Field */}
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-zinc-800">Ghi chú điều hành</span>
              <span className="text-[11px] text-zinc-400">Bắt buộc nếu xử lý kỷ luật</span>
            </div>
            <textarea
              rows={4}
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              placeholder="Nhập lý do chi tiết cho quyết định này..."
              className="w-full p-4 rounded-2xl bg-[#EAE8E2]/60 border border-[#DCD9CF] focus:outline-none focus:ring-1 focus:ring-[#0B3025] text-xs text-zinc-800 placeholder-zinc-400 resize-none font-medium"
            />
          </div>

          {/* Action Submit Button */}
          <div className="pt-2">
            <button
              type="button"
              disabled={!selectedDecision || isSubmitting}
              onClick={onSubmit}
              className={`w-full py-3.5 px-4 rounded-full font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
                selectedDecision && !isSubmitting
                  ? 'bg-[#0B3025] text-white hover:bg-[#08241C]'
                  : 'bg-zinc-300 text-zinc-500 cursor-not-allowed shadow-none'
              }`}
            >
              {isSubmitting ? 'Đang xử lý...' : 'Xác nhận xử lý'}
              {!isSubmitting && <CheckCircle2 className="size-4" />}
            </button>
            <p className="text-[10px] text-center text-zinc-400 font-medium mt-2">
              Hành động này không thể hoàn tác sau khi đã thực hiện.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
