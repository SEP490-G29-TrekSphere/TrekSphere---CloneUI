import { Flag } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCreateReport } from '@/features/reports';
import { toast } from '@/store/useToastStore';

export interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Mã hoặc ID của nội dung bị báo cáo, e.g. "#TREK-8829-BLOG" hoặc "CM-892" */
  targetId: string;
  /** Loại nội dung bị báo cáo, e.g. "BLOG" | "COMMENT" | "REVIEW" */
  targetType?: 'BLOG' | 'COMMENT' | 'REVIEW';
  /** Tên tiêu đề ngắn của nội dung (nếu có) */
  targetTitle?: string;
}

export type ViolationType = 'spam' | 'offensive' | 'misinformation' | 'copyright' | 'other';

const violationOptions: { id: ViolationType; label: string }[] = [
  { id: 'spam', label: 'Spam hoặc Nội dung rác' },
  { id: 'offensive', label: 'Ngôn từ không phù hợp / Xúc phạm' },
  { id: 'misinformation', label: 'Thông tin sai sự thật / Lừa đảo' },
  { id: 'copyright', label: 'Vi phạm bản quyền hình ảnh/nội dung' },
  { id: 'other', label: 'Khác' },
];

export function ReportModal({
  isOpen,
  onClose,
  targetId,
  targetType = 'BLOG',
  targetTitle,
}: ReportModalProps) {
  const [selectedType, setSelectedType] = useState<ViolationType | null>(null);
  const [details, setDetails] = useState('');

  const { mutate: createReport, isPending: isSubmitting } = useCreateReport();

  const formattedTargetCode = targetId.startsWith('#')
    ? targetId
    : `#${targetId.toUpperCase()}${targetType ? `-${targetType}` : ''}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType) {
      toast.error('Vui lòng chọn loại vi phạm');
      return;
    }

    const selectedOption = violationOptions.find((opt) => opt.id === selectedType);
    const reasonText = details.trim()
      ? `${selectedOption?.label}: ${details.trim()}`
      : selectedOption?.label || '';

    createReport(
      {
        targetType,
        targetId,
        reason: reasonText,
      },
      {
        onSuccess: () => {
          setSelectedType(null);
          setDetails('');
          onClose();
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden border-none bg-[#FAF9F5] shadow-2xl">
        {/* Header section with solid dark green pill header */}
        <DialogHeader className="bg-[#0B3025] px-6 py-4 flex flex-row items-center justify-between space-y-0">
          <DialogTitle className="text-lg font-extrabold text-white tracking-tight">
            Báo cáo vi phạm
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Target ID Badge Box */}
          <div className="bg-[#EAE8E2]/70 border border-[#DCD9CF] rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider block">
                MÃ NỘI DUNG
              </span>
              <span className="text-sm font-extrabold text-zinc-900 font-mono tracking-tight">
                {formattedTargetCode}
              </span>
              {targetTitle && (
                <p className="text-xs text-zinc-600 truncate max-w-[240px] mt-0.5 font-medium">
                  {targetTitle}
                </p>
              )}
            </div>
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-100/70 text-emerald-800">
              <Flag className="size-4 fill-emerald-800/20" />
            </div>
          </div>

          {/* Violation Type Options */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-800 block">
              Loại vi phạm <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2.5">
              {violationOptions.map((option) => {
                const isSelected = selectedType === option.id;
                return (
                  <label
                    key={option.id}
                    className={`flex items-center gap-3.5 px-4 py-3 rounded-full border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white border-[#0B3025] shadow-sm ring-1 ring-[#0B3025]'
                        : 'bg-white/70 border-[#E5E4DE] hover:border-zinc-400 hover:bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="violationType"
                      value={option.id}
                      checked={isSelected}
                      onChange={() => setSelectedType(option.id)}
                      className="size-4 accent-[#0B3025]"
                    />
                    <span className="text-xs font-semibold text-zinc-800">{option.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Additional details text area */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-800 block">
              Chi tiết bổ sung (không bắt buộc)
            </label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Vui lòng cung cấp thêm thông tin về vi phạm để giúp chúng tôi xử lý nhanh hơn..."
              className="w-full p-4 rounded-2xl bg-[#EAE8E2]/60 border border-[#DCD9CF] focus:outline-none focus:ring-1 focus:ring-[#0B3025] text-xs text-zinc-800 placeholder-zinc-400 resize-none font-medium"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-xs font-bold text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedType}
              className={`px-6 py-2.5 rounded-full text-xs font-bold text-white transition-all shadow-sm ${
                selectedType && !isSubmitting
                  ? 'bg-[#0B3025] hover:bg-[#08241C]'
                  : 'bg-zinc-300 text-zinc-500 cursor-not-allowed shadow-none'
              }`}
            >
              {isSubmitting ? 'Đang gửi...' : 'Gửi báo cáo'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
