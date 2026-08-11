import { useQueryClient } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { PATHS } from '@/constants/paths';
import { useCheckConversation } from '@/features/chat/hooks/useCheckConversation';
import { useCreateConversation } from '@/features/chat/hooks/useCreateConversation';
import { AppButton } from '@/shared/ui';
import { useAppStore } from '@/store/useAppStore';
import { GroupActionPanel } from '../components/detail/GroupActionPanel';
import { GroupDetailHero } from '../components/detail/GroupDetailHero';
import { GroupDetailSkeleton } from '../components/detail/GroupDetailSkeleton';
import { GroupModals } from '../components/detail/GroupModals';
import { type JoinRequestAction, JoinRequestsCard } from '../components/detail/JoinRequestsCard';
import { MembersCard } from '../components/detail/MembersCard';
import { useApproveMember } from '../hooks/useApproveMember';
import { useCancelJoinRequest } from '../hooks/useCancelJoinRequest';
import { useDeleteMatchingGroup } from '../hooks/useDeleteMatchingGroup';
import { useJoinMatchingGroup } from '../hooks/useJoinMatchingGroup';
import { useJoinRequests } from '../hooks/useJoinRequests';
import { useLeaveMatchingGroup } from '../hooks/useLeaveMatchingGroup';
import { useMatchingGroupDetail } from '../hooks/useMatchingGroupDetail';
import { useRejectMember } from '../hooks/useRejectMember';
import type { UserRoleInGroup } from '../types';

const JOIN_REQUESTS_PAGE_SIZE = 10;

interface CompanionGroupDetailPageProps {
  /**
   * Trang được render bên trong một portal đã có sidebar + padding riêng
   * (vd TrekkerLayout). Khi bật, bỏ wrapper `min-h-screen` và padding của
   * PublicLayout để không sinh khoảng trắng thừa hoặc scroll lồng nhau.
   */
  embedded?: boolean;
  /** Nơi quay về sau khi rời/giải tán nhóm. */
  backPath?: string;
  /** Trang chat tương ứng với portal đang mở trang này. */
  chatPath?: string;
}

