import { ArrowLeft, Clock, Lock, ShieldAlert, UserCheck, UserPlus } from 'lucide-react';
import type { PreviewView, ReviewActor } from '../../types/groupMatchingTypes';

export function isViewAllowedForActor(view: PreviewView, actor: ReviewActor): boolean {
  if (view === 'discovery' || view === 'outsider-detail') {
    return true;
  }
  if (view === 'applications') {
    // Leader/Co-Leader duyệt cả roster; Applicant/Waitlisted chỉ xem đơn của chính mình.
    // MEMBER/TREASURER đã là thành viên chính thức, không còn lý do vào hàng đợi ứng tuyển.
    return (
      actor === 'LEADER' ||
      actor === 'CO_LEADER' ||
      actor === 'APPLICANT' ||
      actor === 'WAITLISTED_APPLICANT'
    );
  }
  if (view === 'workspace' || view === 'trip') {
    return (
      actor === 'MEMBER' || actor === 'TREASURER' || actor === 'CO_LEADER' || actor === 'LEADER'
    );
  }
  return true;
}

interface AccessRestrictedStateProps {
  view: PreviewView;
  actor: ReviewActor;
  onSwitchActor: (actor: ReviewActor) => void;
  onOpenJoinWizard?: () => void;
  onNavigateView: (view: PreviewView) => void;
}

export function AccessRestrictedState({
  view,
  actor,
  onSwitchActor,
  onOpenJoinWizard,
  onNavigateView,
}: AccessRestrictedStateProps) {
  const isGuest = actor === 'GUEST';
  const isApplicant = actor === 'APPLICANT' || actor === 'WAITLISTED_APPLICANT';

  const viewNames: Record<PreviewView, string> = {
    discovery: '1. Khám phá nhóm',
    'outsider-detail': '2. Chi tiết nhóm',
    applications: '3. Duyệt đơn & Waitlist',
    workspace: '4. Workspace nội bộ nhóm',
    trip: '5. Chuyến đi & Live Tracking SOS',
  };

  const actorNames: Record<ReviewActor, string> = {
    GUEST: 'Khách / Người ngoài',
    APPLICANT: 'Ứng viên mới đăng ký',
    WAITLISTED_APPLICANT: 'Ứng viên trong Danh sách chờ (Waitlist)',
    MEMBER: 'Thành viên chính thức',
    TREASURER: 'Thủ quỹ nhóm',
    CO_LEADER: 'Phó đoàn',
    LEADER: 'Trưởng nhóm / Leader',
  };

  return (
    <div className="rounded-3xl border border-amber-500/30 bg-card p-8 md:p-12 shadow-sm text-center max-w-3xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-200">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-inner">
        {isGuest ? <Lock className="h-8 w-8" /> : <ShieldAlert className="h-8 w-8" />}
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-black text-amber-700 dark:text-amber-300 border border-amber-500/20">
          🔒 Quyền truy cập bị giới hạn theo Vai trò (Role Boundary)
        </div>
        <h2 className="text-xl md:text-2xl font-black text-foreground tracking-tight">
          Góc nhìn "{actorNames[actor]}" không thể xem màn {viewNames[view]}
        </h2>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
          {isGuest && (
            <>
              Bạn đang chọn Review ở <strong>Góc nhìn Người ngoài (Guest)</strong>. Thông tin
              Workspace (Quỹ nhóm C2C, Lộ trình chi tiết, Đồ dùng chuyến đi) và Nhật ký Check-in là
              dữ liệu nội bộ riêng tư chỉ dành riêng cho các <strong>Thành viên chính thức</strong>.
            </>
          )}
          {isApplicant && (
            <>
              Bạn đang ở <strong>Góc nhìn Ứng viên ({actorNames[actor]})</strong>. Đơn của bạn chưa
              được Trưởng nhóm chấp nhận. Bạn cần nhận được <strong>Slot Offer</strong> và xác nhận
              đồng ý để chính thức tham gia nhóm và mở khóa Workspace.
            </>
          )}
        </p>
      </div>

      {/* Recommended Action Box */}
      <div className="rounded-2xl border border-border bg-muted/40 p-4 text-left max-w-md mx-auto space-y-3">
        <span className="text-xs font-black text-foreground uppercase tracking-wider block">
          💡 Gợi ý thử nghiệm cho Reviewer:
        </span>
        <div className="flex flex-col gap-2">
          {isGuest && (
            <>
              <button
                type="button"
                onClick={() => onSwitchActor('MEMBER')}
                className="w-full flex items-center justify-between rounded-xl bg-primary px-4 py-2.5 text-xs font-extrabold text-primary-foreground hover:bg-primary/90 transition shadow-xs cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  Chuyển sang Góc nhìn Thành viên (Member)
                </span>
                <span>→</span>
              </button>
              <button
                type="button"
                onClick={() => onSwitchActor('LEADER')}
                className="w-full flex items-center justify-between rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-extrabold text-white hover:bg-amber-700 transition shadow-xs cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  Chuyển sang Góc nhìn Trưởng nhóm (Leader)
                </span>
                <span>→</span>
              </button>
              {onOpenJoinWizard && (
                <button
                  type="button"
                  onClick={onOpenJoinWizard}
                  className="w-full flex items-center justify-between rounded-xl bg-background border border-border px-4 py-2.5 text-xs font-bold text-foreground hover:bg-muted transition cursor-pointer"
                >
                  <span className="flex items-center gap-2 text-primary">
                    <UserPlus className="h-4 w-4" />
                    Thử Đăng ký ứng tuyển tham gia nhóm
                  </span>
                  <span>+</span>
                </button>
              )}
            </>
          )}

          {isApplicant && (
            <>
              <button
                type="button"
                onClick={() => onNavigateView('applications')}
                className="w-full flex items-center justify-between rounded-xl bg-primary px-4 py-2.5 text-xs font-extrabold text-primary-foreground hover:bg-primary/90 transition shadow-xs cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Xem Trạng thái Đơn của tôi (Step 3)
                </span>
                <span>→</span>
              </button>
              <button
                type="button"
                onClick={() => onSwitchActor('LEADER')}
                className="w-full flex items-center justify-between rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-extrabold text-white hover:bg-amber-700 transition shadow-xs cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  Chuyển sang Góc nhìn Leader Duyệt đơn
                </span>
                <span>→</span>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={() => onNavigateView('outsider-detail')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Quay lại trang Chi tiết nhóm (Public View)</span>
        </button>
      </div>
    </div>
  );
}
