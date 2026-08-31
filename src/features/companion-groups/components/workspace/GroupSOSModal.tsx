import {
  AlertTriangle,
  Edit2,
  Flame,
  HelpCircle,
  LifeBuoy,
  MapPin,
  Megaphone,
  PhoneCall,
  Plus,
  ShieldAlert,
  Siren,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useCreateFeedPost } from '../../hooks/useGroupFeed';

interface GroupSOSModalProps {
  groupId: string;
  isOpen: boolean;
  onClose: () => void;
  isLeader?: boolean;
  leaderPhone?: string;
  leaderName?: string;
  currentGps?: string;
}

// 112 & 115 are ALWAYS guaranteed national fallback hotlines
const NATIONAL_HOTLINES = [
  {
    name: 'Tổng đài Tìm kiếm Cứu nạn Quốc gia',
    number: '112',
    desc: 'Yêu cầu trợ giúp khẩn cấp toàn quốc 24/7',
    badge: 'Quốc gia (24/7)',
  },
  {
    name: 'Cấp cứu Y tế Quốc gia',
    number: '115',
    desc: 'Hỗ trợ sự cố sức khỏe, chấn thương',
    badge: 'Y tế khẩn cấp',
  },
];

const INCIDENT_TYPES = [
  { id: 'injury', label: 'Chấn thương / Sự cố sức khỏe', icon: LifeBuoy },
  { id: 'lost', label: 'Lạc đường / Lệch tuyến trekking', icon: MapPin },
  { id: 'weather', label: 'Thời tiết xấu / Sạt lở / Mưa lớn', icon: Flame },
  { id: 'supplies', label: 'Cần hỗ trợ nước & nhu yếu phẩm', icon: AlertTriangle },
  { id: 'other', label: 'Sự cố Khác (Mô tả chi tiết)', icon: HelpCircle },
];

