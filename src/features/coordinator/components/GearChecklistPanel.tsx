import { Backpack, Loader2 } from 'lucide-react';
import type { SessionEquipmentAllocation } from '../types';

interface GearChecklistPanelProps {
  equipments: SessionEquipmentAllocation[];
  checkedMap: Record<string, boolean>;
  pendingId?: string;
  onToggle: (sessionEquipmentId: string, next: boolean) => void;
}

export function GearChecklistPanel({
  equipments,
  checkedMap,
  pendingId,
  onToggle,
}: GearChecklistPanelProps) {
  return (
    <div className="rounded-3xl p-5" style={{ backgroundColor: '#EFECE6' }}>
      <h2 className="mb-3 flex items-center gap-2 text-sm font-bold" style={{ color: '#06261D' }}>
        <Backpack className="h-4 w-4" />
        Kiểm tra trang bị
      </h2>

      {equipments.length === 0 ? (
        <p className="text-xs font-medium" style={{ color: '#6F7B75' }}>
          Phiên tour chưa được cấp phát trang bị.
        </p>
      ) : (
        <ul className="space-y-2">
          {equipments.map((eq) => {
            const isChecked = checkedMap[eq.sessionEquipmentId] ?? false;
            const isPending = pendingId === eq.sessionEquipmentId;

            return (
              <li key={eq.sessionEquipmentId}>
                <button
                  type="button"
                  onClick={() => onToggle(eq.sessionEquipmentId, !isChecked)}
                  disabled={isPending}
                  className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-white/60 disabled:opacity-60"
                >
                  <span className="text-sm font-medium" style={{ color: '#06261D' }}>
                    {eq.equipmentName} ({eq.quantity})
                  </span>
                  {isPending ? (
                    <Loader2
                      className="h-5 w-5 shrink-0 animate-spin"
                      style={{ color: '#6F7B75' }}
                    />
                  ) : (
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2"
                      style={{
                        borderColor: isChecked ? '#06261D' : '#C9C3B2',
                        backgroundColor: isChecked ? '#06261D' : 'transparent',
                      }}
                    >
                      {isChecked && (
                        <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none">
                          <path
                            d="M3 8.5L6.2 11.5L13 4.5"
                            stroke="#FFFFFF"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
