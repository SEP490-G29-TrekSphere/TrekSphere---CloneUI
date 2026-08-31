import { Clock, Loader2 } from 'lucide-react';
import { formatDate } from '@/utils/format';

interface MyJoinRequestStatusCardProps {
  submittedAt: string;
  message?: string;
  isWithdrawing: boolean;
  onWithdraw: () => void;
}

/**
 * Card "đơn/yêu cầu tham gia của bạn" hiển thị thay danh sách thành viên khi người xem
 * đang có yêu cầu tham gia chờ duyệt (role 'pending') — tái hiện phong cách thiết kế của
 * MyApplicationStatusCard (story-flow review) nhưng rút gọn: bỏ stepper nhiều bước và các
 * trạng thái Waitlist/Slot Offer vì BE thật chỉ có PENDING/ACCEPTED/REJECTED/LEFT.
 */
export function MyJoinRequestStatusCard({
  submittedAt,
  message,
  isWithdrawing,
  onWithdraw,
}: MyJoinRequestStatusCardProps) {
  return (
    <div className="mx-auto max-w-2xl space-y-5 rounded-3xl border border-border bg-card p-6 shadow-xs md:p-8">
      <div className="space-y-1 border-b border-border pb-4">
        <h3 className="text-base font-extrabold text-foreground">Yêu cầu tham gia của bạn</h3>
        <p className="text-xs text-muted-foreground">Gửi lúc {formatDate(submittedAt)}</p>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4">
        <Clock className="h-5 w-5 shrink-0 text-blue-600" />
        <div>
          <p className="text-xs font-extrabold text-blue-700 dark:text-blue-400">
            Đang chờ trưởng nhóm duyệt
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Bạn sẽ xem được danh sách thành viên ngay khi yêu cầu được chấp nhận.
          </p>
        </div>
      </div>

      {message && (
        <div className="space-y-1 rounded-2xl border border-border bg-background p-3.5">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-foreground">
            Lời nhắn bạn đã gửi trưởng nhóm:
          </span>
          <p className="text-xs italic leading-relaxed text-muted-foreground">"{message}"</p>
        </div>
      )}

      <div className="flex justify-end border-t border-border pt-4">
        <button
          type="button"
          disabled={isWithdrawing}
          onClick={onWithdraw}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-destructive/30 bg-background px-4 text-xs font-bold text-destructive transition-colors hover:bg-destructive/5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isWithdrawing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {isWithdrawing ? 'Đang hủy...' : 'Rút yêu cầu tham gia'}
        </button>
      </div>
    </div>
  );
}
