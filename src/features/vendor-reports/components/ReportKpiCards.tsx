import { TrendingDown, TrendingUp } from 'lucide-react';
import type { DashboardOverview } from '../types';

interface ReportKpiCardsProps {
  overview?: DashboardOverview;
  isLoading?: boolean;
  isError?: boolean;
}

interface KpiCard {
  title: string;
  value: string;
  change: number;
  /**
   * Với tỷ lệ hủy tour, tăng là tín hiệu XẤU — phải tô đỏ dù số dương.
   * 3 chỉ số còn lại thì tăng là tốt.
   */
  invertTrend?: boolean;
}

/** VND không có phần lẻ nên luôn làm tròn trước khi hiển thị. */
function formatCompactCurrency(amount: number): string {
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)} tỷ`;
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)} tr`;
  return Math.round(amount).toLocaleString('vi-VN');
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

function TrendPill({ change, invertTrend }: { change: number; invertTrend?: boolean }) {
  // Coi thay đổi dưới 0.05% là đi ngang để tránh hiển thị "+0.0%" kèm mũi tên.
  const isFlat = Math.abs(change) < 0.05;
  const isUp = change > 0;
  const isGood = invertTrend ? !isUp : isUp;

  if (isFlat) {
    return (
      <span
        className="inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-bold"
        style={{ backgroundColor: '#F0EEE6', color: '#6F7B75' }}
      >
        Không đổi
      </span>
    );
  }

  const Icon = isUp ? TrendingUp : TrendingDown;
  const palette = isGood
    ? { backgroundColor: '#DCFCE7', color: '#15803D' }
    : { backgroundColor: '#FEE2E2', color: '#B91C1C' };

  return (
    <span
      className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold"
      style={palette}
    >
      <Icon className="h-3 w-3" />
      {isUp ? '+' : ''}
      {change.toFixed(1)}%
    </span>
  );
}

export function ReportKpiCards({ overview, isLoading, isError }: ReportKpiCardsProps) {
  const cards: KpiCard[] = [
    {
      title: 'TỔNG DOANH THU',
      value: `${formatCompactCurrency(overview?.totalRevenue ?? 0)} ₫`,
      change: overview?.revenueChangePercentage ?? 0,
    },
    {
      title: 'TỔNG LƯỢT KHÁCH',
      value: (overview?.totalTravelers ?? 0).toLocaleString('vi-VN'),
      change: overview?.travelersChangePercentage ?? 0,
    },
    {
      title: 'TỶ LỆ LẤP ĐẦY TB',
      value: formatPercent(overview?.avgOccupancyRate ?? 0),
      change: overview?.occupancyRateChangePercentage ?? 0,
    },
    {
      title: 'TỶ LỆ HỦY TOUR',
      value: formatPercent(overview?.cancellationRate ?? 0),
      change: overview?.cancellationRateChangePercentage ?? 0,
      invertTrend: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-3xl p-5 shadow-sm"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #E6E2D1' }}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
              {card.title}
            </p>
            {!isLoading && !isError && (
              <TrendPill change={card.change} invertTrend={card.invertTrend} />
            )}
          </div>

          {isLoading ? (
            <div className="mt-3 h-9 w-32 animate-pulse rounded-lg bg-[#F0EEE6]" />
          ) : isError ? (
            <p className="mt-3 text-3xl font-extrabold text-gray-300" title="Không tải được chỉ số">
              —
            </p>
          ) : (
            <p className="mt-3 text-3xl font-extrabold" style={{ color: '#06261D' }}>
              {card.value}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
