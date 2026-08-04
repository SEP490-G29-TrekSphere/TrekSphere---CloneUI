import { Footprints, Loader2, MapPin, ShieldCheck } from 'lucide-react';
import type { SosAlert } from '../types';
import { formatRelativeTime, formatSenderRole, formatSosCode } from '../utils/formatRelativeTime';

interface SosAlertCardProps {
  alert: SosAlert;
  isSelected: boolean;
  onSelect: () => void;
  onResolve: () => void;
  isResolving: boolean;
}

export function SosAlertCard({
  alert,
  isSelected,
  onSelect,
  onResolve,
  isResolving,
}: SosAlertCardProps) {
  const isResolved = alert.status === 'RESOLVED';

  return (
    <div
      role="button"
      tabIndex={0}
      className="rounded-[28px] p-5 cursor-pointer transition-all"
      style={{
        backgroundColor: '#EFECE6',
        borderLeft: `4px solid ${isResolved ? '#6F7B75' : '#D32F2F'}`,
        outline: isSelected ? '2px solid #06261D' : 'none',
        outlineOffset: '-2px',
      }}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-extrabold" style={{ color: '#06261D' }}>
          {formatSosCode(alert.sosAlertId)}
        </span>
        <span
          className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
          style={
            isResolved
              ? { backgroundColor: '#DCFCE7', color: '#166534' }
              : { backgroundColor: '#FEE2E2', color: '#D32F2F' }
          }
        >
          {isResolved ? 'Đã xử lý' : 'Đang chờ'}
        </span>
      </div>

      <p
        className="mt-2 flex items-center gap-1.5 text-sm font-semibold"
        style={{ color: '#06261D' }}
      >
        <Footprints className="h-4 w-4 shrink-0" />
        Tour: {alert.tourName}
      </p>

      {alert.message && (
        <p className="mt-1 text-xs font-medium italic" style={{ color: '#6F7B75' }}>
          "{alert.message}"
        </p>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="block font-bold uppercase tracking-wide" style={{ color: '#6F7B75' }}>
            Người gửi
          </span>
          <span className="font-semibold" style={{ color: '#06261D' }}>
            {alert.senderName} ({formatSenderRole(alert.senderRole)})
          </span>
        </div>
        <div>
          <span className="block font-bold uppercase tracking-wide" style={{ color: '#6F7B75' }}>
            Thời gian
          </span>
          <span className="font-semibold" style={{ color: '#06261D' }}>
            {formatRelativeTime(alert.createdAt)}
          </span>
        </div>
      </div>

      {isResolved ? (
        alert.resolvedByName && (
          <p
            className="mt-3 flex items-center gap-1.5 text-xs font-semibold"
            style={{ color: '#166534' }}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Đã cứu hộ bởi {alert.resolvedByName}
          </p>
        )
      ) : (
        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onResolve();
            }}
            disabled={isResolving}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold text-white transition-all disabled:opacity-60"
            style={{ backgroundColor: '#06261D' }}
          >
            {isResolving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Đánh dấu đã cứu hộ
          </button>
          <button
            type="button"
            aria-label="Xem trên bản đồ"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white transition-colors"
            style={{ border: '1px solid #D8D3C4', color: '#06261D' }}
          >
            <MapPin className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
