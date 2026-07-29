import { ChevronRight } from 'lucide-react';
import { formatDate } from '@/lib';
import { formatShortId } from '../services/vendorSessionService';
import type { VendorSessionSummary } from '../types';
import { SessionStatusBadge } from './SessionStatusBadge';

interface SessionTableRowProps {
  session: VendorSessionSummary;
  onClick: (session: VendorSessionSummary) => void;
}

/** 1 hàng trong bảng danh sách phiên tour — bấm cả hàng để mở trang Chi tiết. */
export function SessionTableRow({ session, onClick }: SessionTableRowProps) {
  return (
    <tr
      onClick={() => onClick(session)}
      className="cursor-pointer border-b transition-colors last:border-b-0 hover:bg-black/[0.02]"
      style={{ borderColor: '#E6E2D1' }}
    >
      <td className="px-6 py-4" style={{ verticalAlign: 'middle' }}>
        <div className="flex flex-col">
          <span className="font-semibold" style={{ color: '#06261D' }}>
            {session.tourName}
          </span>
          <span className="text-xs" style={{ color: '#6F7B75' }}>
            Mã phiên: {formatShortId(session.sessionId)}
          </span>
        </div>
      </td>

      <td className="px-6 py-4" style={{ verticalAlign: 'middle' }}>
        <span className="text-sm" style={{ color: '#6F7B75' }}>
          {formatDate(session.departureDate)} → {formatDate(session.returnDate)}
        </span>
      </td>

      <td className="px-6 py-4" style={{ verticalAlign: 'middle' }}>
        <SessionStatusBadge status={session.status} />
      </td>

      <td className="px-6 py-4 text-right" style={{ verticalAlign: 'middle' }}>
        <span
          className="inline-flex h-9 w-9 items-center justify-center rounded-full"
          style={{ backgroundColor: '#F0EEE6', color: '#06261D' }}
        >
          <ChevronRight className="h-4 w-4" />
        </span>
      </td>
    </tr>
  );
}
