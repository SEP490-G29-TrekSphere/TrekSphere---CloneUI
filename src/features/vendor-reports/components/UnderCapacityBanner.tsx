import { AlertTriangle, CalendarClock, Users } from 'lucide-react';
import type { UnderCapacityAlert } from '../types';

interface UnderCapacityBannerProps {
  alerts?: UnderCapacityAlert[];
  daysThreshold: number;
  onViewManifest: (scheduleId: string) => void;
}

function formatDate(value: string): string {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('vi-VN');
}

export function UnderCapacityBanner({
  alerts,
  daysThreshold,
  onViewManifest,
}: UnderCapacityBannerProps) {
  // Không có cảnh báo thì ẩn hẳn banner — đây là tin tốt, không cần chiếm chỗ.
  if (!alerts?.length) return null;

  return (
    <section
      className="rounded-3xl p-5 shadow-sm"
      style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#FEE2E2]">
          <AlertTriangle className="h-5 w-5 text-[#DC2626]" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-extrabold text-[#B91C1C]">
            {alerts.length} chuyến chưa đủ khách tối thiểu
          </h2>
          <p className="text-xs font-medium text-[#B91C1C]/80">
            Khởi hành trong {daysThreshold} ngày tới nhưng chưa gom đủ số khách tối thiểu — cân nhắc
            đẩy khuyến mãi hoặc thông báo hoãn sớm cho khách.
          </p>

          <ul className="mt-4 space-y-2">
            {alerts.map((alert) => (
              <li
                key={alert.scheduleId}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/70 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold" style={{ color: '#06261D' }}>
                    {alert.tourName}
                  </p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-semibold text-gray-500">
                    <span className="flex items-center gap-1">
                      <CalendarClock className="h-3.5 w-3.5" />
                      {formatDate(alert.departureDate)}
                      {alert.daysUntilDeparture > 0 && ` · còn ${alert.daysUntilDeparture} ngày`}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {alert.currentBookings}/{alert.minCapacity} khách
                    </span>
                  </div>
                  {alert.alertMessage && (
                    <p className="mt-1 text-[11px] font-medium text-[#B91C1C]">
                      {alert.alertMessage}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-[#FEE2E2] px-3 py-1.5 text-[11px] font-extrabold text-[#B91C1C]">
                    Thiếu {alert.missingSlots} chỗ
                  </span>
                  <button
                    type="button"
                    onClick={() => onViewManifest(alert.scheduleId)}
                    className="rounded-full px-4 py-1.5 text-[11px] font-bold text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#06261D' }}
                  >
                    Xem khách
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