export default function CompanionGroupDetailPage({
  embedded = false,
  backPath = PATHS.GROUPS,
  chatPath = PATHS.CHAT,
}: CompanionGroupDetailPageProps = {}) {
  const navigate = useNavigate();
  const { groupId } = useParams<{ groupId: string }>();

  // PublicLayout có header nổi nên cần pt-24; trong portal thì <main> đã có padding.
  const shellClassName = embedded
    ? 'text-foreground'
    : 'min-h-screen bg-background px-4 pt-24 pb-12 md:px-10 lg:px-16 text-foreground';

  const user = useAppStore((state) => state.user);
  const deleteGroupMutation = useDeleteMatchingGroup();
  const leaveGroupMutation = useLeaveMatchingGroup();
  const cancelJoinRequestMutation = useCancelJoinRequest();
  const joinGroupMutation = useJoinMatchingGroup();
  const approveMemberMutation = useApproveMember();
  const rejectMemberMutation = useRejectMember();
  const checkConversationMutation = useCheckConversation();
  const createConversationMutation = useCreateConversation();
  const queryClient = useQueryClient();

  // Fetch real group detail data from API GET /api/v1/matching-groups/{matchingGroupId}
  const { data: groupData, isLoading, isError, error, refetch } = useMatchingGroupDetail(groupId);

  // Fetch join requests (PENDING) — dedicated endpoint, only runs when user is owner
  const isOwner: boolean = Boolean(
    user && groupData && String(groupData.ownerId) === String(user.id)
  );

  // Join requests pagination state (must be declared before useJoinRequests)
  const [joinRequestsPage, setJoinRequestsPage] = useState(1);

  const {
    data: joinRequestsData,
    isLoading: isJoinRequestsLoading,
    isError: isJoinRequestsError,
    refetch: refetchJoinRequests,
  } = useJoinRequests(isOwner ? groupId : undefined, {
    status: 'PENDING',
    page: joinRequestsPage - 1,
    size: JOIN_REQUESTS_PAGE_SIZE,
  });

  // Compute current user role context (Leader | Member | Pending | Guest)
  const currentUserRole: UserRoleInGroup = (() => {
    if (!user || !groupData) return 'guest';
    if (String(groupData.ownerId) === String(user.id)) return 'leader';
    const isMember = groupData.members?.some(
      (m) => String(m.userId) === String(user.id) && m.status === 'ACCEPTED'
    );
    if (isMember) return 'member';
    const isPending = groupData.members?.some(
      (m) => String(m.userId) === String(user.id) && m.status === 'PENDING'
    );
    if (isPending) return 'pending';
    return 'guest';
  })();

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active Modals
  const [activeModal, setActiveModal] = useState<
    'dissolve' | 'leave' | 'reject' | 'approve' | null
  >(null);
  const [selectedRequest, setSelectedRequest] = useState<JoinRequestAction | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // --- HANDLERS ---
  const handleCreateGroupChat = () => {
    if (!groupId || !groupData) return;

    // Lọc ra các thành viên đã tham gia nhóm (ACCEPTED) và không phải là user hiện tại
    const otherParticipantIds = (groupData.members || [])
      .filter((m) => m.status === 'ACCEPTED' && String(m.userId) !== String(user?.id))
      .map((m) => m.userId);

    checkConversationMutation.mutate(
      {
        conversationType: 'GROUP',
        title: groupData.groupName || 'Nhóm ghép',
        participantIds: otherParticipantIds,
        matchingGroupId: groupId,
      },
      {
        onSuccess: (res) => {
          if (res && res.conversationId) {
            navigate(chatPath, { state: { conversationId: res.conversationId } });
          } else {
            createConversationMutation.mutate(
              {
                conversationType: 'GROUP',
                title: groupData.groupName || 'Nhóm ghép',
                participantIds: otherParticipantIds,
                matchingGroupId: groupId,
              },
              {
                onSuccess: (createRes) => {
                  queryClient.invalidateQueries({
                    queryKey: ['companionGroup', 'detail', groupId],
                  });
                  navigate(chatPath, { state: { conversationId: createRes.conversationId } });
                },
                onError: (err) => {
                  showToast(err instanceof Error ? err.message : 'Lỗi khi tạo nhóm chat');
                },
              }
            );
          }
        },
        onError: (err) => {
          showToast(err instanceof Error ? err.message : 'Lỗi khi kiểm tra nhóm chat');
        },
      }
    );
  };

  const handleDirectChat = (memberId: string, memberName: string, memberAvatar?: string) => {
    if (!memberId) return;
    checkConversationMutation.mutate(
      {
        conversationType: 'DIRECT',
        participantIds: [memberId],
      },
      {
        onSuccess: (res) => {
          if (res && res.conversationId) {
            navigate(chatPath, { state: { conversationId: res.conversationId } });
          } else {
            navigate(chatPath, {
              state: {
                virtualConversation: {
                  type: 'DIRECT',
                  participantIds: [memberId],
                  userName: memberName,
                  avatarUrl: memberAvatar,
                },
              },
            });
          }
        },
        onError: (err) => {
          showToast(err instanceof Error ? err.message : 'Lỗi khi kiểm tra phòng chat');
        },
      }
    );
  };

  const handleConfirmApprove = () => {
    if (!selectedRequest || !groupId) return;
    approveMemberMutation.mutate(
      { groupId, memberId: selectedRequest.id },
      {
        onSuccess: () => {
          setActiveModal(null);
          showToast(`Đã duyệt thành viên ${selectedRequest.userName} gia nhập nhóm!`);
          setSelectedRequest(null);
        },
        onError: (err) => {
          showToast(err instanceof Error ? err.message : 'Có lỗi xảy ra khi duyệt thành viên.');
        },
      }
    );
  };

  const handleConfirmReject = () => {
    if (!selectedRequest || !groupId) return;
    rejectMemberMutation.mutate(
      { groupId, memberId: selectedRequest.id },
      {
        onSuccess: () => {
          setActiveModal(null);
          showToast(`Đã từ chối yêu cầu của ${selectedRequest.userName}`);
          setSelectedRequest(null);
        },
        onError: (err) => {
          showToast(err instanceof Error ? err.message : 'Có lỗi xảy ra khi từ chối yêu cầu.');
        },
      }
    );
  };

  const handleConfirmLeaveGroup = () => {
    if (!groupId) return;
    leaveGroupMutation.mutate(groupId, {
      onSuccess: () => {
        setActiveModal(null);
        showToast('Bạn đã rời khỏi nhóm ghép thành công.');
        setTimeout(() => {
          navigate(backPath);
        }, 1200);
      },
      onError: (err) => {
        showToast(err instanceof Error ? err.message : 'Có lỗi xảy ra khi rời khỏi nhóm.');
      },
    });
  };

  const handleJoinGroup = () => {
    if (!groupId) return;
    joinGroupMutation.mutate(groupId, {
      onSuccess: () => {
        showToast('Đã gửi yêu cầu tham gia nhóm ghép.');
      },
      onError: (err) => {
        showToast(err instanceof Error ? err.message : 'Có lỗi xảy ra khi xin tham gia.');
      },
    });
  };

  const handleConfirmCancelJoinRequest = () => {
    if (!groupId) return;
    cancelJoinRequestMutation.mutate(groupId, {
      onSuccess: () => {
        setActiveModal(null);
        showToast('Đã hủy yêu cầu tham gia nhóm ghép.');
      },
      onError: (err) => {
        showToast(err instanceof Error ? err.message : 'Có lỗi xảy ra khi hủy yêu cầu.');
      },
    });
  };

  const handleConfirmDissolveGroup = () => {
    if (!groupId) return;
    deleteGroupMutation.mutate(groupId, {
      onSuccess: () => {
        setActiveModal(null);
        showToast('Đã giải tán nhóm thành công!');
        setTimeout(() => {
          navigate(backPath);
        }, 1200);
      },
      onError: (err) => {
        showToast(err instanceof Error ? err.message : 'Có lỗi xảy ra khi giải tán nhóm.');
      },
    });
  };

  if (isLoading) {
    return (
      <div className={shellClassName}>
        <GroupDetailSkeleton />
      </div>
    );
  }

  if (isError || !groupData) {
    return (
      <div
        className={
          embedded
            ? 'flex flex-col items-center justify-center py-16 text-center'
            : 'min-h-[calc(100vh-4rem)] bg-background flex flex-col items-center justify-center p-6 text-center'
        }
      >
        <div className="max-w-md w-full bg-card p-8 rounded-2xl border border-border shadow-sm space-y-4">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
          <h1 className="text-xl font-bold text-foreground">Không thể tải thông tin nhóm</h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {error instanceof Error
              ? error.message
              : 'Nhóm ghép không tồn tại hoặc đã bị giải tán.'}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <AppButton
              variant="outline"
              onClick={() => navigate(backPath)}
              className="rounded-full px-5 text-xs font-bold"
            >
              Quay lại danh sách
            </AppButton>
            <AppButton onClick={() => refetch()} className="rounded-full px-5 text-xs font-bold">
              Thử lại
            </AppButton>
          </div>
        </div>
      </div>
    );
  }

  const isLeaveModalPending =
    currentUserRole === 'pending'
      ? cancelJoinRequestMutation.isPending
      : leaveGroupMutation.isPending;

  return (
    <div className={shellClassName}>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg animate-in fade-in slide-in-from-top-4">
          {toastMessage}
        </div>
      )}

      <div className="mx-auto max-w-6xl space-y-7">
        <GroupDetailHero
          groupName={groupData.groupName}
          tourName={groupData.tourName}
          description={groupData.description}
          status={groupData.status}
          targetDate={groupData.targetDate}
        />

        {/* Main Grid Content (2 Columns) */}
        <div className="grid grid-cols-1 gap-7 lg:grid-cols-12">
          {/* Left Column: Thành viên nhóm & Duyệt yêu cầu */}
          <div className="lg:col-span-8 space-y-7">
            <MembersCard
              members={groupData.members}
              maxSize={groupData.maxSize}
              ownerName={groupData.ownerName}
              currentUserId={user?.id?.toString()}
              onDirectChat={handleDirectChat}
            />

            {currentUserRole === 'leader' && (
              <JoinRequestsCard
                requests={joinRequestsData?.content ?? []}
                isLoading={isJoinRequestsLoading}
                isError={isJoinRequestsError}
                onRetry={() => refetchJoinRequests()}
                onApprove={(req) => {
                  setSelectedRequest(req);
                  setActiveModal('approve');
                }}
                onReject={(req) => {
                  setSelectedRequest(req);
                  setActiveModal('reject');
                }}
                page={joinRequestsPage}
                totalPages={joinRequestsData?.totalPages ?? 0}
                totalElements={joinRequestsData?.totalElements ?? 0}
                isLast={joinRequestsData?.last ?? true}
                onPrevPage={() => setJoinRequestsPage((p) => p - 1)}
                onNextPage={() => setJoinRequestsPage((p) => p + 1)}
              />
            )}
          </div>

          {/* Right Column: Chat nhóm & tác vụ theo vai trò */}
          <div className="lg:col-span-4">
            <GroupActionPanel
              role={currentUserRole}
              groupStatus={groupData.status}
              isJoining={joinGroupMutation.isPending}
              onOpenChat={handleCreateGroupChat}
              onJoin={handleJoinGroup}
              onLeave={() => setActiveModal('leave')}
              onCancelRequest={() => setActiveModal('leave')}
              onDissolve={() => setActiveModal('dissolve')}
              onCreateGroupChat={handleCreateGroupChat}
              acceptedMembersCount={groupData.members.filter((m) => m.status === 'ACCEPTED').length}
              hasConversation={groupData.hasConversation}
            />
          </div>
        </div>
      </div>

      <GroupModals
        activeModal={activeModal}
        setActiveModal={setActiveModal}
        selectedRequest={selectedRequest}
        currentUserRole={currentUserRole}
        isApprovePending={approveMemberMutation.isPending}
        isRejectPending={rejectMemberMutation.isPending}
        isDissolvePending={deleteGroupMutation.isPending}
        isLeaveModalPending={isLeaveModalPending}
        onConfirmApprove={handleConfirmApprove}
        onConfirmReject={handleConfirmReject}
        onConfirmDissolveGroup={handleConfirmDissolveGroup}
        onConfirmLeaveGroup={handleConfirmLeaveGroup}
        onConfirmCancelJoinRequest={handleConfirmCancelJoinRequest}
      />
    </div>
  );
}
