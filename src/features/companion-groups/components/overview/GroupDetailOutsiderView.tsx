import {
  Bookmark,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Compass,
  HeartPulse,
  MapPinned,
  MessageCircle,
  Mountain,
  Route,
  Share2,
  ShieldCheck,
  UserPlus,
  WalletCards,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { groupRecommendations } from '../../data/groupMatchingMocks';
import type {
  GroupMatchingReviewScenario,
  GroupRecommendation,
  PreviewView,
} from '../../types/groupMatchingTypes';

interface GroupDetailOutsiderViewProps {
  scenario?: GroupMatchingReviewScenario;
  onOpenJoinWizard: () => void;
  onOpenMatchDetails: (group: GroupRecommendation) => void;
  onOpenSos: () => void;
  onNavigateView?: (view: PreviewView) => void;
}

export function GroupDetailOutsiderView({
  scenario,
  onOpenJoinWizard,
  onOpenMatchDetails,
  onNavigateView,
  onOpenSos,
}: GroupDetailOutsiderViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'budget' | 'rules'>(
    'overview'
  );
  const [hasApplied, setHasApplied] = useState<boolean>(false);
  const [applicantMsg, setApplicantMsg] = useState<string>('');
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);

  const sampleGroup = groupRecommendations[0];
  const groupState = scenario?.groupState || 'RECRUITING';
  const actor = scenario?.actor || 'GUEST';
  const isOutsiderActor = actor === 'GUEST';

  // Dynamic Group Status Badge rendering based on scenario.groupState
  const getStatusBadge = () => {
    switch (groupState) {
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-500/90 backdrop-blur-xs px-3 py-1 text-xs font-extrabold text-white">
            📝 DỰ THẢO (Chưa công khai)
          </span>
        );
      case 'RECRUITING':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/90 backdrop-blur-xs px-3 py-1 text-xs font-extrabold text-white">
            <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
            ĐANG TUYỂN (4/8 Thành viên)
          </span>
        );
      case 'FULL':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/90 backdrop-blur-xs px-3 py-1 text-xs font-extrabold text-white">
            🔴 ĐÃ ĐỦ THÀNH VIÊN (8/8 - Mở Waitlist)
          </span>
        );
      case 'READY':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/90 backdrop-blur-xs px-3 py-1 text-xs font-extrabold text-white">
            🔵 SẴN SÀNG KHỞI HÀNH (Đã chốt)
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/90 backdrop-blur-xs px-3 py-1 text-xs font-extrabold text-white">
            🏔️ ĐANG TRONG CHUYẾN ĐI (Thực địa)
          </span>
        );
      case 'SETTLING':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/90 backdrop-blur-xs px-3 py-1 text-xs font-extrabold text-white">
            📊 ĐANG QUYẾT TOÁN QUỸ
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-700/90 backdrop-blur-xs px-3 py-1 text-xs font-extrabold text-white">
            🏁 ĐÃ HOÀN THÀNH CHUYẾN ĐI
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/90 backdrop-blur-xs px-3 py-1 text-xs font-extrabold text-white">
            ĐANG TUYỂN (4/8 Thành viên)
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Hero Cover Header */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-lg">
        <div className="relative h-64 sm:h-80 lg:h-96 w-full overflow-hidden bg-slate-900">
          <img
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80"
            alt="Hero Mountain"
            className="h-full w-full object-cover opacity-85 transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Top Floating Actions Bar */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-950/70 backdrop-blur-md px-3.5 py-1.5 text-xs font-bold text-white border border-white/20">
              <Mountain className="h-3.5 w-3.5 text-amber-400" />
              <span>
                Góc nhìn: {actor} · Vòng đời: {groupState}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={cn(
                  'inline-flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md border border-white/20 transition',
                  isBookmarked
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-950/70 text-white hover:bg-slate-900'
                )}
                title="Lưu chuyến đi"
              >
                <Bookmark className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-950/70 backdrop-blur-md text-white border border-white/20 hover:bg-slate-900 transition"
                title="Chia sẻ"
              >
                <Share2 className="h-4 w-4 text-emerald-400" />
              </button>
            </div>
          </div>

          {/* Bottom Hero Info */}
          <div className="absolute bottom-6 left-6 right-6 z-10 text-white space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {getStatusBadge()}
              <button
                type="button"
                onClick={() => onOpenMatchDetails(sampleGroup)}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary/90 backdrop-blur-xs px-3 py-1 text-xs font-extrabold text-white hover:bg-primary transition shadow-md"
              >
                Match {sampleGroup.match}% hợp cạ với bạn (Chi tiết)
              </button>
            </div>

            <h2 className="text-2xl font-black sm:text-3xl lg:text-4xl text-white tracking-tight drop-shadow-md">
              [Săn mây Tà Xùa] Chinh phục đỉnh cao & Đón bình minh 3N2Đ
            </h2>

            {/* Quick Metadata Pill Strip */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-white/90 font-semibold pt-1">
              <span className="inline-flex items-center gap-1.5">
                <MapPinned className="h-4 w-4 text-emerald-400" /> Tà Xùa, Bắc Yên, Sơn La
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 text-amber-400" /> 12/10 – 14/10/2026 (3N2Đ)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <HeartPulse className="h-4 w-4 text-rose-400" /> Độ khó: 3/5 (Trung bình)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CircleDollarSign className="h-4 w-4 text-emerald-400" /> Ngân sách: ~2.180.000
                đ/người
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* LEFT COLUMN */}
        <div className="space-y-6 lg:col-span-8">
          {/* Sub-Tab Bar */}
          <div className="flex overflow-x-auto rounded-2xl border border-border bg-card p-1.5 shadow-xs scrollbar-none">
            {[
              { id: 'overview', label: 'Tổng quan & Highlight', icon: Compass },
              { id: 'itinerary', label: 'Lộ trình 3N2Đ', icon: Route },
              { id: 'budget', label: 'Dự toán C2C (Ưóc tính)', icon: WalletCards },
              { id: 'rules', label: 'Cam kết & An toàn', icon: ShieldCheck },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() =>
                    setActiveTab(tab.id as 'overview' | 'itinerary' | 'budget' | 'rules')
                  }
                  className={cn(
                    'flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition whitespace-nowrap',
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={sampleGroup.leader.avatar}
                      alt={sampleGroup.leader.name}
                      className="h-14 w-14 rounded-full object-cover ring-2 ring-primary/20"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-extrabold text-foreground">
                          {sampleGroup.leader.name}
                        </h3>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                          <ShieldCheck className="h-3 w-3" /> Đã xác minh KYC
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Trưởng nhóm khởi xướng (Group Leader)
                      </p>
                      <div className="mt-1 flex items-center gap-3 text-xs">
                        <span className="font-bold text-amber-600">
                          ⭐ {sampleGroup.leader.trustScore} / 5.0 Trust Score
                        </span>
                        <span className="text-muted-foreground">
                          • {sampleGroup.leader.trips} chuyến an toàn
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="min-h-9 rounded-full border border-border px-3.5 text-xs font-bold hover:bg-muted"
                    >
                      <MessageCircle className="h-3.5 w-3.5 inline mr-1" /> Nhắn tin Leader
                    </button>
                  </div>
                </div>

                <p className="text-xs leading-relaxed text-muted-foreground">
                  "Chào các bạn! Mình có kinh nghiệm leo núi 4 năm, đã từng dẫn 12 đoàn Tà Xùa, Lảo
                  Thẩn và Fansipan. Phong cách của nhóm mình là đi thong thả, ưu tiên tuyệt đối cho
                  an toàn, giúp các bạn thành viên chụp ảnh săn mây và chia sẻ chi phí theo đúng hóa
                  đơn thực tế."
                </p>
              </div>

              {/* Match Breakdown */}
              <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
                    <Compass className="h-5 w-5 shrink-0" />
                    <h4 className="text-sm font-extrabold">Vì sao bạn hợp cạ 92% với nhóm này?</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenMatchDetails(sampleGroup)}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    Xem chi tiết thuật toán &rarr;
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="rounded-2xl border border-emerald-500/20 bg-background/80 p-3 space-y-1">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                      ✓ Khung ngày tự do
                    </span>
                    <p className="text-muted-foreground">
                      Khớp 100% khoảng ngày rảnh của bạn (12-14/10)
                    </p>
                  </div>
                  <div className="rounded-2xl border border-emerald-500/20 bg-background/80 p-3 space-y-1">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                      ✓ Thể lực phù hợp
                    </span>
                    <p className="text-muted-foreground">Yêu cầu Thể lực Khá tốt (Đã xác minh)</p>
                  </div>
                  <div className="rounded-2xl border border-emerald-500/20 bg-background/80 p-3 space-y-1">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                      ✓ Ngân sách tương đồng
                    </span>
                    <p className="text-muted-foreground">
                      Chi phí dự kiến ~2.18M nằm trong khoảng chọn
                    </p>
                  </div>
                  <div className="rounded-2xl border border-emerald-500/20 bg-background/80 p-3 space-y-1">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                      ★ Kỹ năng nhóm cần
                    </span>
                    <p className="text-muted-foreground">
                      Nhóm cần người biết Sơ cứu/Bản đồ (Khớp!)
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-4">
                <h3 className="text-base font-extrabold text-foreground">
                  Giới thiệu chi tiết hành trình
                </h3>
                <div className="space-y-3 text-xs leading-6 text-muted-foreground">
                  <p>
                    Tà Xùa nằm ở ranh giới tự nhiên giữa hai tỉnh Sơn La và Yên Bái, được ví như
                    thiên đường biển mây của vùng Tây Bắc. Cung đường trekking này có mỏm đá "Sống
                    lưng khủng long" hùng vĩ.
                  </p>
                  <p>
                    Chuyến đi kéo dài 3 ngày 2 đêm được thiết kế theo hình thức{' '}
                    <strong>C2C ghép nhóm tự túc</strong>. Thành viên cùng phân công nhiệm vụ chuẩn
                    bị đồ dùng (Checklist) và chia sẻ chi phí minh bạch.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ITINERARY */}
          {activeTab === 'itinerary' && (
            <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-6">
              <h3 className="text-base font-extrabold text-foreground border-b border-border pb-3">
                Lộ trình Trekking 3 Ngày 2 Đêm
              </h3>
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border text-xs text-muted-foreground">
                <div>
                  <strong className="block font-bold text-foreground">
                    Ngày 1: Hà Nội ➔ Bắc Yên ➔ Chân núi Tà Xùa (Nghỉ lán 2.200m)
                  </strong>
                  <p className="mt-1">
                    Tập trung đêm tại Mỹ Đình, di chuyển xe giường nằm, xuất phát trek lúc 7h30
                    sáng.
                  </p>
                </div>
                <div>
                  <strong className="block font-bold text-foreground">
                    Ngày 2: Lán 2.200m ➔ Sống lưng khủng long ➔ Săn mây hoàng hôn
                  </strong>
                  <p className="mt-1">
                    Đón bình minh rực rỡ, vượt mỏm đá Sống lưng khủng long, chụp ảnh lưu niệm nhóm.
                  </p>
                </div>
                <div>
                  <strong className="block font-bold text-foreground">
                    Ngày 3: Đỉnh mây ➔ Downhill chân núi ➔ Xe về Hà Nội
                  </strong>
                  <p className="mt-1">
                    Thu dọn hành lý theo nguyên tắc Leave No Trace, ăn trưa lẩu mừng hoàn thành và
                    lên xe về.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BUDGET */}
          {activeTab === 'budget' && (
            <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-base font-extrabold text-foreground">
                  Dự toán Chi phí C2C Chia đều
                </h3>
                <span className="text-lg font-black text-emerald-600">~2.180.000 đ / người</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-3 rounded-xl bg-background border border-border">
                  <span>Xe giường nằm 2 chiều</span>
                  <strong>550.000 đ</strong>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-background border border-border">
                  <span>Thuê lán nghỉ 2 đêm + Phí bảo tồn</span>
                  <strong>380.000 đ</strong>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-background border border-border">
                  <span>Thực phẩm & BBQ nướng</span>
                  <strong>650.000 đ</strong>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-background border border-border">
                  <span>Chi phí hướng dẫn địa hình chia 8 người</span>
                  <strong>400.000 đ</strong>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: RULES */}
          {activeTab === 'rules' && (
            <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-4 text-xs">
              <h3 className="text-base font-extrabold text-foreground border-b border-border pb-3">
                Cam kết An toàn & Nguyên tắc Đồng hành C2C
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-background border border-border space-y-1">
                  <strong className="font-bold text-foreground block">
                    1. Tuân thủ kỷ luật nhóm
                  </strong>
                  <p className="text-muted-foreground">
                    Luôn giữ khoảng cách an toàn, nghe hướng dẫn Leader & không tự tách đoàn.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-background border border-border space-y-1">
                  <strong className="font-bold text-foreground block">
                    2. Nguyên tắc Leave No Trace
                  </strong>
                  <p className="text-muted-foreground">
                    Mang toàn bộ rác cá nhân xuống núi, giữ gìn cảnh quan thiên nhiên nguyên sơ.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN - STICKY ACTION CARD */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-36">
          <div className="rounded-3xl border border-primary/30 bg-card p-6 shadow-xl space-y-5">
            <div className="border-b border-border pb-4">
              <span className="text-[11px] font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                Ứng tuyển tham gia chuyến đi
              </span>
              <div className="mt-1 flex items-baseline justify-between">
                <h3 className="text-2xl font-black text-foreground">2.180.000 đ</h3>
                <span className="text-xs font-bold text-muted-foreground">
                  / người (Ước tính C2C)
                </span>
              </div>
            </div>

            {/* CTA Section — rẽ nhánh theo actor trước, groupState chỉ áp dụng cho outsider chưa nộp đơn */}
            {actor === 'APPLICANT' || actor === 'WAITLISTED_APPLICANT' ? (
              <div className="space-y-3 pt-1">
                <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 text-center space-y-2">
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-300 block">
                    {actor === 'WAITLISTED_APPLICANT'
                      ? '⏳ Bạn đang trong Danh sách chờ (Waitlist)'
                      : '📨 Đơn của bạn đang chờ Trưởng nhóm duyệt'}
                  </span>
                  <p className="text-[11px] text-muted-foreground">
                    Bạn không thể nộp thêm đơn mới. Theo dõi trạng thái hoặc rút đơn tại màn Đơn ứng
                    tuyển.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateView?.('applications')}
                  className="w-full inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-xs font-extrabold text-primary-foreground hover:bg-primary/90 transition"
                >
                  Xem trạng thái đơn của tôi
                </button>
              </div>
            ) : actor === 'MEMBER' ||
              actor === 'TREASURER' ||
              actor === 'CO_LEADER' ||
              actor === 'LEADER' ? (
              <div className="space-y-3 pt-1">
                <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-center space-y-2">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block">
                    Bạn đã là thành viên chính thức của nhóm này
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateView?.('workspace')}
                  className="w-full inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-xs font-extrabold text-primary-foreground hover:bg-primary/90 transition"
                >
                  Vào Workspace nhóm
                </button>
              </div>
            ) : (
              groupState === 'RECRUITING' &&
              (!hasApplied ? (
                <div className="space-y-4 pt-1">
                  <div className="space-y-2 text-xs">
                    <label className="block font-bold text-foreground">
                      Lời nhắn gửi Trưởng nhóm:
                    </label>
                    <textarea
                      rows={3}
                      value={applicantMsg}
                      onChange={(e) => setApplicantMsg(e.target.value)}
                      placeholder="Chia sẻ về thể lực, kinh nghiệm leo núi & đồ dùng cá nhân..."
                      className="w-full rounded-2xl border border-input bg-background p-3.5 text-xs outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setHasApplied(true);
                      onOpenJoinWizard();
                    }}
                    className="w-full inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-extrabold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 transition active:scale-[0.98]"
                  >
                    <UserPlus className="h-4 w-4" />
                    Ứng tuyển vào nhóm ngay
                  </button>
                </div>
              ) : (
                <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-center space-y-2">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <h4 className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300">
                    Đã gửi đơn xin gia nhập!
                  </h4>
                </div>
              ))
            )}

            {isOutsiderActor && groupState === 'FULL' && (
              <div className="space-y-3 pt-1">
                <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 text-center space-y-2">
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-300 block">
                    🔴 Nhóm đã đủ 8/8 thành viên chính thức
                  </span>
                  <p className="text-[11px] text-muted-foreground">
                    Bạn có thể nộp đơn vào Danh sách chờ (Waitlist) để nhận ngay thông báo khi có
                    thành viên rút đơn.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onOpenJoinWizard}
                  className="w-full inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-amber-400 bg-amber-500/10 px-5 text-xs font-extrabold text-amber-800 dark:text-amber-300 hover:bg-amber-500/20 transition"
                >
                  <UserPlus className="h-4 w-4" />
                  Đăng ký vào Danh sách chờ (Waitlist)
                </button>
              </div>
            )}

            {isOutsiderActor &&
              ['READY', 'IN_PROGRESS', 'SETTLING', 'COMPLETED'].includes(groupState) && (
                <div className="rounded-2xl bg-muted/60 p-4 text-center space-y-2 border border-border">
                  <span className="text-xs font-bold text-muted-foreground block">
                    🔒 Nhóm đã khóa ứng tuyển (Trạng thái: {groupState})
                  </span>
                  <p className="text-[11px] text-muted-foreground">
                    Chuyến đi này hiện đang diễn ra hoặc đã hoàn thành. Vui lòng khám phá các nhóm
                    đang tuyển khác.
                  </p>
                </div>
              )}

            {/* Quick Action Controls */}
            <div className="border-t border-border pt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => onOpenMatchDetails(sampleGroup)}
                className="w-full min-h-10 rounded-full border border-border text-xs font-bold text-foreground hover:bg-muted transition"
              >
                Xem chi tiết Bảng điểm Tương thích
              </button>
              <button
                type="button"
                onClick={onOpenSos}
                className="w-full min-h-10 rounded-full border border-rose-200 bg-rose-50 dark:bg-rose-950/30 text-xs font-bold text-rose-700 dark:text-rose-400 hover:bg-rose-100 transition"
              >
                Mô phỏng Trung tâm SOS Khẩn cấp
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Bảo vệ Cộng đồng C2C</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              TrekSphere kết nối thành viên C2C minh bạch. Đánh giá uy tín Trust Score giúp bạn an
              tâm trước khi khởi hành.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
