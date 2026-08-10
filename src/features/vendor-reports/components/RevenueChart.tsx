import { ShieldAlert } from 'lucide-react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { GroupBy, RevenueChartPoint } from '../types';

interface RevenueChartProps {
  data?: RevenueChartPoint[];
  groupBy: GroupBy;
  onGroupByChange: (groupBy: GroupBy) => void;
  isLoading?: boolean;
  isError?: boolean;
}

const GROUP_BY_OPTIONS: Array<{ value: GroupBy; label: string }> = [
  { value: 'DAY', label: 'Ngày' },
  { value: 'MONTH', label: 'Tháng' },
];

const REVENUE_COLOR = '#06261D';
const BOOKING_COLOR = '#F59E0B';

function formatAxisRevenue(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)} tỷ`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)} tr`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
  return String(value);
}

interface TooltipEntry {
  dataKey?: string | number;
  value?: number;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  const revenue = payload.find((entry) => entry.dataKey === 'revenue')?.value ?? 0;
  const bookings = payload.find((entry) => entry.dataKey === 'bookingCount')?.value ?? 0;

  return (
    <div
      className="rounded-2xl px-4 py-3 shadow-lg"
      style={{ backgroundColor: '#FFFFFF', border: '1px solid #E6E2D1' }}
    >
      <p className="mb-2 text-xs font-bold" style={{ color: '#06261D' }}>
        {label}
      </p>
      <p className="flex items-center gap-2 text-xs font-semibold" style={{ color: '#6F7B75' }}>
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: REVENUE_COLOR }} />
        Doanh thu:
        <span className="font-extrabold" style={{ color: '#06261D' }}>
          {Math.round(revenue).toLocaleString('vi-VN')} ₫
        </span>
      </p>
      <p className="flex items-center gap-2 text-xs font-semibold" style={{ color: '#6F7B75' }}>
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: BOOKING_COLOR }} />
        Số booking:
        <span className="font-extrabold" style={{ color: '#06261D' }}>
          {bookings.toLocaleString('vi-VN')}
        </span>
      </p>
    </div>
  );
}

export function RevenueChart({
  data,
  groupBy,
  onGroupByChange,
  isLoading,
  isError,
}: RevenueChartProps) {
  const points = data ?? [];

  return (
    <div
      className="rounded-3xl p-6 shadow-sm"
      style={{ backgroundColor: '#FFFFFF', border: '1px solid #E6E2D1' }}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold" style={{ color: '#06261D' }}>
            Doanh thu theo thời gian
          </h2>
          <div
            className="mt-1 flex items-center gap-4 text-[11px] font-bold"
            style={{ color: '#6F7B75' }}
          >
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: REVENUE_COLOR }} />
              Doanh thu
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: BOOKING_COLOR }}
              />
              Booking
            </span>
          </div>
        </div>

        {/* Cách gộp cột — chỉ tác động lên biểu đồ này */}
        <div
          className="flex items-center gap-1 rounded-full p-1"
          style={{ backgroundColor: '#EFECE6' }}
        >
          {GROUP_BY_OPTIONS.map((option) => {
            const isActive = groupBy === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onGroupByChange(option.value)}
                className="rounded-full px-3.5 py-1.5 text-[11px] font-bold transition-all"
                style={
                  isActive ? { backgroundColor: '#A2EBD2', color: '#06261D' } : { color: '#6F7B75' }
                }
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <div className="h-72 animate-pulse rounded-2xl bg-[#F5F3EC]" />
      ) : isError ? (
        <div className="flex h-72 flex-col items-center justify-center gap-2 text-sm text-red-500">
          <ShieldAlert className="h-8 w-8" />
          <span>Không tải được dữ liệu biểu đồ doanh thu.</span>
        </div>
      ) : points.length === 0 ? (
        <div className="flex h-72 flex-col items-center justify-center gap-1">
          <p className="text-base font-semibold" style={{ color: '#06261D' }}>
            Chưa có doanh thu
          </p>
          <p className="text-xs text-gray-400">
            Không có giao dịch nào trong khoảng thời gian đã chọn.
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={288}>
          <ComposedChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="#F0EEE6" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: '#6F7B75', fontWeight: 600 }}
              tickLine={false}
              axisLine={{ stroke: '#E6E2D1' }}
            />
            <YAxis
              yAxisId="revenue"
              tickFormatter={formatAxisRevenue}
              tick={{ fontSize: 11, fill: '#6F7B75', fontWeight: 600 }}
              tickLine={false}
              axisLine={false}
              width={56}
            />
            <YAxis
              yAxisId="bookings"
              orientation="right"
              allowDecimals={false}
              tick={{ fontSize: 11, fill: BOOKING_COLOR, fontWeight: 600 }}
              tickLine={false}
              axisLine={false}
              width={36}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(162, 235, 210, 0.25)' }} />
            <Bar
              yAxisId="revenue"
              dataKey="revenue"
              fill={REVENUE_COLOR}
              radius={[6, 6, 0, 0]}
              maxBarSize={44}
            />
            <Line
              yAxisId="bookings"
              type="monotone"
              dataKey="bookingCount"
              stroke={BOOKING_COLOR}
              strokeWidth={2.5}
              dot={{ r: 3, fill: BOOKING_COLOR, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
