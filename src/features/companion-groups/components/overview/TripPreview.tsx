import { AlertTriangle, Navigation, PhoneCall, UserCheck } from 'lucide-react';

interface TripPreviewProps {
  onOpenSos: () => void;
}

export function TripPreview({ onOpenSos }: TripPreviewProps) {
  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-bold text-rose-700">
                Giai đoạn 4 & 5
              </span>
              <h3 className="text-base font-extrabold text-foreground">
                Theo dõi Chuyến đi Thực địa & Trung tâm SOS An toàn
              </h3>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Giao diện thực địa rút gọn tối đa thao tác, tích hợp nút phát tín hiệu cứu hộ SOS khẩn
              cấp trong điều kiện mất sóng.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenSos}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-rose-300 bg-rose-50 dark:bg-rose-950/40 px-5 text-xs font-black text-rose-700 dark:text-rose-400 hover:bg-rose-100 shadow-md transition animate-pulse"
          >
            <AlertTriangle className="h-4 w-4" />
            Mở Bảng Kích hoạt SOS Khẩn cấp
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Status Cards */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Navigation className="h-5 w-5 text-emerald-600 animate-spin" />
                <h4 className="text-sm font-extrabold text-foreground">
                  Vị trí trạm dừng hiện tại
                </h4>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                Đang di chuyển: Lán 2.200m
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="rounded-xl border border-border bg-background p-3.5 space-y-1">
                <span className="text-muted-foreground text-[11px]">Độ cao hiện tại</span>
                <p className="text-base font-black text-foreground">2.185 m</p>
              </div>
              <div className="rounded-xl border border-border bg-background p-3.5 space-y-1">
                <span className="text-muted-foreground text-[11px]">Quãng đường đã đi</span>
                <p className="text-base font-black text-emerald-600">8.4 km / 16km</p>
              </div>
              <div className="rounded-xl border border-border bg-background p-3.5 space-y-1">
                <span className="text-muted-foreground text-[11px]">Điểm danh thể lực</span>
                <p className="text-base font-black text-foreground">4/4 Tốt</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
            <h4 className="text-sm font-extrabold text-foreground">
              Điểm danh quân số & Sức khỏe định kỳ
            </h4>
            <div className="space-y-3 text-xs">
              {[
                { name: 'Hoàng Nam (Leader)', status: 'Khỏe mạnh', time: '10 phút trước' },
                { name: 'Minh Anh (Co-Leader)', status: 'Khỏe mạnh', time: '12 phút trước' },
                {
                  name: 'Việt Dũng',
                  status: 'Hơi mỏi chân (Đã dán Salonpas)',
                  time: '15 phút trước',
                },
                { name: 'Thu Trang', status: 'Khỏe mạnh', time: '20 phút trước' },
              ].map((m, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-xl border border-border bg-background p-3"
                >
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-emerald-600" />
                    <span className="font-bold text-foreground">{m.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-700">{m.status}</span>
                    <span className="block text-[10px] text-muted-foreground">{m.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Rescue Info */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-rose-200 bg-rose-500/5 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-extrabold text-sm">
              <PhoneCall className="h-4 w-4" />
              <span>Đường dây nóng Cứu hộ Địa phương</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-rose-200/40 pb-2">
                <span className="text-muted-foreground">Công an Huyện Bắc Yên:</span>
                <strong className="text-foreground">0212.3843.115</strong>
              </div>
              <div className="flex justify-between border-b border-rose-200/40 pb-2">
                <span className="text-muted-foreground">Y tế xã Tà Xùa:</span>
                <strong className="text-foreground">0984.123.456</strong>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-muted-foreground">Tổng đài Cứu hộ 112:</span>
                <strong className="text-rose-600 font-black">112</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
