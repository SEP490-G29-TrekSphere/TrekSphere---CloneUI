import { ArrowRight, ExternalLink, UserCog } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PATHS } from '@/constants/paths';

interface StoryProfileGateScreenProps {
  onContinueMock: () => void;
}

/**
 * Màn chắn trước khi vào "Tìm nhóm": yêu cầu hoàn tất Hiking Profile nâng cao.
 * Đây là mock hoàn toàn (không có cơ chế check profile-completeness thật trong hệ thống hiện tại) —
 * chỉ mô phỏng đúng bước UX, không đọc/ghi dữ liệu profile thật.
 */
export function StoryProfileGateScreen({ onContinueMock }: StoryProfileGateScreenProps) {
  return (
    <div className="mx-auto max-w-xl py-16 text-center space-y-6">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
        <UserCog className="h-8 w-8" />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-black text-foreground">
          Hoàn tất Hồ sơ Trekking trước khi tìm nhóm
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Hồ sơ Hiking Profile (kinh nghiệm, quãng đường, đỉnh đã chinh phục) giúp các Trưởng nhóm
          đánh giá đơn ứng tuyển của bạn nhanh và chính xác hơn.
        </p>
      </div>

      <div className="flex flex-col items-center gap-3 pt-2">
        <Link
          to={PATHS.TREKKER_PROFILE_EDIT}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-extrabold text-primary-foreground shadow-md hover:bg-primary/90 transition"
        >
          Đến trang Hồ sơ để cập nhật
          <ExternalLink className="h-4 w-4" />
        </Link>

        <button
          type="button"
          onClick={onContinueMock}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition"
        >
          Tôi đã cập nhật xong (demo) — Tiếp tục vào Tìm nhóm
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <p className="text-[11px] text-muted-foreground/70 pt-4">
        Đây là màn mô phỏng cho mục đích review UI — không kiểm tra dữ liệu hồ sơ thật.
      </p>
    </div>
  );
}

export default StoryProfileGateScreen;
