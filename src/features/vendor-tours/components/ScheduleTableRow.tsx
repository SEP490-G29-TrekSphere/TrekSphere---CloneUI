import { Pencil, Trash2 } from 'lucide-react';
import { formatDate, formatPrice } from '@/utils/format';
import type { TourSchedule } from '../types';
import { ScheduleStatusBadge } from './ScheduleStatusBadge';

interface ScheduleTableRowProps {
  schedule: TourSchedule;
  onEditClick: (schedule: TourSchedule) => void;
  /** Chỉ truyền (màn Manager) nếu muốn hiện nút Hủy lịch — Staff không có quyền này. */
  onDeleteClick?: (schedule: TourSchedule) => void;
}

export function ScheduleTableRow({ schedule, onEditClick, onDeleteClick }: ScheduleTableRowProps) {
  const hasBookings = schedule.bookedSlots > 0;

  return (
    <tr className="border-b transition-colors last:border-b-0" style={{ borderColor: '#E6E2D1' }}>
      <td className="px-6 py-4" style={{ verticalAlign: 'middle' }}>
        <span className="font-semibold" style={{ color: '#06261D' }}>
          {formatDate(schedule.departureDate)}
        </span>
      </td>

      <td className="px-6 py-4" style={{ verticalAlign: 'middle' }}>
        <span className="text-sm font-medium" style={{ color: '#6F7B75' }}>
          {formatDate(schedule.returnDate)}
        </span>
      </td>

      <td className="px-6 py-4" style={{ verticalAlign: 'middle' }}>
        <span className="font-semibold" style={{ color: '#06261D' }}>
          {formatPrice(schedule.price)}đ
        </span>
      </td>

      <td className="px-6 py-4" style={{ verticalAlign: 'middle' }}>
        <span className="text-sm font-medium" style={{ color: '#06261D' }}>
          {schedule.bookedSlots}/{schedule.availableSlots}
        </span>
      </td>

      <td className="px-6 py-4" style={{ verticalAlign: 'middle' }}>
        <ScheduleStatusBadge status={schedule.status} />
      </td>

      <td className="px-6 py-4" style={{ verticalAlign: 'middle' }}>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onEditClick(schedule)}
            className="transition-opacity hover:opacity-70"
            style={{ color: '#06261D' }}
            title="Sửa lịch khởi hành"
          >
            <Pencil className="h-4 w-4" />
          </button>
          {onDeleteClick && (
            <button
              type="button"
              onClick={() => onDeleteClick(schedule)}
              disabled={hasBookings}
              className="transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-30"
              style={{ color: '#DC2626' }}
              title={hasBookings ? 'Không thể hủy lịch đã có khách đặt' : 'Hủy lịch khởi hành'}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
