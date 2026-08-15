import { Clock, Mountain, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { DIFFICULTY_LABELS } from '@/features/tours/components/tour-details/shared';
import type { TourDetailFromApi } from '@/features/tours/types';

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
 * Dải thông số tour — độ khó, thời gian chuyến đi, quy mô đoàn.
 */
export function TourStatsGrid({ tour }: TourStatsGridProps) {
  const difficultyLabel = DIFFICULTY_LABELS[tour.difficulty] ?? tour.difficulty;
  const durationText = `${tour.durationDays} ngày`;

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <StatTile icon={<Mountain className="h-4 w-4" />} label="Độ khó" value={difficultyLabel} />

      <StatTile
        icon={<Clock className="h-4 w-4" />}
        label="Thời gian chuyến đi"
        value={durationText}
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
