import { Loader2, MessageSquare } from 'lucide-react';
import type { MatchingGroupStatus } from '../../services/companionGroupService';
import type { UserRoleInGroup } from '../../types';

interface GroupActionPanelProps {
  role: UserRoleInGroup;
  groupStatus: MatchingGroupStatus;
  isJoining: boolean;
  onOpenChat: () => void;
  onJoin: () => void;
  onLeave: () => void;
  onCancelRequest: () => void;
  onDissolve: () => void;
  onCreateGroupChat: () => void;
  acceptedMembersCount: number;
  hasConversation?: boolean;
}

export function GroupActionPanel({
  role,
  groupStatus,
  isJoining,
  onOpenChat,
  onJoin,
  onLeave,
  onCancelRequest,
  onDissolve,
  onCreateGroupChat,
  acceptedMembersCount,
  hasConversation,
}: GroupActionPanelProps) {
  return (
    <div className="space-y-6">
      {/* Chat card */}
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
          <button
            type="button"
            onClick={onOpenChat}
            className="w-full rounded-full bg-white py-3.5 text-xs font-bold text-primary transition-all hover:bg-white/90 active:scale-[0.99] shadow-sm cursor-pointer"
          >
            Vào nhóm chat
          </button>
        ) : (
          <div className="rounded-full bg-white/20 py-3.5 text-xs font-medium text-white/70 text-center shadow-sm cursor-not-allowed">
            Trưởng nhóm chưa tạo nhóm chat
          </div>
        )}
      </div>

      {/* Role-based action card */}
      {role === 'pending' && (
        <div className="rounded-2xl bg-secondary/30 border border-secondary p-6 text-left space-y-3 shadow-sm">
          <h3 className="text-xs font-semibold text-primary uppercase tracking-wider">
            Yêu cầu đang chờ duyệt
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed font-medium">
            Yêu cầu gia nhập nhóm ghép của bạn đã được gửi thành công và đang chờ trưởng nhóm phê
            duyệt.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={onCancelRequest}
              className="w-full rounded-full border border-destructive/30 bg-card py-3 text-xs font-bold text-destructive hover:bg-destructive/5 transition-colors shadow-sm cursor-pointer"
            >
              Hủy yêu cầu tham gia
            </button>
          </div>
        </div>
      )}

      {role === 'guest' && (
        <div className="rounded-2xl bg-card border border-border p-6 text-center space-y-4 shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-foreground">Tham gia cùng nhóm này?</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Gửi yêu cầu gia nhập để đồng hành cùng các Trekker khác.
            </p>
          </div>
          <button
            type="button"
            disabled={isJoining || groupStatus !== 'OPEN'}
            onClick={onJoin}
            className="w-full rounded-full bg-primary py-3.5 text-xs font-bold text-white hover:bg-primary-hover transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5"
          >
            {isJoining && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isJoining
              ? 'Đang gửi...'
              : groupStatus === 'OPEN'
                ? 'Gửi yêu cầu tham gia'
                : 'Đã đủ thành viên'}
          </button>
        </div>
      )}

      {role === 'member' && (
        <div className="rounded-2xl bg-card border border-border p-6 text-center space-y-4 shadow-sm">
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
        <div className="rounded-2xl bg-card border border-border p-6 text-center space-y-4 shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-foreground">Quản lý nhóm ghép</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Bạn là trưởng nhóm. Bạn có quyền giải tán nhóm ghép này.
            </p>
          </div>
          <button
            type="button"
            onClick={onDissolve}
            className="w-full rounded-full border border-destructive/30 bg-card py-3.5 text-xs font-bold text-destructive hover:bg-destructive/5 transition-colors shadow-sm cursor-pointer"
          >
            Giải tán nhóm ghép
          </button>
        </div>
      )}
    </div>
  );
}
