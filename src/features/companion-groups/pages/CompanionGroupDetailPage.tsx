import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Circle,
  Eye,
  EyeOff,
  LogOut,
  MapPin,
  MessageSquare,
  ShieldAlert,
  UserCheck,
  UserPlus,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { PATHS } from '@/constants/paths';
import { MOCK_GROUP_DETAIL } from '../data/mockGroupDetail';
import type { GroupMemberDetail, JoinRequest, UserRoleInGroup } from '../types';

export default function CompanionGroupDetailPage() {
  const navigate = useNavigate();
  const { groupId } = useParams<{ groupId: string }>();

  // Current logged-in user role context (Leader | Member | Guest)
  const [currentUserRole, _setCurrentUserRole] = useState<UserRoleInGroup>('leader');

  // Group State
  const [group, setGroup] = useState(() => {
    if (groupId && groupId !== MOCK_GROUP_DETAIL.id) {
      return { ...MOCK_GROUP_DETAIL, id: groupId };
    }
    return MOCK_GROUP_DETAIL;
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active Modals
  const [activeModal, setActiveModal] = useState<
    'dissolve' | 'leave' | 'reject' | 'approve' | 'hide' | null
  >(null);
  const [selectedRequest, setSelectedRequest] = useState<JoinRequest | null>(null);

  // Trip Requirements Checkbox items state
  const [checklist, setChecklist] = useState([
    {
      id: 'gear',
      label: 'Đồ bảo hộ',
      detail: 'Giày trekking, gậy leo núi, đèn pin',
      completed: true,
    },
    {
      id: 'health',
      label: 'Sức khỏe',
      detail: 'Không có bệnh tim mạch, hô hấp',
      completed: true,
    },
    {
      id: 'docs',
      label: 'Giấy tờ',
      detail: 'CCCD photo để làm thủ tục biên giới',
      completed: false,
    },
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const toggleChecklistItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  // --- HANDLERS ---
  const handleConfirmApprove = () => {
    if (!selectedRequest) return;
    const req = selectedRequest;
    const newMember: GroupMemberDetail = {
      id: req.id,
      name: req.userName,
      avatarUrl: req.avatarUrl,
      initials: req.initials,
      role: 'Thành viên',
      roleTitle: 'THÀNH VIÊN',
    };

    setGroup((prev) => ({
      ...prev,
      currentMembers: prev.currentMembers + 1,
      neededMembers: Math.max(0, prev.neededMembers - 1),
      joinRequests: prev.joinRequests.filter((r) => r.id !== req.id),
      members: [...prev.members, newMember],
    }));

    setActiveModal(null);
    setSelectedRequest(null);
    showToast(`Đã duyệt thành viên ${req.userName} gia nhập nhóm!`);
  };

  const handleConfirmReject = () => {
    if (!selectedRequest) return;
    const req = selectedRequest;
    setGroup((prev) => ({
      ...prev,
      joinRequests: prev.joinRequests.filter((r) => r.id !== req.id),
    }));
    setActiveModal(null);
    setSelectedRequest(null);
    showToast(`Đã từ chối yêu cầu của ${req.userName}`);
  };

  const handleConfirmLeaveGroup = () => {
    setGroup((prev) => ({
      ...prev,
      currentMembers: Math.max(1, prev.currentMembers - 1),
      neededMembers: prev.neededMembers + 1,
      members: prev.members.filter((m) => !m.isLeader && m.id !== 'usr-current'),
    }));
    setActiveModal(null);
    showToast('Bạn đã rời khỏi nhóm ghép thành công.');
    setTimeout(() => {
      navigate(PATHS.GROUPS);
    }, 1200);
  };

  const handleConfirmDissolveGroup = () => {
    setActiveModal(null);
    showToast('Đã giải tán nhóm thành công!');
    setTimeout(() => {
      navigate(PATHS.GROUPS);
    }, 1200);
  };

  const handleToggleHideGroup = () => {
    const nextState = !group.isHidden;
    setGroup((prev) => ({ ...prev, isHidden: nextState }));
    setActiveModal(null);
    showToast(
      nextState ? 'Đã ẩn nhóm ghép khỏi danh sách công khai!' : 'Đã hiện lại nhóm ghép công khai!'
    );
  };

  // Mock list of 12 group members matching design screen
  const allGroupMembers = [
    {
      id: 'm-1',
      name: 'Minh Quân',
      roleTitle: 'TRƯỞNG NHÓM',
      isLeader: true,
      avatarUrl:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 'm-2',
      name: 'Linh Chi',
      roleTitle: 'THÀNH VIÊN',
      avatarUrl:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 'm-3',
      name: 'Hoàng Nam',
      roleTitle: 'THÀNH VIÊN',
      avatarUrl:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 'm-4',
      name: 'An Nhiên',
      roleTitle: 'THÀNH VIÊN',
      avatarUrl:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 'm-5',
      name: 'Quốc Bảo',
      roleTitle: 'THÀNH VIÊN',
      avatarUrl:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 'm-6',
      name: 'Thanh Thảo',
      roleTitle: 'THÀNH VIÊN',
      avatarUrl:
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FBF8F3] px-4 py-6 md:px-10 lg:px-16 text-slate-800 font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 rounded-2xl bg-[#0D3B2E] px-6 py-3 text-sm font-semibold text-white shadow-xl animate-in fade-in slide-in-from-top-4">
          {toastMessage}
        </div>
      )}

      <div className="mx-auto max-w-6xl space-y-7">
        {/* Hero Banner Section */}
        <div className="relative overflow-hidden rounded-[36px] bg-slate-900 shadow-sm">
          <div className="relative h-[340px] md:h-[400px] w-full">
            <img
              src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80"
              alt="Pha Luông"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 space-y-3.5 text-white">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="rounded-full bg-[#0D3B2E]/90 px-3.5 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
                Active Trek
              </span>
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-200">
                <Calendar className="h-3.5 w-3.5 text-emerald-400" />
                Oct 12 - Oct 15
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight">
              Đỉnh Pha Luông: Chinh Phục Sống Lưng Khủng Long
            </h2>

            <p className="max-w-3xl text-xs md:text-sm text-slate-200 leading-relaxed opacity-90">
              Nhóm leo núi trải nghiệm cung đường biên giới Việt - Lào, khám phá mây mù và vách đá
              hùng vĩ.
            </p>
          </div>
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
                    12 người đồng hành trong chuyến đi này
                  </p>
                </div>
                <span className="rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-bold text-emerald-800">
                  Trưởng nhóm: Minh Quân
                </span>
              </div>

              {/* Members Avatar Cards Grid (3 Columns) */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {allGroupMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 rounded-2xl bg-white p-3.5 shadow-2xs border border-slate-100"
                  >
                    <div className="relative shrink-0">
                      <img
                        src={member.avatarUrl}
                        alt={member.name}
                        className="h-11 w-11 rounded-full object-cover border border-slate-200"
                      />
                      {member.isLeader && (
                        <div className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#0D3B2E] text-white">
                          <CheckCircle2 className="h-3 w-3 fill-emerald-400 text-[#0D3B2E]" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{member.name}</h4>
                      <p
                        className={`text-[10px] tracking-wider font-extrabold ${
                          member.isLeader ? 'text-[#0D3B2E]' : 'text-slate-400'
                        }`}
                      >
                        {member.roleTitle}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dotted See More Button */}
              <button
                type="button"
                onClick={() => showToast('Đang tải thêm danh sách thành viên...')}
                className="w-full rounded-full border-2 border-dashed border-slate-300 bg-white/40 py-3.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-white"
              >
                Xem thêm 6 thành viên khác
              </button>
            </div>

            {/* Box 2: Quản lý Yêu cầu xin vào nhóm (Nếu là Trưởng nhóm) */}
            {currentUserRole === 'leader' && (
              <div className="rounded-[32px] bg-white p-6 md:p-8 border border-slate-200/80 shadow-2xs space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Duyệt thành viên xin vào nhóm
                  </h3>
                  <span className="text-xs font-semibold text-rose-600">
                    {group.joinRequests.length} yêu cầu chờ xử lý
                  </span>
                </div>

                {group.joinRequests.length === 0 ? (
                  <p className="text-xs text-slate-500">Chưa có yêu cầu tham gia mới nào.</p>
                ) : (
                  group.joinRequests.map((req) => (
                    <div
                      key={req.id}
                      className="rounded-2xl border border-slate-100 bg-[#FBF9F5] p-5 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={req.avatarUrl}
                            alt={req.userName}
                            className="h-11 w-11 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">{req.userName}</h4>
                            <p className="text-[11px] text-slate-500">{req.experienceInfo}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRequest(req);
                              setActiveModal('approve');
                            }}
                            className="rounded-full bg-[#0D3B2E] px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-950 transition-colors"
                          >
                            Duyệt
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRequest(req);
                              setActiveModal('reject');
                            }}
                            className="rounded-full border border-slate-300 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                          >
                            Từ chối
                          </button>
                        </div>
                      </div>

                      <p className="rounded-xl bg-white p-3 text-xs italic text-slate-600 border border-slate-100">
                        {req.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Box 3: Lộ trình dự kiến */}
            <div className="rounded-[32px] bg-[#F4EFE6]/60 p-6 md:p-8 border border-[#EBE3D5] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-base font-extrabold text-slate-900">
                  <MapPin className="h-4 w-4 text-[#0D3B2E]" />
                  <span>Lộ trình dự kiến</span>
                </h3>
              </div>

              {/* Route Map Preview Card */}
              <div className="relative overflow-hidden rounded-2xl bg-white p-4 border border-slate-200/70 shadow-2xs">
                <div className="absolute top-4 left-4 z-10 rounded-xl bg-white/90 backdrop-blur-md px-3.5 py-2 border border-slate-200 shadow-xs">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Điểm dừng tiếp theo
                  </p>
                  <p className="text-xs font-extrabold text-slate-900 mt-0.5">
                    Trạm kiểm lâm số 1 (2.1km)
                  </p>
                </div>

                <div className="relative h-48 w-full overflow-hidden rounded-xl bg-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80"
                    alt="Map Trail Preview"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-900/10" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Chat Nhóm & Yêu cầu chuyến đi */}
          <div className="lg:col-span-4 space-y-6">
            {/* Card 1: Chat Nhóm (Đen lá đậm) */}
            <div className="rounded-[32px] bg-[#1B362D] p-7 text-white shadow-md space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-extrabold text-white">Chat Nhóm</h3>
                  <p className="text-xs text-slate-300 mt-1">3 tin nhắn mới từ Linh Chi</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#26483D] text-white">
                  <MessageSquare className="h-5 w-5" />
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate(PATHS.CHAT)}
                className="w-full rounded-full bg-white py-3.5 text-xs font-bold text-slate-900 transition-all hover:bg-slate-100 active:scale-[0.99] shadow-xs"
              >
                Nhắn tin cho nhóm
              </button>
            </div>

            {/* Card 2: Yêu cầu chuyến đi (Checklist) */}
            <div className="rounded-[32px] bg-white p-7 border border-slate-200/80 shadow-2xs space-y-5">
              <h3 className="text-base font-extrabold text-slate-900">Yêu cầu chuyến đi</h3>

              <div className="space-y-4">
                {checklist.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleChecklistItem(item.id)}
                    className="flex items-start gap-3 w-full text-left group"
                  >
                    <div className="mt-0.5 shrink-0">
                      {item.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-slate-800 fill-slate-800 stroke-white" />
                      ) : (
                        <Circle className="h-5 w-5 text-slate-300 group-hover:text-slate-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{item.label}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{item.detail}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Card 3: Nút tác vụ nhóm phụ thuộc vào vai trò */}
            <div className="space-y-3 pt-2 text-center">
              {currentUserRole === 'leader' && (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setActiveModal('hide')}
                    className="w-full rounded-full border border-amber-300 bg-white py-3.5 text-xs font-bold text-amber-700 hover:bg-amber-50 transition-colors shadow-2xs flex items-center justify-center gap-2"
                  >
                    {group.isHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    <span>{group.isHidden ? 'Hiện nhóm ghép' : 'Ẩn nhóm ghép'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveModal('dissolve')}
                    className="w-full rounded-full border border-rose-600 bg-white py-3.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors shadow-2xs flex items-center justify-center gap-2"
                  >
                    <ShieldAlert className="h-4 w-4" />
                    <span>Giải tán nhóm này</span>
                  </button>
                  <p className="text-[10px] text-slate-400">
                    Lưu ý: Chỉ Trưởng nhóm mới có quyền giải tán hoặc ẩn nhóm.
                  </p>
                </div>
              )}

              {currentUserRole === 'member' && (
                <div>
                  <button
                    type="button"
                    onClick={() => setActiveModal('leave')}
                    className="w-full rounded-full border border-rose-600 bg-white py-3.5 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-50 shadow-2xs flex items-center justify-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Rời khỏi nhóm</span>
                  </button>
                  <p className="text-[10px] text-slate-400 mt-2">
                    Lưu ý: Rời nhóm trước 48h khởi hành để được hoàn cọc.
                  </p>
                </div>
              )}

              {currentUserRole === 'guest' && (
                <button
                  type="button"
                  onClick={() => navigate(PATHS.GROUPS_JOIN)}
                  className="w-full rounded-full bg-[#0D3B2E] py-3.5 text-xs font-bold text-white transition-all hover:bg-emerald-950 shadow-md flex items-center justify-center gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Gửi yêu cầu tham gia</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODALS SECTION */}
      {/* ========================================================================= */}

      {/* Dissolve Group Modal (Giữ nguyên thiết kế chuẩn) */}
      {activeModal === 'dissolve' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-[32px] bg-[#FAF8F5] p-8 text-center shadow-2xl border border-slate-100 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <AlertTriangle className="h-8 w-8 stroke-[2.2]" />
            </div>

            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                Giải tán nhóm này?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed px-4">
                Khi giải tán, nhóm sẽ bị xóa vĩnh viễn và tất cả thành viên sẽ nhận được thông báo.
                Bạn có chắc chắn không?
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleConfirmDissolveGroup}
                className="w-full rounded-full bg-[#07241A] py-3.5 text-xs font-bold text-white transition-all hover:bg-emerald-950 active:scale-[0.99] shadow-sm"
              >
                Xác nhận giải tán
              </button>

              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-full rounded-full border border-slate-400/80 bg-transparent py-3.5 text-xs font-bold text-slate-800 transition-colors hover:bg-slate-200/50 active:scale-[0.99]"
              >
                Quay lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Group Modal */}
      {activeModal === 'leave' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-[32px] bg-[#FAF8F5] p-8 text-center shadow-2xl border border-slate-100 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <LogOut className="h-7 w-7 stroke-[2.2]" />
            </div>

            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                Rời khỏi nhóm ghép?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed px-4">
                Bạn có chắc chắn muốn rời khỏi nhóm ghép này? Vị trí của bạn sẽ nhường lại cho
                Trekker khác.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleConfirmLeaveGroup}
                className="w-full rounded-full bg-rose-600 py-3.5 text-xs font-bold text-white transition-all hover:bg-rose-700 active:scale-[0.99] shadow-sm"
              >
                Xác nhận rời nhóm
              </button>

              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-full rounded-full border border-slate-400/80 bg-transparent py-3.5 text-xs font-bold text-slate-800 transition-colors hover:bg-slate-200/50 active:scale-[0.99]"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {activeModal === 'reject' && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-[32px] bg-[#FAF8F5] p-8 text-center shadow-2xl border border-slate-100 space-y-6 animate-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <ShieldAlert className="h-7 w-7 stroke-[2.2]" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">Từ chối yêu cầu tham gia?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Từ chối yêu cầu tham gia nhóm của{' '}
                <span className="font-bold text-slate-900">{selectedRequest.userName}</span>.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleConfirmReject}
                className="w-full rounded-full bg-[#07241A] py-3.5 text-xs font-bold text-white hover:bg-emerald-950 transition-all"
              >
                Xác nhận từ chối
              </button>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-full rounded-full border border-slate-400/80 bg-transparent py-3.5 text-xs font-bold text-slate-800 hover:bg-slate-200/50"
              >
                Quay lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {activeModal === 'approve' && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-[32px] bg-[#FAF8F5] p-8 text-center shadow-2xl border border-slate-100 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <UserCheck className="h-7 w-7 stroke-[2.2]" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">Duyệt thành viên vào nhóm?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Đồng ý cho{' '}
                <span className="font-bold text-slate-900">{selectedRequest.userName}</span> gia
                nhập nhóm ghép này?
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleConfirmApprove}
                className="w-full rounded-full bg-[#07241A] py-3.5 text-xs font-bold text-white hover:bg-emerald-950 transition-all"
              >
                Chấp nhận cho vào nhóm
              </button>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-full rounded-full border border-slate-400/80 bg-transparent py-3.5 text-xs font-bold text-slate-800 hover:bg-slate-200/50"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hide Modal */}
      {activeModal === 'hide' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-[32px] bg-[#FAF8F5] p-8 text-center shadow-2xl border border-slate-100 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              {group.isHidden ? <Eye className="h-7 w-7" /> : <EyeOff className="h-7 w-7" />}
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">
                {group.isHidden ? 'Hiện nhóm ghép?' : 'Ẩn nhóm ghép này?'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {group.isHidden
                  ? 'Nhóm ghép sẽ được hiển thị công khai để các Trekker khác tìm thấy và xin gia nhập.'
                  : 'Khi ẩn nhóm, các Trekker khác sẽ không thể tìm thấy nhóm trên danh sách công khai nữa.'}
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleToggleHideGroup}
                className="w-full rounded-full bg-[#07241A] py-3.5 text-xs font-bold text-white hover:bg-emerald-950 transition-all"
              >
                {group.isHidden ? 'Xác nhận hiện nhóm' : 'Xác nhận ẩn nhóm'}
              </button>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-full rounded-full border border-slate-400/80 bg-transparent py-3.5 text-xs font-bold text-slate-800 hover:bg-slate-200/50"
              >
                Quay lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
