import {
  Award,
  Calendar,
  CheckCircle2,
  CheckSquare,
  Clock,
  FileText,
  Footprints,
  Image,
  MapPin,
  Megaphone,
  MessageSquare,
  Navigation,
  Pin,
  PlusCircle,
  Radio,
  RefreshCw,
  Send,
  ShieldAlert,
  ThumbsUp,
  UserPlus,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { workspaceNav } from '../../data/groupMatchingMocks';
import type { WorkspaceSubTab } from '../../types/groupMatchingTypes';
import { BudgetWorkspace } from './BudgetWorkspace';
import { EquipmentWorkspace } from './EquipmentWorkspace';
import { ItineraryWorkspace } from './ItineraryWorkspace';
import { MembersWorkspace } from './MembersWorkspace';
import { TripAlbumWorkspace } from './TripAlbumWorkspace';

export type GroupLifecyclePhase = 1 | 2 | 3 | 4 | 5;

interface FeedPost {
  id: string;
  author: string;
  role: string;
  avatar: string;
  time: string;
  content: string;
  isAnnouncement?: boolean;
  likes: number;
  commentsCount: number;
  badge?: string;
  image?: string;
}

interface TrailCheckpoint {
  id: string;
  name: string;
  time: string;
  location: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'UPCOMING';
  checkedInBy?: string;
  checkedInTime?: string;
}

const initialFeedPosts: FeedPost[] = [
  {
    id: 'post-live-1',
    author: 'Hoàng Nam',
    role: 'Trưởng nhóm',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    time: '15 phút trước (Trên chặng 2)',
    isAnnouncement: true,
    badge: 'Cập nhật từ Trưởng đoàn',
    content:
      'CẢNH BÁO CHẶNG LÈO LAO: Đoạn dốc tiếp theo sương mù bắt đầu xuống dày. Mọi người chú ý bám sát Porter A Sìn, bật đèn pin trán và đi theo hàng một!',
    likes: 4,
    commentsCount: 2,
  },
  {
    id: 'post-1',
    author: 'Hoàng Nam',
    role: 'Trưởng nhóm',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    time: 'Hôm qua lúc 09:15',
    isAnnouncement: true,
    badge: 'Thông báo chính',
    content:
      'THÔNG BÁO QUAN TRỌNG: Lịch tập trung khởi hành đi Lảo Thẩn đã được ấn định vào 21:30 tối thứ Sáu 18/10 tại Bến xe Mỹ Đình. Mọi người vui lòng có mặt trước 20 phút để xếp hành lý lên xe giường nằm!',
    likes: 4,
    commentsCount: 3,
  },
  {
    id: 'post-2',
    author: 'Minh Anh',
    role: 'Thủ quỹ · Co-Leader',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    time: 'Hôm qua lúc 18:40',
    content:
      'Đã hoàn tất chuyển cọc xe giường nằm khứ hồi Hà Nội - Y Tý cho cả đoàn (4 người x 500k = 2.000.000đ). Hóa đơn cọc đã được lưu trong tab Ngân sách nhóm.',
    likes: 3,
    commentsCount: 2,
  },
  {
    id: 'post-3',
    author: 'Việt Dũng',
    role: 'Thành viên',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    time: 'Hôm qua lúc 14:10',
    content:
      'Mình đã chuẩn bị sẵn 1 bộ túi y tế du lịch (băng gạc, thuốc xịt giảm đau, cồn đỏ, viên điện giải). Lều 3 người mình cũng sẽ mang theo nhé!',
    likes: 2,
    commentsCount: 5,
  },
];

const initialCheckpoints: TrailCheckpoint[] = [
  {
    id: 'cp-1',
    name: 'Bến xe Mỹ Đình (Tập kết khởi hành)',
    time: '21:30 - 18/10/2026',
    location: 'Hà Nội',
    status: 'COMPLETED',
    checkedInBy: 'Hoàng Nam (Leader)',
    checkedInTime: '21:25 - 18/10',
  },
  {
    id: 'cp-2',
    name: 'Bến xe Y Tý / Trạm Tôn (Bắt đầu trekking)',
    time: '05:30 - 19/10/2026',
    location: 'Y Tý, Bát Xát',
    status: 'COMPLETED',
    checkedInBy: 'Minh Anh (Co-Leader)',
    checkedInTime: '05:40 - 19/10',
  },
  {
    id: 'cp-3',
    name: 'Lán nghỉ Lèo Lao (Cắm trại & Ăn trưa)',
    time: '12:30 - 19/10/2026',
    location: 'Độ cao 2.200m',
    status: 'IN_PROGRESS',
  },
  {
    id: 'cp-4',
    name: 'Chinh phục Đỉnh Lảo Thẩn (Săn mây)',
    time: '06:00 - 20/10/2026',
    location: 'Đỉnh 2.860m',
    status: 'UPCOMING',
  },
];

const phaseDetails: Record<
  GroupLifecyclePhase,
  { label: string; sub: string; badgeBg: string; textClr: string; icon: any }
> = {
  1: {
    label: 'Giai đoạn 1: Bản nháp',
    sub: 'Khởi tạo nhóm & soạn thảo lịch trình',
    badgeBg: 'bg-slate-500/10 border-slate-500/30',
    textClr: 'text-slate-700 dark:text-slate-300',
    icon: FileText,
  },
  2: {
    label: 'Giai đoạn 2: Đang tuyển',
    sub: 'Công khai tuyển thành viên trên Marketplace',
    badgeBg: 'bg-blue-500/10 border-blue-500/30',
    textClr: 'text-blue-700 dark:text-blue-400',
    icon: UserPlus,
  },
  3: {
    label: 'Giai đoạn 3: Sẵn sàng',
    sub: 'Chốt danh sách & đóng cọc ngân sách',
    badgeBg: 'bg-emerald-500/10 border-emerald-500/30',
    textClr: 'text-emerald-700 dark:text-emerald-400',
    icon: CheckCircle2,
  },
  4: {
    label: 'Giai đoạn 4: Đang đi (On-Going)',
    sub: 'Đoàn đang di chuyển thực tế trên cung trek',
    badgeBg: 'bg-amber-500/15 border-amber-500/40 animate-pulse',
    textClr: 'text-amber-800 dark:text-amber-300 font-extrabold',
    icon: Footprints,
  },
  5: {
    label: 'Giai đoạn 5: Hoàn tất',
    sub: 'Đánh giá đồng đội (Peer Review) & Quyết toán',
    badgeBg: 'bg-purple-500/10 border-purple-500/30',
    textClr: 'text-purple-700 dark:text-purple-300',
    icon: Award,
  },
};

export function WorkspacePreview() {
  const [currentPhase, setCurrentPhase] = useState<GroupLifecyclePhase>(4); // Default to Phase 4 for showcase
  const [activeTab, setActiveTab] = useState<WorkspaceSubTab>('overview');
  const [successionReason, setSuccessionReason] = useState<string>('');
  const [hasNominated, setHasNominated] = useState<boolean>(false);

  // Phase 4 Check-in state
  const [checkpoints, setCheckpoints] = useState<TrailCheckpoint[]>(initialCheckpoints);
  const [isCheckinSuccessAlert, setIsCheckinSuccessAlert] = useState<boolean>(false);

  // Quick Trail Expense Logging state
  const [trailExpenseTitle, setTrailExpenseTitle] = useState('');
  const [trailExpenseAmount, setTrailExpenseAmount] = useState('');
  const [trailExpenseLogSuccess, setTrailExpenseLogSuccess] = useState(false);

  // Feed State
  const [posts, setPosts] = useState<FeedPost[]>(initialFeedPosts);
  const [newPostText, setNewPostText] = useState<string>('');

  const currentPhaseInfo = phaseDetails[currentPhase];

  const handleCheckinCurrentMilestone = (id: string) => {
    setCheckpoints((prev) =>
      prev.map((cp) => {
        if (cp.id === id) {
          return {
            ...cp,
            status: 'COMPLETED',
            checkedInBy: 'Bạn (Leader)',
            checkedInTime: 'Vừa xong (12:35)',
          };
        }
        if (cp.id === 'cp-4') {
          return { ...cp, status: 'IN_PROGRESS' };
        }
        return cp;
      })
    );
    setIsCheckinSuccessAlert(true);
    setTimeout(() => setIsCheckinSuccessAlert(false), 3000);
  };

  const handleAddTrailExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trailExpenseTitle.trim() || !trailExpenseAmount) return;
    setTrailExpenseLogSuccess(true);
    setTimeout(() => {
      setTrailExpenseTitle('');
      setTrailExpenseAmount('');
      setTrailExpenseLogSuccess(false);
    }, 2500);
  };

  const handleCreatePost = () => {
    if (!newPostText.trim()) return;
    const newPost: FeedPost = {
      id: `post-${Date.now()}`,
      author: 'Bạn (Thành viên)',
      role: 'Thành viên chính thức',
      avatar:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      time: 'Vừa xong',
      content: newPostText,
      likes: 0,
      commentsCount: 0,
    };
    setPosts([newPost, ...posts]);
    setNewPostText('');
  };

  const handleToggleLike = (id: string) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p)));
  };

  return (
    <div className="space-y-6">
      {/* 1. INTERACTIVE LIFECYCLE PHASE SWITCHER BAR */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Trình điều khiển Vòng đời Nhóm (5 Giai đoạn C2C)
            </span>
            <h3 className="text-base font-extrabold text-foreground mt-0.5">
              Chuyển đổi trạng thái trải nghiệm nhóm
            </h3>
          </div>
          <span className="text-xs font-semibold text-muted-foreground bg-muted px-3 py-1 rounded-full border border-border self-start sm:self-auto">
            Nhóm: Săn mây Lảo Thẩn (4/7 thành viên)
          </span>
        </div>

        {/* Phase selector buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
          {([1, 2, 3, 4, 5] as GroupLifecyclePhase[]).map((phaseNum) => {
            const p = phaseDetails[phaseNum];
            const Icon = p.icon;
            const isActive = currentPhase === phaseNum;
            return (
              <button
                key={phaseNum}
                type="button"
                onClick={() => setCurrentPhase(phaseNum)}
                className={cn(
                  'flex flex-col items-start p-3 rounded-xl border text-left transition cursor-pointer relative overflow-hidden',
                  isActive
                    ? 'border-primary bg-primary/10 shadow-xs ring-1 ring-primary'
                    : 'border-border bg-background hover:bg-muted/50 text-muted-foreground'
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={cn(
                      'flex h-6 w-6 items-center justify-center rounded-lg text-xs font-bold',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {phaseNum}
                  </span>
                  <Icon
                    className={cn(
                      'h-4 w-4',
                      isActive ? 'text-primary' : 'text-muted-foreground/60'
                    )}
                  />
                </div>
                <span
                  className={cn(
                    'text-xs font-extrabold mt-2 block',
                    isActive ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {p.label.split(':')[1] || p.label}
                </span>
                <span className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                  {p.sub}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. PHASE STATUS BANNER DISPLAY */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'p-3 rounded-xl border flex items-center justify-center',
              currentPhaseInfo.badgeBg
            )}
          >
            <currentPhaseInfo.icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'px-2.5 py-0.5 text-xs font-extrabold rounded-full border',
                  currentPhaseInfo.badgeBg,
                  currentPhaseInfo.textClr
                )}
              >
                {currentPhaseInfo.label}
              </span>
              {currentPhase === 4 && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  <Radio className="h-3 w-3 animate-pulse" /> Live Beacon Active
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{currentPhaseInfo.sub}</p>
          </div>
        </div>

        {/* Phase 4 Quick Action SOS button */}
        {currentPhase === 4 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                alert(
                  'Đã kích hoạt tín hiệu SOS khẩn cấp! Thông báo vị trí GPS đã gửi tới toàn bộ thành viên và Đội kiểm lâm Y Tý.'
                )
              }
              className="rounded-xl bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-xs font-extrabold flex items-center gap-1.5 shadow-md transition cursor-pointer"
            >
              <ShieldAlert className="h-4 w-4" />
              <span>Phát Tín Hiệu SOS Khẩn Cấp</span>
            </button>
          </div>
        )}
      </div>

      {/* Internal Sub-navigation Bar */}
      <div className="flex overflow-x-auto rounded-2xl border border-border bg-card p-1.5 shadow-xs scrollbar-none">
        {workspaceNav.map((tab) => {
          const Icon = tab.icon;
          const isMembersTab = tab.id === 'members';

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition whitespace-nowrap',
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}

              {isMembersTab && currentPhase === 5 && (
                <span className="inline-flex items-center rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-black text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  Review (3/4)
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* SUB-TAB 1: TỔNG QUAN WORKSPACE */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Post-Trip Review Prompt ONLY IF PHASE 5 */}
          {currentPhase === 5 && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <p className="text-muted-foreground font-medium">
                  Chuyến đi đã hoàn tất. Bạn có{' '}
                  <strong className="text-foreground font-extrabold">3/4 đồng đội</strong> chưa chấm
                  điểm Uy Tín (Trust Score).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('members')}
                className="rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-1.5 font-bold transition shadow-xs cursor-pointer text-[11px]"
              >
                Đánh giá ngay
              </button>
            </div>
          )}

          {/* GIAI ĐOẠN 4 SPECIFIC CONTROL DASHBOARD */}
          {currentPhase === 4 && (
            <div className="space-y-5">
              {/* Alert success banner if checked-in */}
              {isCheckinSuccessAlert && (
                <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Đã ghi nhận Check-in thành công chặng di chuyển! Nhật ký hành trình đã được cập
                  nhật.
                </div>
              )}

              {/* 4.1 LIVE TRAIL TRACKING & CHECKPOINTS WIDGET */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <Navigation className="h-5 w-5 text-primary" />
                    <div>
                      <h4 className="text-sm font-extrabold text-foreground">
                        Nhật Ký Check-in & Tiến Độ Chặng Trekking Real-time
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Theo dõi tọa độ thực tế & điểm danh các trạm dừng chân trên cung Lảo Thẩn
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-foreground bg-muted px-2.5 py-1 rounded-lg border border-border">
                      Tọa độ: 22.5831° N, 103.6214° E
                    </span>
                  </div>
                </div>

                {/* Timeline Progress Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
                  {checkpoints.map((cp, idx) => (
                    <div
                      key={cp.id}
                      className={cn(
                        'rounded-xl border p-3.5 space-y-2 relative text-xs transition',
                        cp.status === 'COMPLETED'
                          ? 'border-emerald-500/30 bg-emerald-500/5'
                          : cp.status === 'IN_PROGRESS'
                            ? 'border-amber-500 bg-amber-500/10 shadow-xs ring-1 ring-amber-500/50'
                            : 'border-border bg-background opacity-75'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-[11px] text-muted-foreground">
                          Chặng {idx + 1}
                        </span>
                        {cp.status === 'COMPLETED' ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                            <CheckSquare className="h-3 w-3" /> Xong
                          </span>
                        ) : cp.status === 'IN_PROGRESS' ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-500/20 px-2 py-0.5 rounded-md animate-pulse">
                            <Radio className="h-3 w-3" /> Đang ở đây
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                            Sắp tới
                          </span>
                        )}
                      </div>

                      <strong className="font-bold text-foreground block text-xs line-clamp-1">
                        {cp.name}
                      </strong>

                      <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {cp.time}
                      </p>

                      {cp.checkedInBy && (
                        <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                          Check-in bởi {cp.checkedInBy} ({cp.checkedInTime})
                        </p>
                      )}

                      {cp.status === 'IN_PROGRESS' && (
                        <button
                          type="button"
                          onClick={() => handleCheckinCurrentMilestone(cp.id)}
                          className="w-full mt-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-1.5 text-xs transition shadow-2xs cursor-pointer"
                        >
                          Xác nhận Check-in Chặng Này
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 4.2 QUICK LOG EXPENSE ON TRAIL */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-2.5">
                  <div className="flex items-center gap-2">
                    <PlusCircle className="h-4 w-4 text-emerald-600" />
                    <h4 className="text-xs font-extrabold text-foreground uppercase tracking-wider">
                      Ghi nhanh chi phí phát sinh trên đường đi
                    </h4>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    Tự động đồng bộ vào Bảng phân chia ngân sách nhóm (Budget Workspace)
                  </span>
                </div>

                <form
                  onSubmit={handleAddTrailExpense}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs"
                >
                  <div className="sm:col-span-6">
                    <input
                      type="text"
                      value={trailExpenseTitle}
                      onChange={(e) => setTrailExpenseTitle(e.target.value)}
                      placeholder="Tên khoản chi (ví dụ: Nước uống dọc đường, Thuê Porter...)"
                      className="w-full rounded-xl border border-input bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <input
                      type="number"
                      value={trailExpenseAmount}
                      onChange={(e) => setTrailExpenseAmount(e.target.value)}
                      placeholder="Số tiền (VND)"
                      className="w-full rounded-xl border border-input bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      disabled={!trailExpenseTitle || !trailExpenseAmount}
                      className="w-full rounded-xl bg-primary text-primary-foreground font-bold p-2.5 text-xs hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
                    >
                      + Ghi nhận
                    </button>
                  </div>
                </form>

                {trailExpenseLogSuccess && (
                  <p className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Đã thêm khoản chi vào quỹ nhóm thành
                    công!
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT / MAIN COLUMN (8 cols) - BẢNG TIN CÁC THÔNG BÁO VÀ CHIA SẺ THÀNH VIÊN */}
            <div className="lg:col-span-8 space-y-5">
              {/* Box Đăng bài / Chia sẻ thảo luận */}
              <div className="rounded-2xl border border-border bg-card p-4 shadow-xs space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80"
                    alt="My Avatar"
                    className="h-9 w-9 rounded-full object-cover ring-2 ring-primary/20 shrink-0"
                  />
                  <textarea
                    rows={2}
                    value={newPostText}
                    onChange={(e) => setNewPostText(e.target.value)}
                    placeholder={
                      currentPhase === 4
                        ? 'Đăng khoảnh khắc, hình ảnh hoặc báo cáo tình hình trên đường trek...'
                        : 'Chia sẻ thông tin, thắc mắc hoặc cập nhật đồ dùng với nhóm...'
                    }
                    className="w-full resize-none rounded-xl border border-input bg-background p-3 text-xs outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex items-center justify-between border-t border-border pt-3">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-muted-foreground hover:bg-muted transition cursor-pointer"
                  >
                    <Image className="h-4 w-4 text-emerald-600" />
                    <span>Đính kèm hình ảnh</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCreatePost}
                    disabled={!newPostText.trim()}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-extrabold text-primary-foreground shadow-xs hover:bg-primary/90 transition disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Đăng bài
                  </button>
                </div>
              </div>

              {/* Danh sách Bảng tin (Feed Posts) */}
              <div className="space-y-4">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className={cn(
                      'rounded-2xl border bg-card p-5 shadow-xs space-y-3.5 transition',
                      post.isAnnouncement
                        ? 'border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-card to-card'
                        : 'border-border'
                    )}
                  >
                    {/* Post Author Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={post.avatar}
                          alt={post.author}
                          className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/20 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="font-extrabold text-xs text-foreground">
                              {post.author}
                            </strong>
                            <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                              {post.role}
                            </span>
                          </div>
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Clock className="h-3 w-3" /> {post.time}
                          </span>
                        </div>
                      </div>

                      {/* Announcement Badge */}
                      {post.isAnnouncement && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-[11px] font-extrabold text-amber-700 dark:text-amber-400 border border-amber-500/20">
                          <Pin className="h-3 w-3" /> {post.badge || 'Thông báo chính'}
                        </span>
                      )}
                    </div>

                    {/* Post Content */}
                    <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-line">
                      {post.content}
                    </p>

                    {/* Post Interaction Bar */}
                    <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                      <button
                        type="button"
                        onClick={() => handleToggleLike(post.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-semibold hover:bg-muted hover:text-primary transition cursor-pointer"
                      >
                        <ThumbsUp className="h-3.5 w-3.5 text-primary" />
                        <span>{post.likes} Yêu thích</span>
                      </button>

                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-semibold hover:bg-muted hover:text-foreground transition cursor-pointer"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>{post.commentsCount} Thảo luận</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT SIDEBAR (4 cols) - CÁC CARD TRẠNG THÁI & THÔNG TIN NHANH */}
            <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-36">
              {/* CARD 1: TRẠNG THÁI HIỆN TẠI THEO GIAI ĐOẠN */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <Megaphone className="h-4 w-4 text-primary" />
                    <h4 className="text-xs font-extrabold text-foreground uppercase tracking-wider">
                      Trạng thái hành trình
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    {currentPhase === 4 ? 'Đang trên cung' : 'Chuẩn bị'}
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  {currentPhase === 4 ? (
                    <>
                      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 space-y-1">
                        <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                          <Footprints className="h-4 w-4 text-amber-600" />
                          Vị trí: Lán Lèo Lao (2.200m)
                        </span>
                        <p className="text-muted-foreground text-[11px]">
                          Đoàn dừng ăn trưa & nghỉ ngơi 45 phút
                        </p>
                      </div>

                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 space-y-1">
                        <span className="font-bold text-emerald-700 flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                          Điểm danh thành viên
                        </span>
                        <p className="text-muted-foreground text-[11px]">
                          Đủ 4/4 thành viên an toàn
                        </p>
                      </div>

                      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 space-y-1">
                        <span className="font-bold text-blue-700 flex items-center gap-1.5">
                          <Radio className="h-3.5 w-3.5 shrink-0 text-blue-600" />
                          Liên lạc kiểm lâm
                        </span>
                        <p className="text-muted-foreground text-[11px]">
                          Porter A Sìn đã báo vị trí đoàn
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 space-y-1">
                        <span className="font-bold text-emerald-700 flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                          Danh sách thành viên
                        </span>
                        <p className="text-muted-foreground text-[11px]">
                          Đã chốt 4/7 vị trí chính thức
                        </p>
                      </div>

                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 space-y-1">
                        <span className="font-bold text-emerald-700 flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                          Vé xe giường nằm
                        </span>
                        <p className="text-muted-foreground text-[11px]">
                          Thủ quỹ đã đặt trước 4 vé khứ hồi
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* CARD 2: THÔNG TIN NHANH NHÓM */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
                <h4 className="text-xs font-extrabold text-foreground uppercase tracking-wider border-b border-border pb-3">
                  Thông tin nhanh nhóm
                </h4>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <span className="text-muted-foreground">Trưởng nhóm:</span>
                    <span className="font-bold text-foreground">Hoàng Nam</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <span className="text-muted-foreground">Thủ quỹ:</span>
                    <span className="font-bold text-foreground">Minh Anh</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <span className="text-muted-foreground">Quỹ hiện tại:</span>
                    <span className="font-bold text-emerald-600">4.360.000 đ</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-amber-600" />
                      Khung ngày:
                    </span>
                    <span className="font-bold text-foreground">18/10 – 20/10/2026</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                      Điểm tập trung:
                    </span>
                    <span className="font-bold text-foreground truncate max-w-[140px]">
                      Bến xe Mỹ Đình (21:30)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: ITINERARY & CHECKPOINTS */}
      {activeTab === 'itinerary' && <ItineraryWorkspace />}

      {/* SUB-TAB 3: BUDGET & C2C SPLIT BILL */}
      {activeTab === 'budget' && <BudgetWorkspace />}

      {/* SUB-TAB 4: MEMBERS */}
      {activeTab === 'members' && <MembersWorkspace />}

      {/* SUB-TAB 5: SHARED EQUIPMENT CHECKLIST */}
      {activeTab === 'equipment' && <EquipmentWorkspace />}

      {/* SUB-TAB 6: TRIP ALBUM & CONQUEST BADGES */}
      {activeTab === 'album' && <TripAlbumWorkspace />}

      {/* SUB-TAB 7: LEADER SUCCESSION PROTOCOL */}
      {activeTab === 'succession' && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-3 border-b border-amber-500/20 pb-4">
            <RefreshCw className="h-6 w-6 text-amber-600 shrink-0" />
            <div>
              <h4 className="text-base font-extrabold text-amber-900 dark:text-amber-300">
                Giao thức Chuyển giao Quyền Leader (Leader Succession Protocol)
              </h4>
              <p className="text-xs text-amber-800/80 dark:text-amber-400">
                Trường hợp Trưởng nhóm bận đột xuất hoặc không đủ thể lực, quyền điều hành nhóm sẽ
                được chuyển giao dân chủ.
              </p>
            </div>
          </div>

          {!hasNominated ? (
            <div className="space-y-4 text-xs">
              <div className="space-y-2">
                <label className="block font-bold text-amber-900 dark:text-amber-300">
                  Lý do xin chuyển giao quyền Leader:
                </label>
                <textarea
                  rows={3}
                  value={successionReason}
                  onChange={(e) => setSuccessionReason(e.target.value)}
                  placeholder="Ví dụ: Bận công tác đột xuất / Gặp chấn thương nhẹ không kịp phục hồi..."
                  className="w-full rounded-xl border border-amber-500/30 bg-background p-3 text-xs outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-bold text-amber-900 dark:text-amber-300">
                  Đề xuất Leader mới thay thế:
                </label>
                <select className="w-full rounded-xl border border-amber-500/30 bg-background p-3 text-xs outline-none">
                  <option value="minhanh">Minh Anh (Co-Leader hiện tại · Trust 4.7)</option>
                  <option value="vietdung">Việt Dũng (Thành viên · Trust 4.8)</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => setHasNominated(true)}
                className="w-full rounded-full bg-amber-600 px-6 py-3 font-extrabold text-white shadow-md hover:bg-amber-700 transition"
              >
                Kích hoạt Đề xuất Chuyển giao & Biểu quyết
              </button>
            </div>
          ) : (
            <div className="rounded-xl bg-background border border-amber-500/30 p-5 text-center space-y-3">
              <CheckCircle2 className="h-8 w-8 text-amber-600 mx-auto" />
              <h5 className="font-extrabold text-amber-900 dark:text-amber-300 text-sm">
                Đã gửi yêu cầu bỏ phiếu chuyển giao Leader!
              </h5>
              <p className="text-xs text-muted-foreground">
                Đề xuất bổ nhiệm <strong>Minh Anh</strong> làm Leader mới đã được gửi tới 3 thành
                viên còn lại để biểu quyết (yêu cầu &gt; 50% đồng ý).
              </p>
              <button
                type="button"
                onClick={() => setHasNominated(false)}
                className="text-xs font-bold text-amber-700 hover:underline"
              >
                Hủy đề xuất chuyển giao
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default WorkspacePreview;
