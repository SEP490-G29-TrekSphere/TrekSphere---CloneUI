import { Loader2, Lock } from 'lucide-react';

interface MembersAccessRestrictedProps {
  isJoining: boolean;
  canJoin: boolean;
  onJoin: () => void;
}

/**
 * Khối "quyền truy cập bị giới hạn" hiển thị thay cho danh sách thành viên khi người xem
 * CHƯA gửi yêu cầu tham gia nhóm (role 'guest') — tái hiện phong cách thiết kế của
 * AccessRestrictedState (story-flow review) nhưng rút gọn cho đúng ngữ cảnh người dùng thật
 * (không còn actor-switcher dành cho reviewer) và nối với hành động tham gia thật.
 *
 * Nếu người xem ĐÃ gửi yêu cầu (role 'pending'), dùng `MyJoinRequestStatusCard` thay vì
 * component này.
 */
export function MembersAccessRestricted({
  isJoining,
  canJoin,
  onJoin,
}: MembersAccessRestrictedProps) {
  return (
    <div className="mx-auto max-w-2xl space-y-5 rounded-3xl border border-amber-500/30 bg-card p-8 text-center shadow-sm md:p-10">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-600 shadow-inner dark:text-amber-400">
        <Lock className="h-7 w-7" />
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-black tracking-tight text-foreground md:text-xl">
          Chỉ thành viên nhóm mới xem được danh sách này
        </h2>
        <p className="mx-auto max-w-md text-xs leading-relaxed text-muted-foreground md:text-sm">
          Gửi yêu cầu tham gia nhóm để xem danh sách thành viên và trò chuyện cùng mọi người.
        </p>
      </div>

      <button
        type="button"
        disabled={isJoining || !canJoin}
        onClick={onJoin}
        className="mx-auto inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-primary px-6 text-xs font-bold text-white shadow-sm transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isJoining && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {isJoining ? 'Đang gửi...' : canJoin ? 'Gửi yêu cầu tham gia' : 'Đã đủ thành viên'}
      </button>
    </div>
  );
}
