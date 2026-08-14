import { Briefcase, X } from 'lucide-react';
import type { SessionCoordinator } from '../types';

interface CoordinatorCardProps {
  coordinators: SessionCoordinator[];
  onAddClick: () => void;
  onRemoveClick: (coordinator: SessionCoordinator) => void;
}

/** Thẻ "Điều Phối Viên (Coordinators)" — cột trái của khối phân công nhân sự. */
export function CoordinatorCard({ coordinators, onAddClick, onRemoveClick }: CoordinatorCardProps) {
  const sorted = [...coordinators].sort((a, b) => Number(b.isLead) - Number(a.isLead));

  return (
    <div className="rounded-[28px] p-6" style={{ backgroundColor: '#F0EEE6' }}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" style={{ color: '#06261D' }} />
          <h3 className="text-lg font-bold" style={{ color: '#06261D' }}>
            Điều Phối Viên (Coordinators)
          </h3>
        </div>
        <button
          type="button"
          onClick={onAddClick}
          className="rounded-full px-4 py-2 text-xs font-semibold"
          style={{ backgroundColor: '#FFFFFF', color: '#06261D', border: '1px solid #D8D3C4' }}
        >
          + Chỉ định thêm
        </button>
      </div>

      {sorted.length === 0 ? (
        <p className="py-6 text-center text-sm" style={{ color: '#6F7B75' }}>
          Chưa có hướng dẫn viên nào được phân công.
        </p>
      ) : (
        <div className="space-y-3">
          {sorted.map((coordinator) => (
            <div
              key={coordinator.coordinatorScheduleId}
              className="rounded-[20px] bg-white p-4"
              style={
                coordinator.isLead
                  ? { border: '2px solid #06261D' }
                  : { border: '1px solid #E6E2D1' }
              }
            >
              {coordinator.isLead && (
                <span
                  className="mb-2 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
                  style={{ backgroundColor: '#06261D' }}
                >
                  Lead Coordinator
                </span>
              )}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-bold"
                    style={{ backgroundColor: '#F0EEE6', color: '#06261D' }}
                  >
                    {coordinator.avatar ? (
                      <img
                        src={coordinator.avatar}
                        alt={coordinator.fullName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span>{coordinator.fullName.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold" style={{ color: '#06261D' }}>
                      {coordinator.fullName}
                    </span>
                    <span className="text-xs" style={{ color: '#6F7B75' }}>
                      {coordinator.phone || coordinator.email || '—'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label={`Gỡ ${coordinator.fullName}`}
                  onClick={() => onRemoveClick(coordinator)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-red-50"
                  style={{ color: '#DC2626' }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
