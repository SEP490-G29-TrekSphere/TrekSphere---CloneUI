import { ArrowLeftRight, CheckCircle2, CreditCard, Ticket } from 'lucide-react';
import type { BookingStats } from '../types';

interface BookingStatsCardsProps {
  stats?: BookingStats;
  onShowAll: () => void;
  onShowPendingPayments: () => void;
  onShowConfirmed: () => void;
  onShowPendingRefunds: () => void;
}

export function BookingStatsCards({
  stats,
  onShowAll,
  onShowPendingPayments,
  onShowConfirmed,
  onShowPendingRefunds,
}: BookingStatsCardsProps) {
  const cards = [
    {
      title: 'TỔNG ĐƠN ĐẶT',
      value: stats?.totalBookings ?? 0,
      icon: Ticket,
      bgColor: '#F4F8F5',
      iconBg: '#E2EFE7',
      iconColor: '#06261D',
      onClick: onShowAll,
    },
    {
      title: 'CHỜ THANH TOÁN',
      value: stats?.pendingPayments ?? 0,
      icon: CreditCard,
      bgColor: '#FFF5F5',
      iconBg: '#FEE2E2',
      iconColor: '#DC2626',
      onClick: onShowPendingPayments,
    },
    {
      title: 'ĐÃ XÁC NHẬN',
      value: stats?.confirmedTreks ?? 0,
      icon: CheckCircle2,
      bgColor: '#F0FDF4',
      iconBg: '#DCFCE7',
      iconColor: '#16A34A',
      onClick: onShowConfirmed,
    },
    {
      title: 'CẦN HOÀN TIỀN',
      value: stats?.pendingRefunds ?? 0,
      icon: ArrowLeftRight,
      bgColor: '#F5F5F5',
      iconBg: '#E5E5E5',
      iconColor: '#C2410C',
      onClick: onShowPendingRefunds,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <button
            type="button"
            onClick={card.onClick}
            key={card.title}
            className="flex items-center gap-4 rounded-3xl p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            style={{ backgroundColor: '#FFFFFF', border: '1px solid #E6E2D1' }}
          >
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
              style={{ backgroundColor: card.bgColor }}
            >
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ backgroundColor: card.iconBg, color: card.iconColor }}
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                {card.title}
              </p>
              <p className="text-2xl font-extrabold" style={{ color: '#06261D' }}>
                {card.value.toLocaleString('vi-VN')}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
