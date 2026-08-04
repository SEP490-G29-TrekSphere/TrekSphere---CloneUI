import { Loader2, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { AttendanceType, ParticipantAttendanceItem, SessionTrekker } from '../types';

interface TrekkersPanelProps {
  trekkers: SessionTrekker[];
  isLoading: boolean;
  isSubmitting: boolean;
  onSubmit: (attendanceType: AttendanceType, participants: ParticipantAttendanceItem[]) => void;
}

export function TrekkersPanel({ trekkers, isLoading, isSubmitting, onSubmit }: TrekkersPanelProps) {
  const [presence, setPresence] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setPresence((prev) => {
      const next: Record<string, boolean> = {};
      for (const t of trekkers) {
        next[t.participantId] = prev[t.participantId] ?? true;
      }
      return next;
    });
  }, [trekkers]);

  const presentCount = trekkers.filter((t) => presence[t.participantId]).length;

  const handleSubmit = (attendanceType: AttendanceType) => {
    const participants: ParticipantAttendanceItem[] = trekkers.map((t) => ({
      participantId: t.participantId,
      isPresent: presence[t.participantId] ?? true,
    }));
    onSubmit(attendanceType, participants);
  };

  return (
    <div className="rounded-3xl p-5" style={{ backgroundColor: '#EFECE6' }}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-bold" style={{ color: '#06261D' }}>
          <Users className="h-4 w-4" />
          Trekkers ({trekkers.length})
        </h2>
        {trekkers.length > 0 && (
          <span
            className="rounded-full px-2.5 py-0.5 text-xs font-bold"
            style={{ backgroundColor: 'rgba(162, 235, 210, 0.5)', color: '#06261D' }}
          >
            Có mặt: {presentCount}/{trekkers.length}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="flex h-24 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin" style={{ color: '#6F7B75' }} />
        </div>
      ) : trekkers.length === 0 ? (
        <p className="text-xs font-medium" style={{ color: '#6F7B75' }}>
          Không tìm thấy khách đã xác nhận cho phiên tour này.
        </p>
      ) : (
        <>
          <ul className="space-y-1.5">
            {trekkers.map((t) => (
              <li key={t.participantId}>
                <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-1.5 hover:bg-white/60">
                  <span className="text-sm font-medium" style={{ color: '#06261D' }}>
                    {t.fullName}
                  </span>
                  <input
                    type="checkbox"
                    checked={presence[t.participantId] ?? true}
                    onChange={(e) =>
                      setPresence((prev) => ({ ...prev, [t.participantId]: e.target.checked }))
                    }
                    className="h-4 w-4 accent-emerald-700"
                  />
                </label>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => handleSubmit('START')}
              disabled={isSubmitting}
              className="flex-1 rounded-full px-3 py-2 text-xs font-bold transition-all disabled:opacity-50"
              style={{ backgroundColor: '#FFFFFF', color: '#06261D', border: '1px solid #D8D3C4' }}
            >
              Điểm danh xuất phát
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('END')}
              disabled={isSubmitting}
              className="flex-1 rounded-full px-3 py-2 text-xs font-bold text-white transition-all disabled:opacity-50"
              style={{ backgroundColor: '#06261D' }}
            >
              Điểm danh kết thúc
            </button>
          </div>
        </>
      )}
    </div>
  );
}
