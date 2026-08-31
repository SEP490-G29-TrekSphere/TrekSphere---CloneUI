import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  ListChecks,
  MapPin,
  PhoneCall,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { GroupRecommendation } from '../../types/groupMatchingTypes';

// --- MODAL 1: TRIP DECLARATION WIZARD MODAL ---
interface TripDeclarationWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedGroup: GroupRecommendation | null;
  /** Gọi đúng một lần khi đơn được xác nhận gửi (chuyển sang step 3) — dùng cho các luồng
   * ngoài cần biết đơn đã thực sự nộp thành công, phân biệt với việc chỉ đóng modal giữa chừng. */
  onSubmitted?: () => void;
}

export function TripDeclarationWizardModal({
  isOpen,
  onClose,
  selectedGroup,
  onSubmitted,
}: TripDeclarationWizardModalProps) {
  const [step, setStep] = useState<number>(1);
  const [fitnessLevel, setFitnessLevel] = useState<string>('khá tốt');
  const [hasGear, setHasGear] = useState<boolean>(true);
  const [note, setNote] = useState<string>('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-xl rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
              {step}
            </span>
            <h3 className="text-base font-extrabold text-foreground">
              {step === 1
                ? 'Khai báo Nhu cầu & Thể lực (Wizard Step 1)'
                : step === 2
                  ? 'Phù hợp & Đồng ý Cam kết C2C (Step 2)'
                  : 'Hoàn tất Đơn Ứng tuyển'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-muted-foreground hover:bg-muted"
          >
            ✕
          </button>
        </div>

        {step === 1 && (
          <div className="space-y-4 text-xs">
            <p className="text-muted-foreground">
              Thông tin này giúp Trưởng nhóm đánh giá xem bạn có đủ sức khỏe và chuẩn bị trang thiết
              bị cho chuyến đi <strong>{selectedGroup?.title || 'Tà Xùa'}</strong> hay không.
            </p>

            <div className="space-y-2">
              <label className="block font-bold text-foreground">
                Trình độ thể lực hiện tại của bạn:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Mới bắt đầu', 'Khá tốt', 'Chuyên nghiệp'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setFitnessLevel(lvl.toLowerCase())}
                    className={`rounded-xl border p-3 text-center font-bold transition ${
                      fitnessLevel === lvl.toLowerCase()
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-background hover:bg-muted'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block font-bold text-foreground font-bold">
                Trang thiết bị cá nhân đã có:
              </label>
              <div className="space-y-2 rounded-xl bg-background p-3 border border-border">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasGear}
                    onChange={(e) => setHasGear(e.target.checked)}
                    className="rounded border-input text-primary focus:ring-primary"
                  />
                  <span>Có giày trekking cổ cao & gậy leo núi chuyên dụng</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-input text-primary focus:ring-primary"
                  />
                  <span>Có áo mưa cá nhân & đèn pin đội đầu</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block font-bold text-foreground">Ghi chú thêm gửi Leader:</label>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ví dụ: Đã có kinh nghiệm leo Fansipan năm 2024..."
                className="w-full rounded-xl border border-input bg-background p-3 outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 text-xs">
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 space-y-2">
              <span className="font-bold text-emerald-800 dark:text-emerald-300 block">
                ✓ Thể lực của bạn hoàn toàn đáp ứng cung đường!
              </span>
              <p className="text-muted-foreground leading-relaxed">
                Leader đặt ra yêu cầu thể lực tối thiểu là "Khá tốt". Khai báo của bạn hoàn toàn hợp
                lệ.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-background p-4 space-y-3">
              <h4 className="font-extrabold text-foreground">Cam kết tham gia chuyến đi C2C:</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Chủ động tập luyện thể lực trước ngày khởi hành tối thiểu 1 tuần.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Thanh toán đúng hạn các khoản chi phí thực tế phát sinh (chia đều C2C).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Tuân thủ tuyệt đối sự hướng dẫn an toàn của Trưởng nhóm.</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="py-4 text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h4 className="text-base font-extrabold text-foreground">
              Đã gửi đơn xin gia nhập thành công!
            </h4>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Đơn của bạn đã được chuyển tới Leader{' '}
              <strong>{selectedGroup?.leader.name || 'Hoàng Nam'}</strong>. Vui lòng chờ phản hồi
              trong vòng 24h.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-border pt-4">
          {step > 1 && step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="rounded-full border border-border px-4 py-2 text-xs font-bold text-foreground hover:bg-muted"
            >
              Quay lại
            </button>
          ) : (
            <span />
          )}

          {step === 1 && (
            <button
              type="button"
              onClick={() => setStep(2)}
              className="rounded-full bg-primary px-6 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90"
            >
              Tiếp tục Step 2 &rarr;
            </button>
          )}
          {step === 2 && (
            <button
              type="button"
              onClick={() => {
                setStep(3);
                onSubmitted?.();
              }}
              className="rounded-full bg-emerald-600 px-6 py-2 text-xs font-bold text-white hover:bg-emerald-700"
            >
              Xác nhận Gửi đơn
            </button>
          )}
          {step === 3 && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-primary px-6 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90"
            >
              Hoàn tất & Đóng
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// --- MODAL 2: MATCH DETAILS MODAL ---
interface MatchDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: GroupRecommendation | null;
}

export function MatchDetailsModal({ isOpen, onClose, group }: MatchDetailsModalProps) {
  if (!isOpen || !group) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h3 className="text-base font-extrabold text-foreground">
              Chi tiết Điểm Tương Thích ({group.match}%)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-muted-foreground hover:bg-muted"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <p className="text-muted-foreground">
            Bảng phân tích từ <strong>Matching Engine</strong> đối chiếu trực tiếp giữa hồ sơ tự do
            của bạn và tiêu chuẩn của nhóm <strong>{group.title}</strong>:
          </p>

          <div className="space-y-3">
            {group.matchBreakdown.map((item) => (
              <div
                key={item.label}
                className="space-y-1.5 rounded-xl border border-border bg-background p-3.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">{item.label}</span>
                  <span className="font-extrabold text-primary">{item.score}% Khớp</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${item.score}%` }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end border-t border-border pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-primary px-5 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90"
          >
            Hiểu rõ & Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

// --- MODAL 3: LEADER VETTING MODAL ---
interface LeaderVettingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LeaderVettingModal({ isOpen, onClose }: LeaderVettingModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <h3 className="text-base font-extrabold text-foreground">
              Yêu cầu Đủ Điều Kiện Trưởng Nhóm (Leader Vetting)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-muted-foreground hover:bg-muted"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <p className="text-muted-foreground leading-relaxed">
            Để đảm bảo an toàn cho các thành viên C2C, TrekSphere áp dụng tiêu chuẩn xác minh uy tín
            đối với Trưởng nhóm khởi xướng:
          </p>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
              <span className="font-bold text-foreground">
                1. Đã xác minh định danh (KYC 2 lớp)
              </span>
              <span className="text-emerald-700 font-bold">✓ Đã đạt</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
              <span className="font-bold text-foreground">
                2. Đã hoàn thành tối thiểu 3 chuyến C2C
              </span>
              <span className="text-emerald-700 font-bold">✓ Đã đạt (18 chuyến)</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
              <span className="font-bold text-foreground">3. Điểm uy tín Trust Score &gt; 4.5</span>
              <span className="text-emerald-700 font-bold">✓ Đã đạt (4.9/5.0)</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t border-border pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-primary px-5 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90"
          >
            Tiếp tục Tạo nhóm mới
          </button>
        </div>
      </div>
    </div>
  );
}

// --- MODAL 4: SOS EMERGENCY MODAL ---
interface SosEmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SosEmergencyModal({ isOpen, onClose }: SosEmergencyModalProps) {
  const [sosSent, setSosSent] = useState<boolean>(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-3xl border border-rose-300 bg-card p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2 text-rose-600">
            <AlertTriangle className="h-5 w-5 animate-pulse" />
            <h3 className="text-base font-black text-foreground">Kích hoạt Tín hiệu Cứu hộ SOS</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-muted-foreground hover:bg-muted"
          >
            ✕
          </button>
        </div>

        {!sosSent ? (
          <div className="space-y-4 text-xs">
            <p className="text-rose-700 dark:text-rose-400 font-bold">
              Chỉ sử dụng khi phát sinh sự cố y tế khẩn cấp, lạc đoàn hoặc thiên tai bất ngờ!
            </p>

            <div className="space-y-2 rounded-xl bg-muted/50 p-3.5 border border-border">
              <span className="font-bold text-foreground block">Tọa độ GPS tự động đính kèm:</span>
              <p className="font-mono text-emerald-700 dark:text-emerald-400">
                21.4421° N, 104.3211° E (Độ cao 2.185m)
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSosSent(true)}
              className="w-full rounded-full bg-rose-600 px-6 py-3.5 font-black text-white shadow-lg shadow-rose-600/30 hover:bg-rose-700 transition active:scale-95"
            >
              NHẤN GIỮ ĐỂ GỬI TÍN HIỆU SOS (3s)
            </button>
          </div>
        ) : (
          <div className="py-4 text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-600 text-white animate-bounce">
              <PhoneCall className="h-8 w-8" />
            </div>
            <h4 className="text-base font-black text-rose-600">ĐÃ GỬI TÍN HIỆU CỨU HỘ KHẨN CẤP!</h4>
            <p className="text-xs text-muted-foreground">
              Thông báo đã được truyền trực tiếp tới Trạm Cứu hộ Huyện Bắc Yên & Đội kiểm lâm Tà Xùa
              cùng 4 người thân trong danh sách liên hệ khẩn cấp.
            </p>
            <button
              type="button"
              onClick={() => {
                setSosSent(false);
                onClose();
              }}
              className="rounded-full border border-border px-5 py-2 text-xs font-bold text-foreground hover:bg-muted"
            >
              Hủy / Đã an toàn
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// --- MODAL 5: CREATE GROUP FROM VENDOR TOUR TEMPLATE MODAL ---
export interface CheckpointDetail {
  name: string;
  category?: string;
  distanceAltitude?: string;
  gps?: string;
  imageUrl?: string;
}

export interface VendorTourTemplate {
  id: string;
  tourId: string;
  title: string;
  vendorName: string;
  location: string;
  duration: string;
  estimatedCost: string;
  fitnessLevel: string;
  rating: number;
  totalBookings: number;
  description: string;
  checkpoints: (string | CheckpointDetail)[];
  dailyItinerary: { day: string; title: string; desc: string; gps?: string; imageUrl?: string }[];
  gearItems: string[];
  inheritedFeatures: {
    waypointsCount: number;
    daysCount: number;
    budgetEstimate: string;
    gearChecklistCount: number;
  };
}

export const VENDOR_TOUR_TEMPLATES: VendorTourTemplate[] = [
  {
    id: 'vendor-tour-1',
    tourId: 'tour-1',
    title: 'Tour Tà Xùa Săn Mây 3N2Đ - Cung Đường Sống Lưng Khủng Long',
    vendorName: 'Hmong Travel & Experience',
    location: 'Sơn La',
    duration: '3 ngày 2 đêm',
    estimatedCost: '1.450.000 VNĐ / người (Tự túc)',
    fitnessLevel: 'Khá tốt',
    rating: 4.9,
    totalBookings: 320,
    description:
      'Lịch trình chuẩn săn mây đỉnh Tà Xùa, đi qua Bãi Lều Gió, Đỉnh Đèo Gió và Sống Lưng Khủng Long.',
    checkpoints: [
      {
        name: 'Bắc Yên (Đón đoàn)',
        category: 'Tập kết & Khởi hành',
        distanceAltitude: '300m',
        gps: '21.2464° N, 104.6465° E',
        imageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80',
      },
      {
        name: 'Bãi Lều Gió Tà Xùa',
        category: 'Trạm dừng chân',
        distanceAltitude: '1.500m',
        gps: '21.2612° N, 104.6291° E',
        imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
      },
      {
        name: 'Đỉnh Đèo Gió - Cây Táo Mèo Cô Đơn',
        category: 'Điểm Check-in',
        distanceAltitude: '1.750m',
        gps: '21.2780° N, 104.6340° E',
        imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=80',
      },
      {
        name: 'Sống Lưng Khủng Long Háng Đồng',
        category: 'Đón biển mây',
        distanceAltitude: '1.800m',
        gps: '21.2855° N, 104.6521° E',
        imageUrl: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=600&q=80',
      },
    ],
    dailyItinerary: [
      {
        day: 'Ngày 1',
        title: 'Hà Nội - Bắc Yên - Tà Xùa',
        desc: 'Di chuyển lên Bắc Yên, check-in homestay & săn hoàng hôn tại Bãi Lều Gió.',
        gps: '21.2612° N, 104.6291° E',
        imageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80',
      },
      {
        day: 'Ngày 2',
        title: 'Chinh phục Sống Lưng Khủng Long & Đỉnh Đèo Gió',
        desc: 'Trekking sớm đón bình minh biển mây Háng Đồng, ăn trưa nướng bản địa.',
        gps: '21.2855° N, 104.6521° E',
        imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
      },
      {
        day: 'Ngày 3',
        title: 'Cây Táo Mèo Cô Đơn - Mua quà nông sản - Về Hà Nội',
        desc: 'Tham quan vườn chè cổ thụ Shan Tuyết, thưởng thức cà phê mây trước khi về.',
        gps: '21.2780° N, 104.6340° E',
        imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=80',
      },
    ],
    gearItems: [
      'Giày trekking bám tốt',
      'Áo khoác gió chống nước',
      'Gậy leo núi',
      'Đèn pin đội đầu',
      'Miếng dán giữ nhiệt',
      'Bình nước cá nhân 1.5L',
    ],
    inheritedFeatures: {
      waypointsCount: 4,
      daysCount: 3,
      budgetEstimate: '1.450.000 VNĐ',
      gearChecklistCount: 6,
    },
  },
  {
    id: 'vendor-tour-2',
    tourId: 'tour-2',
    title: 'Tour Chinh Phục Đỉnh Lảo Thần 2860m - Săn Mây Y Tý',
    vendorName: 'Sapa Trekking & Adventure',
    location: 'Lào Cai',
    duration: '2 ngày 1 đêm',
    estimatedCost: '1.200.000 VNĐ / người (Tự túc)',
    fitnessLevel: 'Mới bắt đầu',
    rating: 4.8,
    totalBookings: 210,
    description:
      'Lịch trình ngắm hoàng hôn Y Tý, đón bình minh trên đỉnh Lảo Thần nhẹ nhàng phù hợp nhóm bạn.',
    checkpoints: [
      {
        name: 'Phìn Hồ (Xuất phát)',
        category: 'Điểm bắt đầu',
        distanceAltitude: '1.800m',
        gps: '22.6150° N, 103.6210° E',
        imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
      },
      {
        name: 'Lán nghỉ Đống Pao',
        category: 'Nghỉ đêm',
        distanceAltitude: '2.400m',
        gps: '22.6280° N, 103.6350° E',
        imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80',
      },
      {
        name: 'Cây Chút Chít Khổng Lồ',
        category: 'Điểm Check-in',
        distanceAltitude: '2.600m',
        gps: '22.6320° N, 103.6380° E',
        imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80',
      },
      {
        name: 'Đỉnh Lảo Thần Peak',
        category: 'Chạm đỉnh',
        distanceAltitude: '2.860m',
        gps: '22.6390° N, 103.6420° E',
        imageUrl: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=600&q=80',
      },
      {
        name: 'Bản Phìn Hồ (Hoàn thành)',
        category: 'Điểm kết thúc',
        distanceAltitude: '1.800m',
        gps: '22.6150° N, 103.6210° E',
        imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
      },
    ],
    dailyItinerary: [
      {
        day: 'Ngày 1',
        title: 'Sapa - Y Tý - Phìn Hồ - Lán Nghỉ 2400m',
        desc: 'Trekking xuyên qua rừng cỏ cháy và đồi trống, cắm trại săn hoàng hôn trên mây.',
        gps: '22.6280° N, 103.6350° E',
        imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80',
      },
      {
        day: 'Ngày 2',
        title: 'Đón Bình Minh Đỉnh Lảo Thần - Phìn Hồ - Sapa',
        desc: 'Chạm đỉnh 2860m lúc 6:00 sáng, ngắm biển mây Y Tý 360 độ rồi xuống núi.',
        gps: '22.6390° N, 103.6420° E',
        imageUrl: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=600&q=80',
      },
    ],
    gearItems: [
      'Áo siêu nhẹ chịu nhiệt 5-10 độ',
      'Găng tay leo núi',
      'Giày thể thao độ bám cao',
      'Mũ len & khăn nỉ',
      'Thuốc cá nhân & điện giải',
    ],
    inheritedFeatures: {
      waypointsCount: 5,
      daysCount: 2,
      budgetEstimate: '1.200.000 VNĐ',
      gearChecklistCount: 5,
    },
  },
  {
    id: 'vendor-tour-3',
    tourId: 'tour-3',
    title: 'Tour Fansipan Cung Đường Trạm Tôn - Chinh Phục Nóc Nhà Đông Dương',
    vendorName: 'VietTrekker Expedition',
    location: 'Lào Cai',
    duration: '2 ngày 1 đêm',
    estimatedCost: '2.100.000 VNĐ / người (Tự túc)',
    fitnessLevel: 'Chuyên nghiệp',
    rating: 5.0,
    totalBookings: 450,
    description:
      'Lộ trình trekking truyền thống Trạm Tôn - 2800m - Đỉnh Fansipan 3143m kèm checklist thể lực.',
    checkpoints: [
      {
        name: 'Trạm Tôn (Bắt đầu)',
        category: 'Cửa rừng',
        distanceAltitude: '1.900m',
        gps: '22.3512° N, 103.7745° E',
        imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=80',
      },
      {
        name: 'Điểm dừng chân ăn trưa',
        category: 'Trạm ăn trưa',
        distanceAltitude: '2.200m',
        gps: '22.3350° N, 103.7760° E',
        imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
      },
      {
        name: 'Lán nghỉ đêm Fansipan',
        category: 'Trạm nghỉ đêm',
        distanceAltitude: '2.800m',
        gps: '22.3120° N, 103.7790° E',
        imageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80',
      },
      {
        name: 'Vọng Cảnh Peak',
        category: 'Điểm Check-in',
        distanceAltitude: '3.000m',
        gps: '22.3080° N, 103.7770° E',
        imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
      },
      {
        name: 'Đỉnh Fansipan Peak',
        category: 'Nóc nhà Đông Dương',
        distanceAltitude: '3.143m',
        gps: '22.3035° N, 103.7751° E',
        imageUrl: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=600&q=80',
      },
      {
        name: 'Trạm Tôn (Xuống núi)',
        category: 'Hoàn thành',
        distanceAltitude: '1.900m',
        gps: '22.3512° N, 103.7745° E',
        imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=80',
      },
    ],
    dailyItinerary: [
      {
        day: 'Ngày 1',
        title: 'Sapa - Trạm Tôn (1900m) - Lán nghỉ 2800m',
        desc: 'Xuyên rừng trúc Hoàng Liên Sơn, vượt vách đá có hỗ trợ dây cáp an toàn.',
        gps: '22.3120° N, 103.7790° E',
        imageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80',
      },
      {
        day: 'Ngày 2',
        title: 'Lán 2800m - Chạm đỉnh Fansipan (3143m) - Trạm Tôn',
        desc: 'Chinh phục đỉnh cao nhất Đông Dương, chụp ảnh cột mốc inox và về Sapa.',
        gps: '22.3035° N, 103.7751° E',
        imageUrl: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=600&q=80',
      },
    ],
    gearItems: [
      'Giày trekking cổ cao bọc cổ chân',
      'Gậy trekking đôi',
      'Bao tay dệt kim bám đá',
      'Đèn pin siêu sáng',
      'Áo mưa bộ gore-tex',
      'Túi ngủ nỉ lót lán',
      'Thức ăn nhanh năng lượng cao',
      'Còi cứu hộ',
    ],
    inheritedFeatures: {
      waypointsCount: 6,
      daysCount: 2,
      budgetEstimate: '2.100.000 VNĐ',
      gearChecklistCount: 8,
    },
  },
];

interface CreateGroupFromVendorTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmClone: (template: VendorTourTemplate, customTitle: string) => void;
}

export function CreateGroupFromVendorTourModal({
  isOpen,
  onClose,
  onConfirmClone,
}: CreateGroupFromVendorTourModalProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('vendor-tour-1');
  const [expandedTemplateId, setExpandedTemplateId] = useState<string | null>('vendor-tour-1');
  const [customTitle, setCustomTitle] = useState<string>(
    'Nhóm Săn Mây Tà Xùa Tự Túc (Kế thừa từ Tour Vendor)'
  );
  const [customDate, setCustomDate] = useState<string>('2026-10-18');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const selectedTemplate =
    VENDOR_TOUR_TEMPLATES.find((t) => t.id === selectedTemplateId) || VENDOR_TOUR_TEMPLATES[0];

  const handleSelectTemplate = (tmpl: VendorTourTemplate) => {
    setSelectedTemplateId(tmpl.id);
    setCustomTitle(`Nhóm ${tmpl.title.replace('Tour ', '')} (Tự Túc C2C)`);
  };

  const toggleExpand = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setExpandedTemplateId((prev) => (prev === id ? null : id));
  };

  const handleCreate = () => {
    setIsSuccess(true);
    setTimeout(() => {
      onConfirmClone(selectedTemplate, customTitle);
      setIsSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Copy className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-foreground">
                  Tạo Nhóm C2C Từ Tour Mẫu Vendor
                </h3>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  Quick Clone & Custom
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Xem chi tiết thông tin tour public hoặc kế thừa trực tiếp lộ trình & mốc an toàn.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-muted-foreground hover:bg-muted"
          >
            ✕
          </button>
        </div>

        {isSuccess ? (
          <div className="py-10 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 animate-bounce">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h4 className="text-lg font-black text-foreground">
              Đã Nhân Bản Tour Vendor Thành Công!
            </h4>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Hệ thống đã sao chép{' '}
              <strong>{selectedTemplate.inheritedFeatures.waypointsCount} điểm Checkpoint</strong>,{' '}
              <strong>Lịch trình {selectedTemplate.inheritedFeatures.daysCount} ngày</strong> và{' '}
              <strong>
                {selectedTemplate.inheritedFeatures.gearChecklistCount} vật dụng gợi ý
              </strong>{' '}
              vào Workspace nhóm mới. Bạn có thể tự do tùy chỉnh thêm.
            </p>
          </div>
        ) : (
          <div className="space-y-5 text-xs">
            {/* Step 1: Choose Vendor Template */}
            <div className="space-y-2">
              <label className="font-extrabold text-foreground flex items-center justify-between">
                <span>1. Chọn Tour Mẫu Vendor để Kế Thừa:</span>
                <span className="text-[10px] font-normal text-muted-foreground">
                  Nguồn: Các Vendor đã xác thực trên TrekSphere
                </span>
              </label>

              <div className="grid grid-cols-1 gap-3">
                {VENDOR_TOUR_TEMPLATES.map((tmpl) => {
                  const isSelected = tmpl.id === selectedTemplateId;
                  const isExpanded = tmpl.id === expandedTemplateId;
                  return (
                    <div
                      key={tmpl.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleSelectTemplate(tmpl)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSelectTemplate(tmpl);
                        }
                      }}
                      className={`text-left rounded-2xl border p-4 transition space-y-3 cursor-pointer ${
                        isSelected
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                          : 'border-border bg-background hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground text-sm">{tmpl.title}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                            <span className="flex items-center gap-1 font-bold text-emerald-700">
                              <Building2 className="h-3 w-3" />
                              {tmpl.vendorName}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {tmpl.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {tmpl.duration}
                            </span>
                          </div>
                        </div>
                        <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-700 shrink-0">
                          ★ {tmpl.rating} ({tmpl.totalBookings} lượt đi)
                        </span>
                      </div>

                      <p className="text-muted-foreground line-clamp-2">{tmpl.description}</p>

                      {/* Inherited Features Badges + Action Links */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/60">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold text-foreground">
                            📍 {tmpl.inheritedFeatures.waypointsCount} Checkpoints
                          </span>
                          <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold text-foreground">
                            🗓️ {tmpl.inheritedFeatures.daysCount} Ngày lịch trình
                          </span>
                          <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold text-foreground">
                            🎒 {tmpl.inheritedFeatures.gearChecklistCount} Món trang bị
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            to={`/tours/${tmpl.tourId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-primary hover:underline font-extrabold text-[11px]"
                          >
                            <span>Xem trang chi tiết</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                          <button
                            type="button"
                            onClick={(e) => toggleExpand(e, tmpl.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2 py-1 text-[11px] font-bold text-foreground hover:bg-muted"
                          >
                            {isExpanded ? (
                              <>
                                <span>Ẩn chi tiết</span>
                                <ChevronUp className="h-3 w-3" />
                              </>
                            ) : (
                              <>
                                <span>Xem nhanh chi tiết</span>
                                <ChevronDown className="h-3 w-3" />
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Detailed Preview Drawer */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-border/80 space-y-3 bg-card/60 p-3 rounded-xl">
                          {/* Checkpoints preview */}
                          <div>
                            <span className="font-extrabold text-foreground text-[11px] flex items-center gap-1 mb-1.5">
                              <MapPin className="h-3.5 w-3.5 text-primary" />
                              Danh sách Checkpoints & Tọa độ mốc ({tmpl.checkpoints.length}):
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-2">
                              {tmpl.checkpoints.map((cpItem, idx) => {
                                const name = typeof cpItem === 'string' ? cpItem : cpItem.name;
                                const category = typeof cpItem === 'object' ? cpItem.category : undefined;
                                const elevation = typeof cpItem === 'object' ? cpItem.distanceAltitude : undefined;
                                const gps = typeof cpItem === 'object' ? cpItem.gps : undefined;
                                const imageUrl = typeof cpItem === 'object' ? cpItem.imageUrl : undefined;

                                return (
                                  <div
                                    key={name + idx}
                                    className="flex items-center gap-2.5 text-[11px] bg-background/90 p-2 rounded-xl border border-border/50 shadow-2xs"
                                  >
                                    {imageUrl ? (
                                      <img
                                        src={imageUrl}
                                        alt={name}
                                        className="h-10 w-12 rounded-lg object-cover border border-border/60 shrink-0"
                                      />
                                    ) : (
                                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-[10px] font-extrabold text-primary">
                                        #{idx + 1}
                                      </span>
                                    )}
                                    <div className="min-w-0 flex-1 space-y-0.5">
                                      <div className="flex items-center justify-between gap-1">
                                        <span className="font-bold text-foreground truncate">{name}</span>
                                        {elevation && (
                                          <span className="text-[9.5px] font-semibold text-emerald-700 bg-emerald-500/10 px-1 py-0.2 rounded shrink-0">
                                            {elevation}
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
                                        {category && <span className="font-medium text-slate-600">{category}</span>}
                                        {gps && (
                                          <span className="inline-flex items-center gap-0.5 font-mono text-primary bg-primary/5 px-1 py-0.2 rounded text-[9px]">
                                            <MapPin className="h-2.5 w-2.5" />
                                            {gps}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Daily Itinerary preview */}
                          <div>
                            <span className="font-extrabold text-foreground text-[11px] flex items-center gap-1 mb-1.5">
                              <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                              Lịch trình di chuyển ({tmpl.dailyItinerary.length} ngày):
                            </span>
                            <div className="space-y-2 pl-2">
                              {tmpl.dailyItinerary.map((day) => (
                                <div
                                  key={day.day}
                                  className="flex items-start gap-2.5 text-[11px] bg-background/90 p-2.5 rounded-xl border border-border/40"
                                >
                                  {day.imageUrl && (
                                    <img
                                      src={day.imageUrl}
                                      alt={day.title}
                                      className="h-12 w-14 rounded-lg object-cover border border-border/60 shrink-0"
                                    />
                                  )}
                                  <div className="space-y-0.5 min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-1">
                                      <span className="font-bold text-foreground">
                                        {day.day}: {day.title}
                                      </span>
                                      {day.gps && (
                                        <span className="inline-flex items-center gap-0.5 font-mono text-emerald-700 bg-emerald-500/10 px-1.5 py-0.2 rounded text-[9.5px]">
                                          <MapPin className="h-2.5 w-2.5" />
                                          {day.gps}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-muted-foreground text-[10px] line-clamp-2">
                                      {day.desc}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Gear list preview */}
                          <div>
                            <span className="font-extrabold text-foreground text-[11px] flex items-center gap-1 mb-1.5">
                              <ListChecks className="h-3.5 w-3.5 text-amber-600" />
                              Danh sách Vật dụng gợi ý ({tmpl.gearItems.length} món):
                            </span>
                            <div className="flex flex-wrap gap-1 pl-2">
                              {tmpl.gearItems.map((gear) => (
                                <span
                                  key={gear}
                                  className="rounded-md bg-muted/80 px-2 py-0.5 text-[10px] text-foreground border border-border/40"
                                >
                                  ✓ {gear}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Custom Group Settings */}
            <div className="rounded-2xl border border-border bg-muted/40 p-4 space-y-3">
              <label className="font-extrabold text-foreground block">
                2. Tùy Chỉnh Thông Tin Nhóm C2C Của Bạn:
              </label>

              <div className="space-y-3">
                <div>
                  <span className="font-bold text-foreground text-[11px] block mb-1">
                    Tên Nhóm ghép mới (Custom Title):
                  </span>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-bold text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="font-bold text-foreground text-[11px] block mb-1">
                      Ngày khởi hành nhóm:
                    </span>
                    <input
                      type="date"
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-bold text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <span className="font-bold text-foreground text-[11px] block mb-1">
                      Quyền tùy chỉnh sau khi Clone:
                    </span>
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                      ✓ Cho phép Trưởng nhóm & Thành viên chỉnh sửa tự do
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between border-t border-border pt-3">
              <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>Nhân bản chuẩn dữ liệu Tour Vendor B2C sang C2C Custom Plan</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border border-border px-4 py-2 font-bold text-foreground hover:bg-muted"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleCreate}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 font-extrabold text-primary-foreground hover:bg-primary/90 transition shadow-md"
                >
                  <span>Khởi Tạo Nhóm & Tải Lịch Trình</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
