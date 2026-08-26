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
import type { GroupRecommendation } from '../../types/groupMatchingTypes';

interface GroupDetailOutsiderViewProps {
  onOpenJoinWizard: () => void;
  onOpenMatchDetails: (group: GroupRecommendation) => void;
  onOpenSos: () => void;
}

export function GroupDetailOutsiderView({
  onOpenMatchDetails,
  onOpenSos,
}: GroupDetailOutsiderViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'budget' | 'rules'>(
    'overview'
  );
  const [hasApplied, setHasApplied] = useState<boolean>(false);
  const [applicantMsg, setApplicantMsg] = useState<string>('');
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);

  const sampleGroup = groupRecommendations[0];

  return (
    <div className="space-y-6">
      {/* 1. Hero Cover Header (Figma 451:1189) */}
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
              <span>Góc nhìn người ngoài (Outsider View) · Figma 451:1188</span>
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
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/90 backdrop-blur-xs px-3 py-1 text-xs font-extrabold text-white">
                <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                ĐANG TUYỂN (4/8 Thành viên)
              </span>
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
                <CalendarDays className="h-4 w-4 text-amber-400" /> 12/10 – 14/10/2026 (3 ngày 2
                đêm)
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

      {/* 2. Main Content Grid (Left 68% + Right Sticky Sidebar 32%) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* LEFT COLUMN */}
        <div className="space-y-6 lg:col-span-8">
          {/* Internal Sub-Tab Bar */}
          <div className="flex overflow-x-auto rounded-2xl border border-border bg-card p-1.5 shadow-xs scrollbar-none">
            {[
              { id: 'overview', label: 'Tổng quan & Highlight', icon: Compass },
              { id: 'itinerary', label: 'Lộ trình 3N2Đ', icon: Route },
              { id: 'budget', label: 'Dự toán C2C (Ước tính)', icon: WalletCards },
              { id: 'rules', label: 'Cam kết & An toàn', icon: ShieldCheck },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
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

          {/* TAB 1: OVERVIEW & HIGHLIGHT */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Leader Profile Box */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
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
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
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

              {/* Compatibility Breakdown Banner */}
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 space-y-3">
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
                  <div className="rounded-xl border border-emerald-500/20 bg-background/80 p-3 space-y-1">
                    <span className="font-bold text-emerald-700">✓ Khung ngày tự do</span>
                    <p className="text-muted-foreground">
                      Khớp 100% khoảng ngày rảnh của bạn (12-14/10)
                    </p>
                  </div>
                  <div className="rounded-xl border border-emerald-500/20 bg-background/80 p-3 space-y-1">
                    <span className="font-bold text-emerald-700">✓ Thể lực phù hợp</span>
                    <p className="text-muted-foreground">
                      Yêu cầu Thể lực Khá tốt (Đã xác minh qua hồ sơ)
                    </p>
                  </div>
                  <div className="rounded-xl border border-emerald-500/20 bg-background/80 p-3 space-y-1">
                    <span className="font-bold text-emerald-700">✓ Ngân sách tương đồng</span>
                    <p className="text-muted-foreground">
                      Chi phí dự kiến ~2.18M nằm trong khoảng 2.0M - 2.5M
                    </p>
                  </div>
                  <div className="rounded-xl border border-emerald-500/20 bg-background/80 p-3 space-y-1">
                    <span className="font-bold text-emerald-700">★ Kỹ năng nhóm cần</span>
                    <p className="text-muted-foreground">
                      Nhóm đang tìm người biết Sơ cứu/Sử dụng bản đồ (Khớp với bạn!)
                    </p>
                  </div>
                </div>
              </div>

              {/* Trip Highlight Description */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
                <h3 className="text-base font-extrabold text-foreground">
                  Giới thiệu chi tiết hành trình
                </h3>
                <div className="space-y-3 text-xs leading-6 text-muted-foreground">
                  <p>
                    Tà Xùa nằm ở ranh giới tự nhiên giữa hai tỉnh Sơn La và Yên Bái, được ví như
                    thiên đường biển mây của vùng Tây Bắc. Cung đường trekking này không quá dài
                    nhưng có những đoạn dốc núi đá thử thách, đặc biệt là mỏm đá "Sống lưng khủng
                    long" hùng vĩ.
                  </p>
                  <p>
                    Chuyến đi kéo dài 3 ngày 2 đêm được thiết kế theo hình thức{' '}
                    <strong>C2C tự túc ghép nhóm</strong>. Mọi người cùng đóng góp chuẩn bị trang
                    thiết bị, phân công nhiệm vụ (dẫn đường, nấu ăn, y tế, chụp ảnh) và chi trả theo
                    hóa đơn thực tế phát sinh.
                  </p>
                </div>

                <div className="border-t border-border pt-4">
                  <h4 className="text-xs font-extrabold text-foreground mb-3 uppercase tracking-wider">
                    Tiêu chí thành viên cần tuyển:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-xl border border-border bg-background p-3 text-center">
                      <span className="block text-[11px] font-medium text-muted-foreground">
                        Thể lực tối thiểu
                      </span>
                      <strong className="text-xs font-bold text-foreground">
                        Khá tốt (Chạy bộ / Đạp xe)
                      </strong>
                    </div>
                    <div className="rounded-xl border border-border bg-background p-3 text-center">
                      <span className="block text-[11px] font-medium text-muted-foreground">
                        Thái độ đồng hành
                      </span>
                      <strong className="text-xs font-bold text-foreground">
                        Tôn trọng & Đúng giờ
                      </strong>
                    </div>
                    <div className="rounded-xl border border-border bg-background p-3 text-center">
                      <span className="block text-[11px] font-medium text-muted-foreground">
                        Kỹ năng ưu tiên
                      </span>
                      <strong className="text-xs font-bold text-emerald-700">
                        Sơ cứu / Chụp ảnh
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ITINERARY TIMELINE */}
          {activeTab === 'itinerary' && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h3 className="text-base font-extrabold text-foreground">
                    Lộ trình Trekking 3 Ngày 2 Đêm
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Lịch trình dự kiến đã được Leader lập kế hoạch chi tiết
                  </p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                  3 Checkpoints chính
                </span>
              </div>

              <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                {/* Day 1 */}
                <div className="relative">
                  <span className="absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold ring-4 ring-background">
                    1
                  </span>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold text-foreground">
                        Ngày 1: Hà Nội ➔ Bắc Yên ➔ Chân núi Tà Xùa (Nghỉ lán 2.200m)
                      </h4>
                      <span className="text-[11px] font-bold text-muted-foreground">
                        Trek ~7 km
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      • 22:00 (Đêm trước): Tập trung tại Bến xe Mỹ Đình, lên xe giường nằm di chuyển
                      đi Bắc Yên.
                      <br />• 05:00: Đến trạm dừng chân, ăn sáng, nhận gậy và phân chia vật dụng
                      chung của nhóm.
                      <br />• 07:30: Bắt đầu trekking xuyên qua rừng trúc xanh mát.
                      <br />• 12:00: Dừng chân dùng bữa trưa nhẹ giữa rừng.
                      <br />• 16:30: Đến lán nghỉ gỗ ở độ cao 2.200m, chuẩn bị bữa tối nướng BBQ
                      cùng nhóm.
                    </p>
                  </div>
                </div>

                {/* Day 2 */}
                <div className="relative">
                  <span className="absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold ring-4 ring-background">
                    2
                  </span>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold text-foreground">
                        Ngày 2: Lán 2.200m ➔ Sống lưng khủng long ➔ Săn mây hoàng hôn
                      </h4>
                      <span className="text-[11px] font-bold text-muted-foreground">
                        Trek ~9 km
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      • 06:00: Dậy sớm đón bình minh nhẹ, thưởng thức cà phê và ăn sáng nóng.
                      <br />• 07:30: Thử thách chinh phục mỏm đá "Sống lưng khủng long" nổi tiếng.
                      <br />• 12:00: Ăn trưa tại mỏm đá ngắm toàn cảnh thung lũng mây.
                      <br />• 15:30: Chụp ảnh lưu niệm cùng lá cờ nhóm TrekSphere.
                      <br />• 18:00: Trở về lán, sinh hoạt vòng tròn và họp nhóm rà soát thể lực.
                    </p>
                  </div>
                </div>

                {/* Day 3 */}
                <div className="relative">
                  <span className="absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold ring-4 ring-background">
                    3
                  </span>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold text-foreground">
                        Ngày 3: Đón bình minh đỉnh núi ➔ Downhill ➔ Xe về Hà Nội
                      </h4>
                      <span className="text-[11px] font-bold text-muted-foreground">Hoàn tất</span>
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      • 05:00: Bắt trọn khoảnh khắc biển mây bàng bạc lúc rạng đông.
                      <br />• 08:00: Thu dọn hành lý, dọn sạch rác bảo vệ môi trường (Leave No
                      Trace).
                      <br />• 12:00: Xuống chân núi, ăn trưa lẩu cá tầm mừng chuyến đi thành công.
                      <br />• 14:00: Xe lên đường về Hà Nội. 19:30 có mặt tại Mỹ Đình.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ESTIMATED BUDGET */}
          {activeTab === 'budget' && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h3 className="text-base font-extrabold text-foreground">
                    Bảng Dự Toán Chi Phí C2C
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Không lợi nhuận thương mại — Chia sẻ chi phí thực tế
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">
                    Dự tính / Người
                  </span>
                  <p className="text-lg font-black text-emerald-600">2.180.000 đ</p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  {
                    title: 'Xe giường nằm 2 chiều Hà Nội - Bắc Yên',
                    cost: '550.000 đ',
                    note: 'Đặt vé chung nhóm',
                  },
                  {
                    title: 'Thuê lán nghỉ 2 đêm + Phí môi trường',
                    cost: '380.000 đ',
                    note: 'Chi trả tại trạm',
                  },
                  {
                    title: 'Thực phẩm, BBQ nướng & Nước uống 3 ngày',
                    cost: '650.000 đ',
                    note: 'Thủ quỹ mua chung',
                  },
                  {
                    title: 'Thuê Porter dẫn đường địa phương',
                    cost: '400.000 đ',
                    note: 'Chia đều cho 8 người',
                  },
                  {
                    title: 'Quỹ y tế & Dự phòng rủi ro',
                    cost: '200.000 đ',
                    note: 'Hoàn lại nếu không dùng',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-xl border border-border bg-background p-3.5 text-xs"
                  >
                    <div>
                      <span className="font-bold text-foreground">{item.title}</span>
                      <p className="text-[11px] text-muted-foreground">{item.note}</p>
                    </div>
                    <strong className="font-black text-foreground">{item.cost}</strong>
                  </div>
                ))}
              </div>

              <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 text-xs text-amber-800 dark:text-amber-300">
                ⚠️ <strong>Lưu ý tài chính:</strong> TrekSphere cung cấp công cụ tính toán và đối
                soát quỹ. Nền tảng <strong>KHÔNG thu quỹ hay giữ tiền</strong>. Mọi khoản tiền được
                thành viên trực tiếp thanh toán P2P hoặc giao cho Thủ quỹ nhóm.
              </div>
            </div>
          )}

          {/* TAB 5: RULES & SAFETY */}
          {activeTab === 'rules' && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-6">
              <div className="flex items-center gap-3 border-b border-border pb-4">
                <ShieldCheck className="h-6 w-6 text-emerald-600 shrink-0" />
                <div>
                  <h3 className="text-base font-extrabold text-foreground">
                    Cam kết An toàn & Quy tắc C2C
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Đảm bảo chuyến đi văn minh, an toàn và gắn kết
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="rounded-xl border border-border bg-background p-4 space-y-2">
                  <strong className="font-extrabold text-foreground">
                    1. Tuân thủ sự điều phối
                  </strong>
                  <p className="text-muted-foreground leading-relaxed">
                    Mọi thành viên có trách nhiệm nghe theo sự hướng dẫn của Leader/Co-Leader tại
                    các đoạn đường hiểm trở. Không tự ý tách đoàn.
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-background p-4 space-y-2">
                  <strong className="font-extrabold text-foreground">
                    2. Bảo vệ môi trường (LNT)
                  </strong>
                  <p className="text-muted-foreground leading-relaxed">
                    Áp dụng nguyên tắc "Leave No Trace" - Không để lại gì ngoài những dấu chân,
                    không lấy đi gì ngoài những bức ảnh đẹp.
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-background p-4 space-y-2">
                  <strong className="font-extrabold text-foreground">3. Tín hiệu SOS & Y tế</strong>
                  <p className="text-muted-foreground leading-relaxed">
                    Sử dụng tính năng SOS khẩn cấp trong ứng dụng nếu xảy ra chấn thương hoặc sự cố
                    bất ngờ trên hành trình.
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-background p-4 space-y-2">
                  <strong className="font-extrabold text-foreground">4. Minh bạch chi phí</strong>
                  <p className="text-muted-foreground leading-relaxed">
                    Thủ quỹ có trách nhiệm lưu trữ toàn bộ hóa đơn chi tiêu và cập nhật lên tab Ngân
                    sách nhóm sau chuyến đi.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN - STICKY JOIN BOX */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-36">
          {/* Main Join Card */}
          <div className="rounded-3xl border border-primary/30 bg-card p-6 shadow-xl space-y-5">
            <div className="border-b border-border pb-4">
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                Đăng ký ứng tuyển vào nhóm
              </span>
              <div className="mt-1 flex items-baseline justify-between">
                <h3 className="text-2xl font-black text-foreground">2.180.000 đ</h3>
                <span className="text-xs font-bold text-muted-foreground">/ người (Ước tính)</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Hạn chốt danh sách: Trước 05/10/2026
              </p>
            </div>

            {/* Quick Match Indicator */}
            <div className="rounded-2xl bg-primary/10 p-3.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-primary shrink-0" />
                <span className="font-bold text-primary">Độ hợp cạ của bạn</span>
              </div>
              <strong className="text-base font-black text-primary">92%</strong>
            </div>

            {/* Form Section */}
            {!hasApplied ? (
              <div className="space-y-4 pt-1">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-foreground">
                    Câu hỏi duyệt từ Trưởng nhóm:
                  </label>
                  <p className="text-xs text-muted-foreground italic rounded-xl bg-muted/50 p-3 border border-border">
                    "Chào bạn! Bạn đã từng đi trekking cung đường nào trên 1.500m chưa? Hãy chia sẻ
                    ngắn gọn về thể lực & đồ dùng bạn đã có nhé!"
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-foreground">
                    Lời nhắn xin vào nhóm của bạn:
                  </label>
                  <textarea
                    rows={4}
                    value={applicantMsg}
                    onChange={(e) => setApplicantMsg(e.target.value)}
                    placeholder="Ví dụ: Mình đã đi Lảo Thẩn năm ngoái, tập thể lực chạy bộ 5km định kỳ, có lều 2 người & túi y tế cá nhân..."
                    className="w-full rounded-2xl border border-input bg-background p-3.5 text-xs outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setHasApplied(true)}
                  className="w-full inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-extrabold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 transition active:scale-[0.98]"
                >
                  <UserPlus className="h-4 w-4" />
                  Gửi Đơn Xin Vào Nhóm Ngay
                </button>

                <p className="text-[11px] text-center text-muted-foreground leading-tight">
                  Đơn của bạn sẽ được gửi trực tiếp tới Leader <strong>Hoàng Nam</strong> duyệt
                  trong 24h.
                </p>
              </div>
            ) : (
              <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-5 text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-extrabold text-emerald-800 dark:text-emerald-300">
                  Đã gửi đơn xin vào nhóm!
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Leader Hoàng Nam đã nhận được lời nhắn của bạn. Bạn sẽ nhận được thông báo ngay
                  khi đơn được xem xét.
                </p>
                <button
                  type="button"
                  onClick={() => setHasApplied(false)}
                  className="text-xs font-bold text-muted-foreground hover:underline"
                >
                  Chỉnh sửa lời nhắn đơn
                </button>
              </div>
            )}

            {/* Quick action buttons */}
            <div className="border-t border-border pt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => onOpenMatchDetails(sampleGroup)}
                className="w-full min-h-10 rounded-full border border-border text-xs font-bold text-foreground hover:bg-muted transition"
              >
                Xem chi tiết bảng điểm Tương thích
              </button>
              <button
                type="button"
                onClick={onOpenSos}
                className="w-full min-h-10 rounded-full border border-rose-200 bg-rose-50 dark:bg-rose-950/30 text-xs font-bold text-rose-700 dark:text-rose-400 hover:bg-rose-100 transition"
              >
                Giả lập Tín hiệu SOS Chuyến đi
              </button>
            </div>
          </div>

          {/* Safety Disclaimer Card */}
          <div className="rounded-3xl border border-border bg-card p-5 space-y-3">
            <div className="flex items-center gap-2 text-foreground font-bold text-xs">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Bảo vệ C2C Community</span>
            </div>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              TrekSphere là nền tảng kết nối tự do C2C phi thương mại. Bạn nên kiểm tra kỹ thông tin
              KYC và đánh giá Trust Score của Trưởng nhóm trước khi thống nhất tham gia.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
