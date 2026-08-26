import { AlertTriangle, CheckCircle2, PhoneCall, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import type { GroupRecommendation } from '../../types/groupMatchingTypes';

// --- MODAL 1: TRIP DECLARATION WIZARD MODAL ---
interface TripDeclarationWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedGroup: GroupRecommendation | null;
}

export function TripDeclarationWizardModal({
  isOpen,
  onClose,
  selectedGroup,
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
              onClick={() => setStep(3)}
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
            {group.matchBreakdown.map((item, idx) => (
              <div
                key={idx}
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
