import { CheckCircle2 } from 'lucide-react';
import { splitField } from '@/features/tours/components/tour-details/shared';
import type { TourDetailFromApi } from '@/features/tours/types';

interface TourOverviewSectionProps {
  tour: TourDetailFromApi;
}

/**
 * Khối "Tổng quan": các điểm nổi bật dạng chip + đoạn giới thiệu.
 *
 * `highlights` đứng trước phần mô tả dài vì đó là thứ người dùng quét mắt đầu tiên
 * khi cân nhắc giữa nhiều tour.
 */
export function TourOverviewSection({ tour }: TourOverviewSectionProps) {
  const highlights = splitField(tour.highlights);

  return (
    <div className="flex flex-col gap-6">
      {highlights.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {highlights.map((highlight) => (
            <li
              key={highlight}
              className="inline-flex items-center gap-1.5 rounded-full border border-accent bg-accent/30 px-3 py-1.5 text-xs font-semibold text-accent-foreground"
            >
              <CheckCircle2
                className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                aria-hidden="true"
              />
              {highlight}
            </li>
          ))}
        </ul>
      )}

      {tour.description ? (
        <p className="whitespace-pre-line text-[15px] leading-relaxed text-muted-foreground">
          {tour.description}
        </p>
      ) : (
        <p className="text-sm italic text-muted-foreground">
          Nhà tổ chức chưa cập nhật phần giới thiệu cho tour này.
        </p>
      )}
    </div>
  );
}
