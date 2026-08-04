import { Compass, Flag, Loader2, Play } from 'lucide-react';
import type { CoordinatorSessionDetail } from '../types';

interface OperationsHeaderBarProps {
  session: CoordinatorSessionDetail;
  trekkerCount: number;
  onStart: () => void;
  onEnd: () => void;
  isStarting: boolean;
  isEnding: boolean;
}

const STATUS_LABEL: Record<CoordinatorSessionDetail['status'], string> = {
  PENDING: 'Sắp khởi hành',
  IN_PROGRESS: 'Đang diễn ra',
  COMPLETED: 'Đã hoàn thành',
  CANCELLED: 'Đã huỷ',
};

const STATUS_STYLE: Record<CoordinatorSessionDetail['status'], { bg: string; color: string }> = {
  PENDING: { bg: '#FEF3C7', color: '#92400E' },
  IN_PROGRESS: { bg: '#06261D', color: '#A2EBD2' },
  COMPLETED: { bg: '#DBEAFE', color: '#1E40AF' },
  CANCELLED: { bg: '#FEE2E2', color: '#991B1B' },
};

export function OperationsHeaderBar({
  session,
  trekkerCount,
  onStart,
  onEnd,
  isStarting,
  isEnding,
}: OperationsHeaderBarProps) {
  const lead = session.coordinators.find((c) => c.isLead) ?? session.coordinators[0];
  const statusStyle = STATUS_STYLE[session.status];

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
          style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}
        >
          {session.status === 'IN_PROGRESS' && (
            <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
          )}
          {STATUS_LABEL[session.status]}
        </span>
        <h1
          className="mt-2 text-3xl font-extrabold tracking-tight flex items-center gap-2"
          style={{ color: '#06261D' }}
        >
          <Compass className="h-7 w-7" />
          {session.tourName}
        </h1>
        <p className="mt-1 text-sm font-medium" style={{ color: '#6F7B75' }}>
          {[lead ? `Điều phối viên: ${lead.fullName}` : null, `${trekkerCount} Trekkers`]
            .filter(Boolean)
            .join(' • ')}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onStart}
          disabled={session.status !== 'PENDING' || isStarting}
          className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white"
          style={{ borderColor: '#D8D3C4', color: '#06261D', backgroundColor: '#FFFFFF' }}
        >
          {isStarting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          Bắt đầu Tour
        </button>
        <button
          type="button"
          onClick={onEnd}
          disabled={session.status !== 'IN_PROGRESS' || isEnding}
          className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
          style={{ backgroundColor: '#06261D' }}
        >
          {isEnding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Flag className="h-4 w-4" />}
          Kết thúc Tour
        </button>
      </div>
    </div>
  );
}
