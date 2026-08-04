import { Mountain } from 'lucide-react';

interface AltitudeTrackerWidgetProps {
  currentAltitude?: number;
  targetAltitude?: number;
}

export function AltitudeTrackerWidget({
  currentAltitude,
  targetAltitude,
}: AltitudeTrackerWidgetProps) {
  const hasData =
    currentAltitude !== undefined && targetAltitude !== undefined && targetAltitude > 0;
  const progress = hasData
    ? Math.min(100, Math.round(((currentAltitude as number) / (targetAltitude as number)) * 100))
    : 0;

  return (
    <div className="rounded-3xl p-5" style={{ backgroundColor: '#EFECE6' }}>
      <div className="flex items-center gap-2">
        <Mountain className="h-5 w-5" style={{ color: '#06261D' }} />
        <span className="text-xs font-bold uppercase tracking-wide" style={{ color: '#6F7B75' }}>
          Độ cao hiện tại
        </span>
      </div>

      {hasData ? (
        <>
          <p className="mt-1 text-3xl font-extrabold" style={{ color: '#06261D' }}>
            {currentAltitude?.toLocaleString('vi-VN')}m
          </p>
          <div
            className="mt-3 h-2 w-full overflow-hidden rounded-full"
            style={{ backgroundColor: '#D8D3C4' }}
          >
            <div
              className="h-full rounded-full"
              style={{ width: `${progress}%`, backgroundColor: '#06261D' }}
            />
          </div>
          <p className="mt-2 text-xs font-semibold" style={{ color: '#6F7B75' }}>
            Cần đạt: {targetAltitude?.toLocaleString('vi-VN')}m
          </p>
        </>
      ) : (
        <p className="mt-2 text-xs font-medium" style={{ color: '#6F7B75' }}>
          Chưa có dữ liệu độ cao — dữ liệu sẽ hiện sau khi check-in trạm dừng đầu tiên.
        </p>
      )}
    </div>
  );
}
