import { CalendarClock, ShieldAlert } from 'lucide-react';
import type { RiskLevel, UpcomingSchedule } from '../types';

interface UpcomingSchedulesTableProps {
  schedules?: UpcomingSchedule[];
  isLoading?: boolean;
  isError?: boolean;
  onViewManifest: (scheduleId: string) => void;
}

const RISK_CONFIG: Record<
  RiskLevel,
  { label: string; badgeBg: string; badgeColor: string; barColor: string }
> = {
  SAFE: { label: 'An toàn', badgeBg: '#DCFCE7', badgeColor: '#15803D', barColor: '#16A34A' },
  WARNING: { label: 'Cần chú ý', badgeBg: '#FEF3C7', badgeColor: '#B45309', barColor: '#F59E0B' },
  DANGER: { label: 'Nguy cơ hủy', badgeBg: '#FEE2E2', badgeColor: '#B91C1C', barColor: '#DC2626' },
};

const HEADERS = ['TOUR', 'NGÀY KHỞI HÀNH', 'SỐ KHÁCH', 'TỶ LỆ LẤP ĐẦY', 'RỦI RO', 'THAO TÁC'];

function formatDate(value: string): string {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('vi-VN');
}

export function UpcomingSchedulesTable({
  schedules,
  isLoading,
  isError,
  onViewManifest,
}: UpcomingSchedulesTableProps) {
  const rows = schedules ?? [];

  return (
    <div
      className="overflow-hidden rounded-3xl shadow-sm"
      style={{ backgroundColor: '#FFFFFF', border: '1px solid #E6E2D1' }}
    >
      <div className="px-6 pt-6 pb-4">
        <h2 className="text-lg font-extrabold" style={{ color: '#06261D' }}>
          Lịch khởi hành sắp tới
        </h2>
        <p className="text-xs font-medium" style={{ color: '#6F7B75' }}>
          Theo dõi tỷ lệ lấp đầy để xử lý sớm những chuyến có nguy cơ phải hủy
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px]">
          <thead style={{ backgroundColor: '#FAF8F1' }}>
            <tr>
              {HEADERS.map((header) => (
                <th
                  key={header}
                  className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider"
                  style={{ color: '#6F7B75' }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: '#F0EEE6' }}>
            {isLoading ? (
              <tr>
                <td
                  colSpan={HEADERS.length}
                  className="px-6 py-16 text-center text-sm text-gray-500"
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-800 border-t-transparent" />
                    <span>Đang tải lịch khởi hành...</span>
                  </div>
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td
                  colSpan={HEADERS.length}
                  className="px-6 py-16 text-center text-sm text-red-500"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <ShieldAlert className="h-8 w-8" />
                    <span>Không tải được danh sách lịch khởi hành.</span>
                  </div>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={HEADERS.length} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <CalendarClock className="mb-1 h-8 w-8 text-gray-300" />
                    <p className="text-base font-semibold" style={{ color: '#06261D' }}>
                      Chưa có lịch khởi hành sắp tới
                    </p>
                    <p className="text-xs text-gray-400">
                      Mở bán thêm lịch trình để khách có thể đặt chỗ.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((schedule) => {
                const risk = RISK_CONFIG[schedule.riskLevel];
                const barWidth = Math.min(100, Math.max(0, schedule.occupancyRate));
                const isBelowMin =
                  schedule.minCapacity > 0 && schedule.currentBookings < schedule.minCapacity;

                return (
                  <tr key={schedule.scheduleId} className="transition-colors hover:bg-[#FAF8F1]">
                    <td className="px-6 py-4">
                      <p
                        className="max-w-[220px] truncate text-sm font-bold"
                        style={{ color: '#06261D' }}
                        title={schedule.tourName}
                      >
                        {schedule.tourName}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold" style={{ color: '#06261D' }}>
                        {formatDate(schedule.departureDate)}
                      </p>
                      {schedule.daysUntilDeparture > 0 && (
                        <p className="text-[11px] font-medium text-gray-400">
                          còn {schedule.daysUntilDeparture} ngày
                        </p>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm font-bold" style={{ color: '#06261D' }}>
                        {schedule.currentBookings}
                        <span className="font-medium text-gray-400">/{schedule.maxCapacity}</span>
                      </p>
                      <p
                        className="text-[11px] font-semibold"
                        style={{ color: isBelowMin ? '#B91C1C' : '#6F7B75' }}
                      >
                        tối thiểu {schedule.minCapacity}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-[#F0EEE6]">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${barWidth}%`, backgroundColor: risk.barColor }}
                          />
                        </div>
                        <span className="text-xs font-bold" style={{ color: '#06261D' }}>
                          {schedule.occupancyRate.toFixed(0)}%
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className="inline-flex rounded-full px-3 py-1 text-[11px] font-extrabold"
                        style={{ backgroundColor: risk.badgeBg, color: risk.badgeColor }}
                      >
                        {risk.label}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => onViewManifest(schedule.scheduleId)}
                        className="rounded-full px-4 py-2 text-xs font-bold transition-colors"
                        style={{ backgroundColor: '#E8E4DA', color: '#06261D' }}
                      >
                        Xem khách
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
