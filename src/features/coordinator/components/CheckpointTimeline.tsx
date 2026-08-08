import { Check, Loader2, MapPinPlus, SkipForward, Target } from 'lucide-react';
import { useState } from 'react';
import type { SessionCheckpointStatus } from '../types';

interface CheckpointTimelineProps {
  /**
   * Trạm dừng kèm trạng thái check-in — lấy từ
   * `GET /tracking/sessions/{id}/checkpoint-logs`, đã sắp theo thứ tự hành trình.
   */
  checkpoints: SessionCheckpointStatus[];
  canCheckin: boolean;
  isCheckingIn: boolean;
  onCheckin: (note?: string) => void;
  isLoading: boolean;
}

export function CheckpointTimeline({
  checkpoints,
  canCheckin,
  isCheckingIn,
  onCheckin,
  isLoading,
}: CheckpointTimelineProps) {
  const [note, setNote] = useState('');

  // Trạm kế tiếp cần check-in = trạm PENDING đầu tiên theo thứ tự. Suy ra từ
  // trạng thái BE trả về nên reload trang vẫn hiện đúng trạm đang chờ.
  const currentCheckpointId = checkpoints.find((cp) => cp.status === 'PENDING')?.checkpointId;
  const reachedCount = checkpoints.filter((cp) => cp.status === 'REACHED').length;

  const handleCheckin = () => {
    onCheckin(note.trim() || undefined);
    setNote('');
  };

  return (
    <div className="rounded-3xl p-6" style={{ backgroundColor: '#EFECE6' }}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold" style={{ color: '#06261D' }}>
          Lộ trình Check-in
        </h2>
        <span
          className="inline-flex items-center gap-1.5 text-xs font-semibold"
          style={{ color: '#6F7B75' }}
        >
          <MapPinPlus className="h-4 w-4" />
          {reachedCount}/{checkpoints.length} trạm dừng
        </span>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: '#6F7B75' }} />
        </div>
      ) : checkpoints.length === 0 ? (
        <p className="text-sm font-medium" style={{ color: '#6F7B75' }}>
          Tour này chưa được thiết lập trạm dừng.
        </p>
      ) : (
        <ul className="space-y-3">
          {checkpoints.map((cp) => {
            const isReached = cp.status === 'REACHED';
            const isSkipped = cp.status === 'SKIPPED';
            const isCurrent = cp.checkpointId === currentCheckpointId;

            return (
              <li
                key={cp.checkpointId}
                className="rounded-2xl p-4"
                style={{ backgroundColor: isCurrent ? '#E3DECF' : 'transparent' }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: isReached
                        ? '#06261D'
                        : isCurrent
                          ? '#FFFFFF'
                          : 'transparent',
                      border: isCurrent
                        ? '2px solid #06261D'
                        : isReached
                          ? 'none'
                          : '2px solid #C9C3B2',
                    }}
                  >
                    {isReached ? (
                      <Check className="h-3.5 w-3.5" style={{ color: '#FFFFFF' }} />
                    ) : isSkipped ? (
                      <SkipForward className="h-3.5 w-3.5" style={{ color: '#6F7B75' }} />
                    ) : isCurrent ? (
                      <Target className="h-3.5 w-3.5" style={{ color: '#06261D' }} />
                    ) : null}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-sm ${isCurrent ? 'font-bold' : 'font-semibold'}`}
                        style={{ color: '#06261D' }}
                      >
                        Trạm {cp.checkpointOrder}: {cp.checkpointName}
                      </span>
                      {(isReached || isSkipped) && (
                        <span
                          className="text-xs font-semibold shrink-0"
                          style={{ color: '#6F7B75' }}
                        >
                          {isReached ? 'Hoàn tất' : 'Đã bỏ qua'}
                        </span>
                      )}
                    </div>
                    {cp.description && (
                      <p className="mt-0.5 text-xs font-medium" style={{ color: '#6F7B75' }}>
                        {cp.description}
                      </p>
                    )}

                    {isCurrent && canCheckin && (
                      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                        <input
                          type="text"
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          placeholder="Ghi chú (tuỳ chọn)..."
                          className="flex-1 rounded-full border px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                          style={{ borderColor: '#D8D3C4', backgroundColor: '#FFFFFF' }}
                        />
                        <button
                          type="button"
                          onClick={handleCheckin}
                          disabled={isCheckingIn}
                          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold text-white transition-all disabled:opacity-50"
                          style={{ backgroundColor: '#06261D' }}
                        >
                          {isCheckingIn && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                          Check-in
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
