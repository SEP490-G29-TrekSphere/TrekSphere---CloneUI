import { Mountain, ShieldAlert } from 'lucide-react';
import type { TopTourItem } from '../types';

interface TopToursCardProps {
  tours?: TopTourItem[];
  isLoading?: boolean;
  isError?: boolean;
}

/** Màu huy hiệu cho 3 hạng đầu, từ hạng 4 trở đi dùng màu trung tính. */
const RANK_STYLES = [
  { backgroundColor: '#06261D', color: '#FFFFFF' },
  { backgroundColor: '#A2EBD2', color: '#06261D' },
  { backgroundColor: '#FEF3C7', color: '#B45309' },
];

function rankStyle(index: number) {
  return RANK_STYLES[index] ?? { backgroundColor: '#F0EEE6', color: '#6F7B75' };
}

export function TopToursCard({ tours, isLoading, isError }: TopToursCardProps) {
  const items = tours ?? [];

  return (
    <div
      className="rounded-3xl p-6 shadow-sm"
      style={{ backgroundColor: '#FFFFFF', border: '1px solid #E6E2D1' }}
    >
      <h2 className="text-lg font-extrabold" style={{ color: '#06261D' }}>
        Tour bán chạy nhất
      </h2>
      <p className="mb-5 text-xs font-medium" style={{ color: '#6F7B75' }}>
        Xếp theo số lượt khách đăng ký
      </p>

      {isLoading ? (
        <div className="space-y-3">
          {['a', 'b', 'c', 'd', 'e'].map((key) => (
            <div key={key} className="h-16 animate-pulse rounded-2xl bg-[#F5F3EC]" />
          ))}
        </div>
      ) : isError ? (
        <div className="flex h-64 flex-col items-center justify-center gap-2 text-sm text-red-500">
          <ShieldAlert className="h-8 w-8" />
          <span className="text-center">Không tải được bảng xếp hạng tour.</span>
        </div>
      ) : items.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-1">
          <Mountain className="mb-1 h-8 w-8 text-gray-300" />
          <p className="text-sm font-semibold" style={{ color: '#06261D' }}>
            Chưa có tour nào bán được
          </p>
          <p className="text-xs text-gray-400">Thử mở rộng khoảng thời gian thống kê.</p>
        </div>
      ) : (
        <ol className="space-y-3">
          {items.map((tour, index) => {
            return (
              <li
                key={tour.tourId || tour.tourName}
                className="flex items-center gap-3 rounded-2xl p-3"
                style={{ backgroundColor: '#FAF8F1' }}
              >
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold"
                  style={rankStyle(index)}
                >
                  {index + 1}
                </span>

                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-sm font-bold leading-tight"
                    style={{ color: '#06261D' }}
                    title={tour.tourName}
                  >
                    {tour.tourName}
                  </p>
                  <p className="text-[11px] font-semibold" style={{ color: '#6F7B75' }}>
                    {tour.totalTravelers.toLocaleString('vi-VN')} khách
                  </p>
                </div>

                <p className="shrink-0 text-sm font-extrabold" style={{ color: '#06261D' }}>
                  {Math.round(tour.totalRevenue).toLocaleString('vi-VN')} ₫
                </p>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
