import { Map as MapIcon, Ticket } from 'lucide-react';

interface VendorProfileKpiCardsProps {
  totalTours?: number;
  totalBookings?: number;
}

/**
 * 2 thẻ chỉ số có dữ liệu thật (tái dùng `useVendorTourStats`/`useVendorBookingStats`
 * đã có sẵn). Bỏ "Đánh giá trung bình" và "Doanh thu" vì API không có endpoint
 * thống kê tương ứng — xem spec.
 */
export function VendorProfileKpiCards({ totalTours, totalBookings }: VendorProfileKpiCardsProps) {
  const cards = [
    {
      title: 'TỔNG SỐ TOUR',
      value: totalTours ?? 0,
      icon: MapIcon,
      iconBg: '#DCEEE5',
      iconColor: '#06261D',
    },
    {
      title: 'TỔNG BOOKING',
      value: totalBookings ?? 0,
      icon: Ticket,
      iconBg: '#06261D',
      iconColor: '#FFFFFF',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="flex items-center gap-4 rounded-3xl p-5"
            style={{ backgroundColor: '#F6F4EB' }}
          >
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: card.iconBg, color: card.iconColor }}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-extrabold" style={{ color: '#06261D' }}>
                {card.value.toLocaleString('vi-VN')}
              </p>
              <p
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: '#6F7B75' }}
              >
                {card.title}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
