import { AlertTriangle, Loader2, LogOut, ShieldAlert, UserCheck, X } from 'lucide-react';
import type { UserRoleInGroup } from '../../types';
import type { JoinRequestAction } from './JoinRequestsCard';

interface GroupModalsProps {
  activeModal: 'dissolve' | 'leave' | 'reject' | 'approve' | null;
  setActiveModal: (modal: 'dissolve' | 'leave' | 'reject' | 'approve' | null) => void;
  selectedRequest: JoinRequestAction | null;
  currentUserRole: UserRoleInGroup;

  // Pending states
  isApprovePending: boolean;
  isRejectPending: boolean;
  isDissolvePending: boolean;
  isLeaveModalPending: boolean;

  // Action Handlers
  onConfirmApprove: () => void;
  onConfirmReject: () => void;
  onConfirmDissolveGroup: () => void;
  onConfirmLeaveGroup: () => void;
  onConfirmCancelJoinRequest: () => void;
}

export function GroupModals({
  activeModal,
  setActiveModal,
  selectedRequest,
  currentUserRole,
  isApprovePending,
  isRejectPending,
  isDissolvePending,
  isLeaveModalPending,
  onConfirmApprove,
  onConfirmReject,
  onConfirmDissolveGroup,
  onConfirmLeaveGroup,
  onConfirmCancelJoinRequest,
}: GroupModalsProps) {
  return (
    <>
      {/* 1. Modal duyệt thành viên */}
      {activeModal === 'approve' && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary">
                <UserCheck className="h-5 w-5" />
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Duyệt thành viên gia nhập</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Bạn có chắc chắn muốn duyệt <strong>{selectedRequest.userName}</strong> tham gia vào
                nhóm ghép này?
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                disabled={isApprovePending}
                onClick={() => setActiveModal(null)}
                className="flex-1 rounded-full border border-border py-2.5 text-xs font-bold text-foreground hover:bg-muted disabled:opacity-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isApprovePending}
                onClick={onConfirmApprove}
                className="flex-1 rounded-full bg-primary py-2.5 text-xs font-bold text-white hover:bg-primary-hover disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isApprovePending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {isApprovePending ? 'Đang duyệt...' : 'Xác nhận duyệt'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal từ chối yêu cầu */}
      {activeModal === 'reject' && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Từ chối yêu cầu</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Từ chối <strong>{selectedRequest.userName}</strong> gia nhập nhóm? Hành động này
                không thể hoàn tác.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                disabled={isRejectPending}
                onClick={() => setActiveModal(null)}
                className="flex-1 rounded-full border border-border py-2.5 text-xs font-bold text-foreground hover:bg-muted disabled:opacity-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isRejectPending}
                onClick={onConfirmReject}
                className="flex-1 rounded-full bg-destructive py-2.5 text-xs font-bold text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isRejectPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {isRejectPending ? 'Đang từ chối...' : 'Xác nhận từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal Giải tán nhóm */}
      {activeModal === 'dissolve' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Xác nhận giải tán nhóm</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Hành động này sẽ giải tán toàn bộ nhóm ghép và thông báo tới tất cả thành viên. Hành
                động này không thể hoàn tác.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                disabled={isDissolvePending}
                onClick={() => setActiveModal(null)}
                className="flex-1 rounded-full border border-border py-2.5 text-xs font-bold text-foreground hover:bg-muted disabled:opacity-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isDissolvePending}
                onClick={onConfirmDissolveGroup}
                className="flex-1 rounded-full bg-destructive py-2.5 text-xs font-bold text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isDissolvePending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {isDissolvePending ? 'Đang giải tán...' : 'Giải tán ngay'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Modal Rời khỏi nhóm / Hủy yêu cầu */}
      {activeModal === 'leave' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <LogOut className="h-5 w-5" />
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                {currentUserRole === 'pending' ? 'Hủy yêu cầu tham gia' : 'Rời khỏi nhóm ghép'}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                {currentUserRole === 'pending'
                  ? 'Bạn có chắc chắn muốn hủy yêu cầu xin tham gia nhóm ghép này?'
                  : 'Bạn có chắc chắn muốn rời khỏi chuyến đi này?'}
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                disabled={isLeaveModalPending}
                onClick={() => setActiveModal(null)}
                className="flex-1 rounded-full border border-border py-2.5 text-xs font-bold text-foreground hover:bg-muted disabled:opacity-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isLeaveModalPending}
                onClick={
                  currentUserRole === 'pending' ? onConfirmCancelJoinRequest : onConfirmLeaveGroup
                }
                className="flex-1 rounded-full bg-destructive py-2.5 text-xs font-bold text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isLeaveModalPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {currentUserRole === 'pending'
                  ? isLeaveModalPending
                    ? 'Đang hủy...'
                    : 'Xác nhận hủy'
                  : isLeaveModalPending
                    ? 'Đang thực hiện...'
                    : 'Xác nhận rời'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
