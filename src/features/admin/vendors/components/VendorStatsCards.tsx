import { Ban, CheckCircle2, PauseCircle, Store } from 'lucide-react';
import type { VendorStatsResponse } from '../types';

interface VendorStatsCardsProps {
  stats?: VendorStatsResponse;
}

/**
 * 4 thẻ thống kê tổng quan cho màn Vendor Management.
 * Total Vendors dùng tổng thật từ API; Active/Inactive/Revoked dùng số
 * liệu tính qua `getStats()` (best-effort, xem ghi chú ở adminVendorService).
 */
export function VendorStatsCards({ stats }: VendorStatsCardsProps) {
  const cards = [
    {
      title: 'TỔNG SỐ NHÀ CUNG CẤP',
      value: stats?.total ?? 0,
      icon: Store,
      bgColor: '#F0EEE6',
      iconBg: '#E2E7E4',
      iconColor: '#06261D',
    },
    {
      title: 'ĐANG HOẠT ĐỘNG',
      value: stats?.active ?? 0,
      icon: CheckCircle2,
      bgColor: '#F0FDF4',
      iconBg: '#DCFCE7',
      iconColor: '#16A34A',
    },
    {
      title: 'NGỪNG HOẠT ĐỘNG',
      value: stats?.inactive ?? 0,
      icon: PauseCircle,
      bgColor: '#F5F5F5',
      iconBg: '#E5E5E5',
      iconColor: '#6F7B75',
    },
    {
      title: 'ĐÃ THU HỒI',
      value: stats?.revoked ?? 0,
      icon: Ban,
      bgColor: '#FFF5F5',
      iconBg: '#FEE2E2',
      iconColor: '#DC2626',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="flex items-center gap-4 rounded-3xl p-5 shadow-sm transition-all"
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
              <p
                className="text-[11px] font-bold uppercase tracking-wider"
                style={{ color: '#6F7B75' }}
              >
                {card.title}
              </p>
              <p className="text-2xl font-extrabold" style={{ color: '#06261D' }}>
                {card.value.toLocaleString('vi-VN')}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
