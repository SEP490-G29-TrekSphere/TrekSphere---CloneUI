import { Footprints, Trash2 } from 'lucide-react';
import type { SessionPorter } from '../types';

interface PorterCardProps {
  porters: SessionPorter[];
  onAddClick: () => void;
  onRemoveClick: (porter: SessionPorter) => void;
}

/** Thẻ "Đội Ngũ Porter" — cột phải của khối phân công nhân sự. */
export function PorterCard({ porters, onAddClick, onRemoveClick }: PorterCardProps) {
  return (
    <div className="rounded-[28px] p-6" style={{ backgroundColor: '#F0EEE6' }}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Footprints className="h-5 w-5" style={{ color: '#06261D' }} />
          <h3 className="text-lg font-bold" style={{ color: '#06261D' }}>
            Đội Ngũ Porter
          </h3>
        </div>
        <button
          type="button"
          onClick={onAddClick}
          className="rounded-full px-4 py-2 text-xs font-semibold text-white"
          style={{ backgroundColor: '#06261D' }}
        >
          Thêm Porter
        </button>
      </div>

      {porters.length === 0 ? (
        <p className="py-6 text-center text-sm" style={{ color: '#6F7B75' }}>
          Chưa có porter nào được phân công.
        </p>
      ) : (
        <div className="space-y-3">
          {porters.map((porter) => (
            <div
              key={porter.porterScheduleId}
              className="rounded-[20px] bg-white p-4"
              style={{ border: '1px solid #E6E2D1' }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col">
                  <span className="font-semibold" style={{ color: '#06261D' }}>
                    {porter.fullName}
                  </span>
                  <span className="text-xs" style={{ color: '#6F7B75' }}>
                    {porter.phone || '—'}
                  </span>
                </div>
                <button
                  type="button"
                  aria-label={`Gỡ ${porter.fullName}`}
                  onClick={() => onRemoveClick(porter)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-red-50"
                  style={{ color: '#DC2626' }}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {porter.note && (
                <p
                  className="mt-3 rounded-xl px-3 py-2 text-xs"
                  style={{ backgroundColor: '#F8F6EF', color: '#6F7B75' }}
                >
                  {porter.note}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
