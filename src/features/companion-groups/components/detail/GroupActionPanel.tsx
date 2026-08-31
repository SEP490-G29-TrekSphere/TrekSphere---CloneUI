import { Loader2, MessageSquare, ShieldCheck, WalletCards } from 'lucide-react';
import type { MatchingGroupBudgetItem, MatchingGroupStatus } from '../../services/companionGroupService';
import type { UserRoleInGroup } from '../../types';

interface GroupActionPanelProps {
  role: UserRoleInGroup;
  groupStatus: MatchingGroupStatus;
  isJoining: boolean;
  onOpenChat: () => void;
  onJoin: () => void;
  onLeave: () => void;
  onCancelRequest: () => void;
  onCreateGroupChat: () => void;
  acceptedMembersCount: number;
  hasConversation?: boolean;
  isInConversation?: boolean;
  budgetItems?: MatchingGroupBudgetItem[];
}

function formatVnd(amount: number) {
  return `${amount.toLocaleString('vi-VN')} đ`;
}

export function GroupActionPanel({
  role,
  groupStatus,
  isJoining,
  onOpenChat,
  onJoin,
  onLeave,
  onCancelRequest,
  onCreateGroupChat,
  acceptedMembersCount,
  hasConversation,
  isInConversation,
  budgetItems = [],
}: GroupActionPanelProps) {
  const isMemberOrLeader = role === 'leader' || role === 'member';

  const budgetTotal =
    budgetItems.length > 0
      ? budgetItems.reduce((sum, item) => sum + item.amount, 0)
      : 2180000;

  return (
    <div className="space-y-6">
      {/* 1. CHAT CARD: Chỉ hiển thị cho người đã tham gia nhóm (Leader hoặc Member) */}
      {isMemberOrLeader && (
        <div className="rounded-2xl bg-primary p-7 text-white shadow-sm space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Chat Nhóm</h2>
              <p className="text-xs text-white/70 mt-1">Kết nối với thành viên trong chuyến đi</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white">
              <MessageSquare className="h-5 w-5" />
            </div>
          </div>

          {role === 'leader' ? (
            <div className="space-y-2">
              <button
                type="button"
                onClick={onCreateGroupChat}
                disabled={!hasConversation && acceptedMembersCount < 3}
                className="w-full rounded-full bg-white py-3.5 text-xs font-bold text-primary transition-all hover:bg-white/90 active:scale-[0.99] shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {hasConversation
                  ? 'Vào nhóm chat'
                  : acceptedMembersCount >= 3
                    ? 'Tạo / Vào nhóm chat'
                    : 'Cần ít nhất 3 thành viên'}
              </button>
              {!hasConversation && acceptedMembersCount < 3 && (
                <p className="text-[10px] text-white/80 text-center leading-tight">
                  (Chỉ có thể tạo nhóm chat chung khi có từ 3 người trở lên)
                </p>
              )}
            </div>
          ) : hasConversation ? (
            isInConversation ? (
              <button
                type="button"
                onClick={onOpenChat}
                className="w-full rounded-full bg-white py-3.5 text-xs font-bold text-primary transition-all hover:bg-white/90 active:scale-[0.99] shadow-sm cursor-pointer"
              >
                Vào nhóm chat
              </button>
            ) : (
              <div className="rounded-full bg-white/20 py-3.5 text-xs font-medium text-white/70 text-center shadow-sm cursor-not-allowed">
                Bạn không nằm trong nhóm chat này
              </div>
            )
          ) : (
            <div className="rounded-full bg-white/20 py-3.5 text-xs font-medium text-white/70 text-center shadow-sm cursor-not-allowed">
              Trưởng nhóm chưa tạo nhóm chat
            </div>
          )}
        </div>
      )}

      {/* 2. KHỐI TỔNG QUAN XIN THAM GIA & HÀNH ĐỘNG (Dành cho người chưa vào nhóm: Guest / Pending) */}
      {!isMemberOrLeader && (
        <div className="rounded-3xl border border-primary/20 bg-card p-6 shadow-md space-y-5">
          {/* Header & Giá tổng quan */}
          <div className="border-b border-border pb-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <WalletCards className="h-4 w-4 text-primary" /> Chi phí ước tính
              </span>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-600">
                Mô hình C2C
              </span>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <h3 className="text-2xl font-black text-foreground">{formatVnd(budgetTotal)}</h3>
              <span className="text-xs font-bold text-muted-foreground">/ người</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug">
              Chi phí dự toán đồng chia tự túc. Xem chi tiết danh mục thu chi tại tab{' '}
              <strong className="text-foreground">"Dự toán"</strong>.
            </p>
          </div>

          {/* Điểm nổi bật & Cam kết nhóm ghép */}
          <div className="space-y-2.5 text-xs bg-muted/40 rounded-2xl p-3.5 border border-border/50">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Trạng thái nhóm:</span>
              <span className="font-bold text-foreground">
                {groupStatus === 'OPEN' ? 'Đang tuyển thành viên' : 'Đã đủ số lượng'}
              </span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Duyệt thành viên:</span>
              <span className="font-semibold text-foreground">Leader trực tiếp duyệt</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Hình thức chuyến đi:</span>
              <span className="font-semibold text-foreground">Tự túc chia đều</span>
            </div>
          </div>

          {/* Nút hành động chính theo role */}
          {role === 'guest' && (
            <div className="space-y-3 pt-1">
              <button
                type="button"
                disabled={isJoining || groupStatus !== 'OPEN'}
                onClick={onJoin}
                className="w-full rounded-full bg-primary py-3.5 text-xs font-extrabold text-white hover:bg-primary-hover transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                {isJoining && <Loader2 className="w-4 h-4 animate-spin" />}
                {isJoining
                  ? 'Đang gửi yêu cầu...'
                  : groupStatus === 'OPEN'
                    ? 'Gửi yêu cầu tham gia nhóm'
                    : 'Nhóm đã đủ thành viên'}
              </button>
              <p className="text-[10px] text-muted-foreground text-center">
                ⚡ Leader thường phản hồi yêu cầu trong vòng 2 - 4 giờ
              </p>
            </div>
          )}

          {role === 'pending' && (
            <div className="space-y-3 pt-1 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                <h4 className="text-xs font-bold">Yêu cầu đang chờ duyệt</h4>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Yêu cầu của bạn đã được gửi tới Trưởng nhóm. Bạn sẽ nhận thông báo ngay khi hồ sơ được duyệt.
              </p>
              <button
                type="button"
                onClick={onCancelRequest}
                className="w-full rounded-full border border-destructive/30 bg-card py-2.5 text-xs font-bold text-destructive hover:bg-destructive/5 transition-colors shadow-xs cursor-pointer mt-1"
              >
                Hủy yêu cầu tham gia
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 pt-1 text-[10.5px] text-muted-foreground border-t border-border/60">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Cam kết tuân thủ quy tắc an toàn & văn hóa ghép nhóm TrekSphere.</span>
          </div>
        </div>
      )}

      {role === 'member' && (
        <div className="rounded-3xl bg-card border border-border p-6 text-center space-y-4 shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-foreground">Bạn đã là thành viên</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Bạn đã tham gia nhóm ghép này thành công.
            </p>
          </div>
          <button
            type="button"
            onClick={onLeave}
            className="w-full rounded-full border border-destructive/30 bg-card py-3.5 text-xs font-bold text-destructive hover:bg-destructive/5 transition-colors shadow-sm cursor-pointer"
          >
            Rời khỏi nhóm ghép
          </button>
        </div>
      )}

      {role === 'leader' && (
        <div className="rounded-3xl bg-card border border-border p-6 text-center space-y-2 shadow-sm">
          <h3 className="text-sm font-bold text-foreground">Quản lý nhóm ghép</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Bạn là trưởng nhóm. Việc giải tán nhóm cần được{' '}
            <strong className="text-foreground">toàn bộ thành viên đồng thuận</strong> — vào tab{' '}
            <strong className="text-foreground">"Quản trị nhóm"</strong> để chuyển giao quyền Leader
            hoặc gửi yêu cầu giải tán.
          </p>
        </div>
      )}
    </div>
  );
}

