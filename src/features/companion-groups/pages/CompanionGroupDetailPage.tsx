import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  LogOut,
  MapPin,
  MessageSquare,
  ShieldAlert,
  UserCheck,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { PATHS } from '@/constants/paths';
import { AppButton } from '@/shared/ui';
import { useAppStore } from '@/store/useAppStore';
import { formatDate } from '@/utils/format';
import { useApproveMember } from '../hooks/useApproveMember';
import { useDeleteMatchingGroup } from '../hooks/useDeleteMatchingGroup';
import { useJoinRequests } from '../hooks/useJoinRequests';
import { useLeaveMatchingGroup } from '../hooks/useLeaveMatchingGroup';
import { useMatchingGroupDetail } from '../hooks/useMatchingGroupDetail';
import { useRejectMember } from '../hooks/useRejectMember';
import type { JoinRequest, UserRoleInGroup } from '../types';

export default function CompanionGroupDetailPage() {
  const navigate = useNavigate();
  const { groupId } = useParams<{ groupId: string }>();

  const user = useAppStore((state) => state.user);
  const deleteGroupMutation = useDeleteMatchingGroup();
  const leaveGroupMutation = useLeaveMatchingGroup();
  const approveMemberMutation = useApproveMember();
  const rejectMemberMutation = useRejectMember();

  // Fetch real group detail data from API GET /api/v1/matching-groups/{matchingGroupId}
  const { data: groupData, isLoading, isError, error, refetch } = useMatchingGroupDetail(groupId);

  // Fetch join requests (PENDING) — dedicated endpoint, only runs when user is owner
  const isOwner: boolean = Boolean(user && groupData && groupData.ownerId === user.id);

  // Join requests pagination state (must be declared before useJoinRequests)
  const [joinRequestsPage, setJoinRequestsPage] = useState(1);
  const JOIN_REQUESTS_PAGE_SIZE = 10;

  const {
    data: joinRequestsData,
    isLoading: isJoinRequestsLoading,
    isError: isJoinRequestsError,
    refetch: refetchJoinRequests,
  } = useJoinRequests(isOwner ? groupId : undefined, {
    status: 'PENDING',
    page: joinRequestsPage,
    size: JOIN_REQUESTS_PAGE_SIZE,
  });

  // Compute current user role context (Leader | Member | Pending | Guest)
  const currentUserRole: UserRoleInGroup = (() => {
    if (!user || !groupData) return 'guest';
    if (groupData.ownerId === user.id) return 'leader';
    const isMember = groupData.members?.some(
      (m) => m.userId === user.id && m.status === 'ACCEPTED'
    );
    if (isMember) return 'member';
    const isPending = groupData.members?.some(
      (m) => m.userId === user.id && m.status === 'PENDING'
    );
    if (isPending) return 'pending';
    return 'guest';
  })();

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active Modals
  const [activeModal, setActiveModal] = useState<
    'dissolve' | 'leave' | 'reject' | 'approve' | null
  >(null);
  const [selectedRequest, setSelectedRequest] = useState<JoinRequest | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // --- HANDLERS ---
  const handleConfirmApprove = () => {
    if (!selectedRequest) return;
    approveMemberMutation.mutate(selectedRequest.id, {
      onSuccess: () => {
        setActiveModal(null);
        showToast(`Đã duyệt thành viên ${selectedRequest.userName} gia nhập nhóm!`);
        setSelectedRequest(null);
      },
      onError: (err) => {
        showToast(err instanceof Error ? err.message : 'Có lỗi xảy ra khi duyệt thành viên.');
      },
    });
  };

  const handleConfirmReject = () => {
    if (!selectedRequest) return;
    rejectMemberMutation.mutate(selectedRequest.id, {
      onSuccess: () => {
        setActiveModal(null);
        showToast(`Đã từ chối yêu cầu của ${selectedRequest.userName}`);
        setSelectedRequest(null);
      },
      onError: (err) => {
        showToast(err instanceof Error ? err.message : 'Có lỗi xảy ra khi từ chối yêu cầu.');
      },
    });
  };

  const handleConfirmLeaveGroup = () => {
    if (!groupId) return;
    leaveGroupMutation.mutate(groupId, {
      onSuccess: () => {
        setActiveModal(null);
        showToast('Bạn đã rời khỏi nhóm ghép thành công.');
        setTimeout(() => {
          navigate(PATHS.GROUPS);
        }, 1200);
      },
      onError: (err) => {
        showToast(err instanceof Error ? err.message : 'Có lỗi xảy ra khi rời khỏi nhóm.');
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
          navigate(PATHS.GROUPS);
        }, 1200);
      },
      onError: (err) => {
        showToast(err instanceof Error ? err.message : 'Có lỗi xảy ra khi giải tán nhóm.');
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#FBF8F3] flex flex-col items-center justify-center p-6">
        <Loader2 className="w-10 h-10 text-emerald-800 animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-600">
          Đang tải thông tin chi tiết nhóm ghép...
        </p>
      </div>
    );
  }

  if (isError || !groupData) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#FBF8F3] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-red-100 shadow-lg space-y-4">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-extrabold text-[#0B3025]">Không thể tải thông tin nhóm</h2>
          <p className="text-xs text-zinc-500 leading-relaxed">
            {error instanceof Error
              ? error.message
              : 'Nhóm ghép không tồn tại hoặc đã bị giải tán.'}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <AppButton
              onClick={() => navigate(PATHS.GROUPS)}
              className="bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 font-bold px-5 py-2.5 rounded-full text-xs shadow-sm cursor-pointer"
            >
              Quay lại danh sách
            </AppButton>
            <AppButton
              onClick={() => refetch()}
              className="bg-[#0B3025] hover:bg-[#072019] text-white font-bold px-5 py-2.5 rounded-full text-xs shadow-sm border-none cursor-pointer"
            >
              Thử lại
            </AppButton>
          </div>
        </div>
      </div>
    );
  }

  // Filter accepted members from API response
  const acceptedMembers = groupData.members.filter((m) => m.status === 'ACCEPTED');

  return (
    <div className="min-h-screen bg-[#FBF8F3] px-4 pt-24 pb-12 md:px-10 lg:px-16 text-slate-800 font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 rounded-2xl bg-[#0D3B2E] px-6 py-3 text-sm font-semibold text-white shadow-xl animate-in fade-in slide-in-from-top-4">
          {toastMessage}
        </div>
      )}

      <div className="mx-auto max-w-6xl space-y-7">
        {/* Hero Banner Section */}
        <div className="relative overflow-hidden rounded-[36px] bg-[#0d2a22] shadow-sm p-6 md:p-10 text-white space-y-3.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="rounded-full bg-[#0D3B2E]/90 px-3.5 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
              Trạng thái:{' '}
              {groupData.status === 'OPEN'
                ? 'Đang tuyển'
                : groupData.status === 'FULL'
                  ? 'Đã đủ'
                  : 'Đã đóng'}
            </span>
            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-200">
              <Calendar className="h-3.5 w-3.5 text-emerald-400" />
              Khởi hành: {formatDate(groupData.targetDate)}
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight">
            {groupData.groupName}
          </h2>

          {groupData.tourName && (
            <p className="flex items-center gap-1.5 text-xs md:text-sm text-emerald-300 font-semibold">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>Tour: {groupData.tourName}</span>
            </p>
          )}

          {groupData.description && (
            <p className="max-w-3xl text-xs md:text-sm text-slate-200 leading-relaxed opacity-90">
              {groupData.description}
            </p>
          )}
        </div>

        {/* Main Grid Content (2 Columns) */}
        <div className="grid grid-cols-1 gap-7 lg:grid-cols-12">
          {/* Left Column: Thành viên nhóm & Lộ trình */}
          <div className="lg:col-span-8 space-y-7">
            {/* Box 1: Thành viên nhóm */}
            <div className="rounded-[32px] bg-[#F4EFE6]/60 p-6 md:p-8 border border-[#EBE3D5] space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Thành viên nhóm</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {acceptedMembers.length}/{groupData.maxSize} người đồng hành đã tham gia
                  </p>
                </div>
                <span className="rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-bold text-emerald-800">
                  Trưởng nhóm: {groupData.ownerName}
                </span>
              </div>

              {/* Members Avatar Cards Grid */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {acceptedMembers.map((member) => {
                  const isLeader = member.role === 'OWNER';
                  const initials = member.fullName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase();

                  return (
                    <div
                      key={member.matchingMemberId}
                      className="flex items-center gap-3 rounded-2xl bg-white p-3.5 shadow-2xs border border-slate-100"
                    >
                      <div className="relative shrink-0">
                        {member.avatarUrl ? (
                          <img
                            src={member.avatarUrl}
                            alt={member.fullName}
                            className="h-11 w-11 rounded-full object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="h-11 w-11 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-xs">
                            {initials}
                          </div>
                        )}
                        {isLeader && (
                          <div className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#0D3B2E] text-white">
                            <CheckCircle2 className="h-3 w-3 fill-emerald-400 text-[#0D3B2E]" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {member.fullName}
                        </h4>
                        <p
                          className={`text-[10px] tracking-wider font-extrabold ${
                            isLeader ? 'text-[#0D3B2E]' : 'text-slate-400'
                          }`}
                        >
                          {isLeader ? 'TRƯỞNG NHÓM' : 'THÀNH VIÊN'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Box 2: Quản lý Yêu cầu xin vào nhóm (Nếu là Trưởng nhóm) */}
            {currentUserRole === 'leader' && (
              <div className="rounded-[32px] bg-white p-6 md:p-8 border border-slate-200/80 shadow-2xs space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Duyệt thành viên xin vào nhóm
                  </h3>
                  <span className="text-xs font-semibold text-rose-600">
                    {joinRequestsData?.totalElements ?? 0} yêu cầu chờ xử lý
                  </span>
                </div>

                {/* Loading state */}
                {isJoinRequestsLoading && (
                  <div className="flex items-center justify-center py-8 gap-2 text-slate-500">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-xs font-medium">Đang tải danh sách yêu cầu...</span>
                  </div>
                )}

                {/* Error state */}
                {isJoinRequestsError && (
                  <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 flex items-center justify-between gap-3">
                    <p className="text-xs text-rose-700 font-medium">
                      Không thể tải danh sách yêu cầu.
                    </p>
                    <button
                      type="button"
                      onClick={() => refetchJoinRequests()}
                      className="text-xs font-bold text-rose-700 underline"
                    >
                      Thử lại
                    </button>
                  </div>
                )}

                {/* Empty state */}
                {!isJoinRequestsLoading &&
                  !isJoinRequestsError &&
                  (joinRequestsData?.content.length ?? 0) === 0 && (
                    <p className="text-xs text-slate-500">Chưa có yêu cầu tham gia mới nào.</p>
                  )}

                {/* Join requests list */}
                {!isJoinRequestsLoading &&
                  !isJoinRequestsError &&
                  (joinRequestsData?.content ?? []).map((req) => (
                    <div
                      key={req.matchingMemberId}
                      className="rounded-2xl border border-slate-100 bg-[#FBF9F5] p-5 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          {req.avatarUrl ? (
                            <img
                              src={req.avatarUrl}
                              alt={req.fullName}
                              className="h-11 w-11 rounded-full object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="h-11 w-11 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs">
                              {req.fullName.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">{req.fullName}</h4>
                            <p className="text-[11px] text-slate-500">
                              Yêu cầu gia nhập •{' '}
                              <span className="text-slate-400">
                                {new Date(req.createdAt).toLocaleDateString('vi-VN')}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRequest({
                                id: req.matchingMemberId,
                                userName: req.fullName,
                                avatarUrl: req.avatarUrl,
                                initials: req.fullName.substring(0, 2).toUpperCase(),
                                experienceInfo: '',
                                message: 'Mong muốn tham gia nhóm',
                              });
                              setActiveModal('approve');
                            }}
                            className="rounded-full bg-[#0D3B2E] px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-950 transition-colors"
                          >
                            Duyệt
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRequest({
                                id: req.matchingMemberId,
                                userName: req.fullName,
                                avatarUrl: req.avatarUrl,
                                initials: req.fullName.substring(0, 2).toUpperCase(),
                                experienceInfo: '',
                                message: 'Mong muốn tham gia nhóm',
                              });
                              setActiveModal('reject');
                            }}
                            className="rounded-full border border-slate-300 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                          >
                            Từ chối
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                {/* Pagination */}
                {!isJoinRequestsLoading &&
                  !isJoinRequestsError &&
                  (joinRequestsData?.totalPages ?? 0) > 1 && (
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-slate-500">
                        Trang {joinRequestsPage} / {joinRequestsData?.totalPages}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={joinRequestsPage <= 1}
                          onClick={() => setJoinRequestsPage((p) => p - 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled={joinRequestsData?.last}
                          onClick={() => setJoinRequestsPage((p) => p + 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
              </div>
            )}
          </div>

          {/* Right Column: Chat Nhóm & Yêu cầu chuyến đi */}
          <div className="lg:col-span-4 space-y-6">
            {/* Card 1: Chat Nhóm */}
            <div className="rounded-[32px] bg-[#1B362D] p-7 text-white shadow-md space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-extrabold text-white">Chat Nhóm</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Kết nối với thành viên trong chuyến đi
                  </p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#26483D] text-white">
                  <MessageSquare className="h-5 w-5" />
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate(PATHS.CHAT)}
                className="w-full rounded-full bg-white py-3.5 text-xs font-bold text-slate-900 transition-all hover:bg-slate-100 active:scale-[0.99] shadow-xs cursor-pointer"
              >
                Nhắn tin cho nhóm
              </button>
            </div>

            {/* Card 3: Nút tác vụ nhóm phụ thuộc vào vai trò */}
            {currentUserRole === 'pending' && (
              <div className="rounded-[32px] bg-amber-50 border border-amber-200 p-6 text-left space-y-2 shadow-2xs">
                <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                  Yêu cầu đang chờ duyệt
                </h4>
                <p className="text-xs text-amber-700 leading-relaxed font-medium">
                  Yêu cầu gia nhập nhóm ghép của bạn đã được gửi thành công và đang chờ trưởng nhóm
                  phê duyệt.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}
      {/* 1. Modal duyệt thành viên */}
      {activeModal === 'approve' && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-[28px] bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-[#0D3B2E]">
                <UserCheck className="h-5 w-5" />
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Duyệt thành viên gia nhập</h3>
              <p className="text-xs text-slate-500 mt-1">
                Bạn có chắc chắn muốn duyệt <strong>{selectedRequest.userName}</strong> tham gia vào
                nhóm ghép này?
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                disabled={approveMemberMutation.isPending}
                onClick={() => setActiveModal(null)}
                className="flex-1 rounded-full border border-slate-300 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={approveMemberMutation.isPending}
                onClick={handleConfirmApprove}
                className="flex-1 rounded-full bg-[#0D3B2E] py-2.5 text-xs font-bold text-white hover:bg-emerald-950 disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {approveMemberMutation.isPending && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                {approveMemberMutation.isPending ? 'Đang duyệt...' : 'Xác nhận duyệt'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal từ chối yêu cầu */}
      {activeModal === 'reject' && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-[28px] bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Từ chối yêu cầu</h3>
              <p className="text-xs text-slate-500 mt-1">
                Từ chối <strong>{selectedRequest.userName}</strong> gia nhập nhóm? Hành động này
                không thể hoàn tác.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                disabled={rejectMemberMutation.isPending}
                onClick={() => setActiveModal(null)}
                className="flex-1 rounded-full border border-slate-300 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={rejectMemberMutation.isPending}
                onClick={handleConfirmReject}
                className="flex-1 rounded-full bg-rose-600 py-2.5 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {rejectMemberMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {rejectMemberMutation.isPending ? 'Đang từ chối...' : 'Xác nhận từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Modal Giải tán nhóm */}
      {activeModal === 'dissolve' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-[28px] bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Xác nhận giải tán nhóm</h3>
              <p className="text-xs text-slate-500 mt-1">
                Hành động này sẽ giải tán toàn bộ nhóm ghép và thông báo tới tất cả thành viên. Hành
                động này không thể hoàn tác.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                disabled={deleteGroupMutation.isPending}
                onClick={() => setActiveModal(null)}
                className="flex-1 rounded-full border border-slate-300 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={deleteGroupMutation.isPending}
                onClick={handleConfirmDissolveGroup}
                className="flex-1 rounded-full bg-rose-600 py-2.5 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {deleteGroupMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {deleteGroupMutation.isPending ? 'Đang giải tán...' : 'Giải tán ngay'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Modal Rời khỏi nhóm */}
      {activeModal === 'leave' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-[28px] bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                <LogOut className="h-5 w-5" />
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {currentUserRole === 'pending' ? 'Hủy yêu cầu tham gia' : 'Rời khỏi nhóm ghép'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {currentUserRole === 'pending'
                  ? 'Bạn có chắc chắn muốn hủy yêu cầu xin tham gia nhóm ghép này?'
                  : 'Bạn có chắc chắn muốn rời khỏi chuyến đi này?'}
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                disabled={leaveGroupMutation.isPending}
                onClick={() => setActiveModal(null)}
                className="flex-1 rounded-full border border-slate-300 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={leaveGroupMutation.isPending}
                onClick={handleConfirmLeaveGroup}
                className="flex-1 rounded-full bg-rose-600 py-2.5 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {leaveGroupMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {leaveGroupMutation.isPending ? 'Đang thực hiện...' : 'Xác nhận rời'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