export function GroupSOSModal({
  groupId,
  isOpen,
  onClose,
  isLeader = false,
  leaderPhone = '0987.654.321',
  leaderName = 'Trưởng nhóm',
  currentGps = '21.2612° N, 104.6291° E',
}: GroupSOSModalProps) {
  const createPost = useCreateFeedPost(groupId);
  const [selectedIncident, setSelectedIncident] = useState('injury');
  const [customNote, setCustomNote] = useState('');
  const [isSuccessSent, setIsSuccessSent] = useState(false);

  // Mechanism 2: Custom Local Contact added by Leader
  const [localContactName, setLocalContactName] = useState('BQL Rừng & Porter Tà Xùa (Anh Tuấn)');
  const [localContactPhone, setLocalContactPhone] = useState('0988.123.456');
  const [isEditingLocalContact, setIsEditingLocalContact] = useState(false);
  const [inputName, setInputName] = useState(localContactName);
  const [inputPhone, setInputPhone] = useState(localContactPhone);

  if (!isOpen) return null;

  const handleSaveLocalContact = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalContactName(inputName.trim());
    setLocalContactPhone(inputPhone.trim());
    setIsEditingLocalContact(false);
  };

  const handleBroadcastSOS = (e: React.FormEvent) => {
    e.preventDefault();
    const incidentLabel =
      INCIDENT_TYPES.find((t) => t.id === selectedIncident)?.label ?? 'Sự cố khẩn cấp';

    const sosMessage = `🚨 [CẢNH BÁO SOS KHẨN CẤP DỌC ĐƯỜNG] 🚨
• Loại sự cố: ${incidentLabel}
• Tọa độ vị trí (GPS): ${currentGps}
• Ghi chú chi tiết: ${customNote.trim() || 'Thành viên cần hỗ trợ khẩn cấp trên tuyến di chuyển!'}
👉 Đề nghị các thành viên gần nhất và Trưởng nhóm kiểm tra vị trí & liên hệ ngay!`;

    createPost.mutate(sosMessage, {
      onSuccess: () => {
        setIsSuccessSent(true);
        setTimeout(() => {
          setIsSuccessSent(false);
          onClose();
        }, 2000);
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg space-y-5 rounded-2xl border-2 border-destructive/80 bg-card p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive text-destructive-foreground shadow-md animate-pulse">
              <Siren className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-destructive uppercase tracking-wide flex items-center gap-1.5">
                SOS Cứu Hộ Dọc Đường
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Hỗ trợ sự cố khẩn cấp trên cung đường trekking
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Success Banner */}
        {isSuccessSent ? (
          <div className="rounded-xl border border-emerald-500/50 bg-emerald-500/10 p-4 text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white font-extrabold">
              ✓
            </div>
            <h4 className="font-extrabold text-foreground text-sm">
              Tín hiệu SOS đã được phát tới toàn bộ thành viên!
            </h4>
            <p className="text-xs text-muted-foreground">
              Thông báo ghim khẩn cấp đã xuất hiện trên bảng tin nhóm. Vui lòng giữ liên lạc và bình tĩnh.
            </p>
          </div>
        ) : (
          <>
            {/* Section 1: Broadcast SOS to Group */}
            <form onSubmit={handleBroadcastSOS} className="space-y-3.5 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
              <div className="flex items-center gap-2 text-destructive font-extrabold text-xs">
                <Megaphone className="h-4 w-4" />
                <span>1. PHÁT TÍN HIỆU SOS TỚI BẢNG TIN NHÓM</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-foreground">Loại sự cố đang gặp phải:</label>
                <div className="grid grid-cols-2 gap-2">
                  {INCIDENT_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setSelectedIncident(type.id)}
                        className={cn(
                          'flex items-center gap-2 rounded-xl border p-2.5 text-left text-[11px] font-bold transition',
                          selectedIncident === type.id
                            ? 'border-destructive bg-destructive text-destructive-foreground shadow-xs'
                            : 'border-border bg-background text-foreground hover:border-destructive/50'
                        )}
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0" />
                        <span className="line-clamp-1">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-background p-2.5 border border-border text-[11px]">
                <MapPin className="h-4 w-4 text-destructive shrink-0" />
                <span className="text-muted-foreground font-medium">Toạ độ GPS hiện tại:</span>
                <span className="font-mono font-bold text-foreground">{currentGps}</span>
              </div>

              <textarea
                rows={2}
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Ghi chú thêm tình trạng (vd: Đau cổ chân ở chặng 2, không tự di chuyển được...)"
                className="w-full rounded-xl border border-input bg-background p-2.5 text-xs outline-none focus:ring-2 focus:ring-destructive"
              />

              <button
                type="submit"
                disabled={createPost.isPending}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-destructive py-3 text-xs font-black text-destructive-foreground shadow-md hover:bg-destructive/90 transition disabled:opacity-50"
              >
                <ShieldAlert className="h-4 w-4" />
                PHÁT TÍN HIỆU SOS CHO CẢ NHÓM
              </button>
            </form>

            {/* Section 2: Hotlines (Fallback 112/115 + Custom Leader Phone) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <PhoneCall className="h-3.5 w-3.5 text-primary" />
                  2. SỐ ĐIỆN THOẠI KHẨN CẤP & CỨU HỘ
                </span>
                {isLeader && !isEditingLocalContact && (
                  <button
                    type="button"
                    onClick={() => {
                      setInputName(localContactName);
                      setInputPhone(localContactPhone);
                      setIsEditingLocalContact(true);
                    }}
                    className="inline-flex items-center gap-1 text-[10.5px] font-bold text-primary hover:underline"
                  >
                    <Edit2 className="h-3 w-3" />
                    {localContactPhone ? 'Sửa Hotline địa phương' : 'Thêm Hotline địa phương'}
                  </button>
                )}
              </div>

              {/* Leader Edit Custom Contact Form */}
              {isEditingLocalContact && (
                <form onSubmit={handleSaveLocalContact} className="space-y-2 rounded-xl border border-primary/40 bg-primary/5 p-3 text-xs">
                  <span className="font-extrabold text-primary text-[11px] flex items-center gap-1">
                    <Plus className="h-3.5 w-3.5" /> Điền hotline Cứu hộ / Porter địa phương cho nhóm:
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Tên đơn vị / Đội porter (vd: Đội cứu hộ Tà Xùa)"
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background p-2 text-xs"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Số điện thoại (vd: 0988.xxx.xxx)"
                    value={inputPhone}
                    onChange={(e) => setInputPhone(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background p-2 text-xs font-mono"
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsEditingLocalContact(false)}
                      className="rounded-lg px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:bg-muted"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow-xs"
                    >
                      Lưu hotline
                    </button>
                  </div>
                </form>
              )}

              {/* Leader Call */}
              <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 p-3">
                <div>
                  <span className="text-[10px] font-extrabold text-primary uppercase">Trưởng Nhóm Đoàn</span>
                  <p className="text-xs font-bold text-foreground">{leaderName} • {leaderPhone}</p>
                </div>
                <a
                  href={`tel:${leaderPhone.replace(/\./g, '')}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-extrabold text-primary-foreground shadow-xs hover:bg-primary/90 transition"
                >
                  <PhoneCall className="h-3.5 w-3.5" /> Gọi Leader
                </a>
              </div>

              {/* Custom Local Contact (if added by Leader) */}
              {localContactPhone && (
                <div className="flex items-center justify-between rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-2.5 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">{localContactName}</span>
                      <span className="rounded-md bg-emerald-500/20 px-1.5 py-0.2 text-[9.5px] font-extrabold text-emerald-700 dark:text-emerald-400">
                        Leader điền
                      </span>
                    </div>
                    <p className="text-[10.5px] text-muted-foreground">Đã bổ sung bởi Trưởng nhóm trước chuyến đi</p>
                  </div>
                  <a
                    href={`tel:${localContactPhone.replace(/\./g, '')}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-extrabold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 transition shrink-0 font-mono"
                  >
                    <PhoneCall className="h-3 w-3" /> {localContactPhone}
                  </a>
                </div>
              )}

              {/* National Fallback Hotlines (112 & 115 - Always Available) */}
              <div className="space-y-2">
                {NATIONAL_HOTLINES.map((h) => (
                  <div
                    key={h.number}
                    className="flex items-center justify-between rounded-xl border border-border bg-background p-2.5 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{h.name}</span>
                        <span className="rounded-md bg-muted px-1.5 py-0.2 text-[9.5px] font-bold text-muted-foreground">
                          {h.badge}
                        </span>
                      </div>
                      <p className="text-[10.5px] text-muted-foreground">{h.desc}</p>
                    </div>
                    <a
                      href={`tel:${h.number}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-1 text-xs font-extrabold text-destructive hover:bg-destructive/20 transition shrink-0"
                    >
                      <PhoneCall className="h-3 w-3" /> {h.number}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Emergency Rules */}
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 space-y-1.5 text-[11px]">
              <span className="font-extrabold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" /> Quy tắc an toàn khi gặp sự cố trên rừng:
              </span>
              <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground text-[10.5px]">
                <li><strong>Giữ nguyên vị trí:</strong> Tránh tự di chuyển tiếp nếu mất phương hướng hoặc chấn thương.</li>
                <li><strong>Tiết kiệm pin & nước:</strong> Tắt bớt ứng dụng ngầm, giữ ấm cơ thể.</li>
                <li><strong>Tín hiệu âm thanh:</strong> Dùng còi cứu hộ (3 tiếng ngắn liên tiếp) hoặc đèn pin nhấp nháy.</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
