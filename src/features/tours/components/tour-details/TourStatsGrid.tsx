import { Mountain, Route, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  DIFFICULTY_LABELS,
  DIFFICULTY_LEVEL,
} from '@/features/tours/components/tour-details/shared';
import type { TourDetailFromApi } from '@/features/tours/types';
import { cn } from '@/lib/utils';

interface TourStatsGridProps {
  tour: TourDetailFromApi;
}

/** Một ô thông số: nhãn nhỏ ở trên, giá trị lớn ở dưới, chú thích tuỳ chọn. */
function StatTile({
  icon,
  label,
  value,
  hint,
  children,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  hint?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-[11px] font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-xl font-bold leading-none text-foreground">{value}</p>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

/**
 * Meter độ khó: 5 vạch trên cùng một hue, đậm dần theo bậc.
 *
 * Đây là thang thứ tự nên phần chưa đạt dùng chính hue đó ở sắc nhạt (không phải
 * màu khác) — trạng thái đọc được xuyên suốt cả thanh.
 */
function DifficultyMeter({ level }: { level: number }) {
  return (
    <div className="flex gap-1" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((step) => (
        <span
          key={step}
          className={cn(
            'h-1.5 flex-1 rounded-full',
            step <= level ? 'bg-primary' : 'bg-primary/15'
          )}
        />
      ))}
    </div>
  );
}

/**
 * Dải thông số tour — độ khó, quãng đường, quy mô đoàn.
 *
 * `totalDistanceKm` và `minCapacity`/`maxCapacity` đã có sẵn trong `GET /tours/{id}`
 * nhưng trước đây không được hiển thị ở đâu trên trang chi tiết.
 */
export function TourStatsGrid({ tour }: TourStatsGridProps) {
  const difficultyLevel = DIFFICULTY_LEVEL[tour.difficulty] ?? 3;
  const difficultyLabel = DIFFICULTY_LABELS[tour.difficulty] ?? tour.difficulty;

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <StatTile
        icon={<Mountain className="h-4 w-4" />}
        label="Độ khó"
        value={difficultyLabel}
        hint={`Bậc ${difficultyLevel}/5`}
      >
        <DifficultyMeter level={difficultyLevel} />
      </StatTile>

      <StatTile
        icon={<Route className="h-4 w-4" />}
        label="Quãng đường"
        value={tour.totalDistanceKm > 0 ? `${tour.totalDistanceKm} km` : 'Đang cập nhật'}
        hint={`Trong ${tour.durationDays} ngày`}
      />

      <StatTile
        icon={<Users className="h-4 w-4" />}
        label="Quy mô đoàn"
        value={`${tour.minCapacity}–${tour.maxCapacity} người`}
        hint={`Khởi hành tối thiểu ${tour.minCapacity} khách`}
      />
    </div>
  );
}
