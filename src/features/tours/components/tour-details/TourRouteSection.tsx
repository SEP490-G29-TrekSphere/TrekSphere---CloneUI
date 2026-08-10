import { Flag, MapPin, Mountain } from 'lucide-react';
import { handleImageFallback } from '@/features/tours/components/tour-details/shared';
import type { TourCheckpoint } from '@/features/tours/types';

interface TourRouteSectionProps {
  checkpoints?: TourCheckpoint[];
  isLoading?: boolean;
}

/** Toạ độ chỉ hiện khi có ít nhất một trong hai trục — tránh dòng meta trống. */
function CheckpointCoordinates({ checkpoint }: { checkpoint: TourCheckpoint }) {
  const { latitude, longitude } = checkpoint;
  if (latitude == null && longitude == null) return null;

  return (
    <p className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-muted-foreground">
      {latitude != null && <span>Vĩ độ {latitude.toFixed(5)}</span>}
      {longitude != null && <span>Kinh độ {longitude.toFixed(5)}</span>}
    </p>
  );
}

/**
 * Lộ trình các trạm dừng — timeline dọc dựng từ `GET /tours/{id}/checkpoints`.
 *
 * Đây là dữ liệu hành trình thật duy nhất mà API trả về; bản trước của trang tự
 * chia `highlights` thành "Ngày 1 / Ngày 2 / …" nên hiển thị một lịch trình không
 * hề tồn tại trong dữ liệu.
 */
export function TourRouteSection({ checkpoints, isLoading }: TourRouteSectionProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {['a', 'b', 'c'].map((key) => (
          <div key={key} className="h-24 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
    );
  }

  const sorted = [...(checkpoints ?? [])].sort((a, b) => a.checkpointOrder - b.checkpointOrder);

  if (sorted.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
        <MapPin className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">
          Nhà tổ chức chưa công bố lộ trình chi tiết cho tour này.
        </p>
      </div>
    );
  }

  return (
    <ol className="relative flex flex-col gap-6 pl-10">
      {/* Đường trục dọc nối các trạm */}
      <span className="absolute bottom-4 left-[13px] top-4 w-0.5 bg-border" aria-hidden="true" />

      {sorted.map((checkpoint, index) => {
        const isLast = index === sorted.length - 1;
        return (
          <li key={checkpoint.checkpointId} className="relative">
            {/* Mốc số thứ tự; trạm cuối tô đặc để thấy rõ điểm kết thúc */}
            <span
              className={`absolute -left-10 top-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-primary text-[11px] font-bold ${
                isLast ? 'bg-primary text-primary-foreground' : 'bg-background text-primary'
              }`}
            >
              {isLast ? (
                <Flag className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                checkpoint.checkpointOrder
              )}
            </span>

            <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-base font-bold text-foreground">{checkpoint.checkpointName}</h3>
                {!!checkpoint.altitude && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 font-mono text-[11px] font-semibold text-muted-foreground">
                    <Mountain className="h-3 w-3" aria-hidden="true" />
                    {checkpoint.altitude}m
                  </span>
                )}
              </div>

              {checkpoint.description && (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {checkpoint.description}
                </p>
              )}

              {checkpoint.checkpointImageUrl && (
                <img
                  src={checkpoint.checkpointImageUrl}
                  alt={checkpoint.checkpointName}
                  onError={handleImageFallback}
                  loading="lazy"
                  className="mt-1 h-48 w-full rounded-xl object-cover sm:max-w-md"
                />
              )}

              <CheckpointCoordinates checkpoint={checkpoint} />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
