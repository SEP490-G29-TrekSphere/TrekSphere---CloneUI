import { parseIsoDate, toIsoDate } from '@/lib/format';
import { AppDatePicker } from '@/shared/ui/primitives/AppDatePicker';
import type { ReportFilter, TimeRange } from '../types';

/**
 * Chỉ chọn KHOẢNG THỜI GIAN thống kê. Cách gộp dữ liệu (theo ngày / theo tháng)
 * nằm ngay trong card biểu đồ doanh thu vì nó chỉ ảnh hưởng biểu đồ đó — để
 * chung ở đây khiến người dùng tưởng có hai bộ lọc thời gian chồng nhau.
 */
interface ReportFilterBarProps {
  filter: ReportFilter;
  onChange: (patch: Partial<ReportFilter>) => void;
}

const TIME_RANGE_OPTIONS: Array<{ value: TimeRange; label: string }> = [
  { value: 'LAST_7_DAYS', label: '7 ngày' },
  { value: 'LAST_30_DAYS', label: '30 ngày' },
  { value: 'THIS_QUARTER', label: 'Quý này' },
  { value: 'CUSTOM', label: 'Tùy chọn' },
];

export function ReportFilterBar({ filter, onChange }: ReportFilterBarProps) {
  const isCustom = filter.timeRange === 'CUSTOM';
  const startDate = parseIsoDate(filter.startDate);
  const endDate = parseIsoDate(filter.endDate);

  const handleTimeRangeChange = (value: TimeRange) => {
    // Rời khỏi CUSTOM thì xoá luôn khoảng ngày đã chọn, tránh gửi kèm
    // startDate/endDate cũ ở lần chọn CUSTOM tiếp theo.
    onChange(
      value === 'CUSTOM'
        ? { timeRange: value }
        : { timeRange: value, startDate: undefined, endDate: undefined }
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Chip chọn khoảng thời gian */}
      <div
        className="flex items-center gap-1 rounded-full p-1"
        style={{ backgroundColor: '#EFECE6' }}
      >
        {TIME_RANGE_OPTIONS.map((option) => {
          const isActive = filter.timeRange === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleTimeRangeChange(option.value)}
              className="rounded-full px-4 py-2 text-xs font-bold transition-all"
              style={
                isActive ? { backgroundColor: '#06261D', color: '#FFFFFF' } : { color: '#6F7B75' }
              }
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {isCustom && (
        <div className="flex items-center gap-2">
          <div className="w-36">
            <AppDatePicker
              selected={startDate}
              onChange={(date: Date | null) =>
                onChange({ startDate: toIsoDate(date) || undefined })
              }
              maxDate={endDate ?? undefined}
              placeholderText="Từ ngày"
              className="!h-9 !rounded-full !border-[#E0DCD1] !bg-white !text-xs !font-semibold"
            />
          </div>
          <span className="text-xs font-bold" style={{ color: '#6F7B75' }}>
            →
          </span>
          <div className="w-36">
            <AppDatePicker
              selected={endDate}
              onChange={(date: Date | null) => onChange({ endDate: toIsoDate(date) || undefined })}
              minDate={startDate ?? undefined}
              placeholderText="Đến ngày"
              className="!h-9 !rounded-full !border-[#E0DCD1] !bg-white !text-xs !font-semibold"
            />
          </div>
        </div>
      )}
    </div>
  );
}
