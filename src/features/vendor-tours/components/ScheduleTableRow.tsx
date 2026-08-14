import { ClipboardList, Pencil, Trash2 } from 'lucide-react';
import { formatDate, formatPrice } from '@/utils/format';
import type { TourSchedule } from '../types';
import { ScheduleStatusBadge } from './ScheduleStatusBadge';

/** Lịch đã hoàn thành hoặc đã hủy thì không sửa được nữa (khớp mã lỗi `SCHEDULE_NOT_EDITABLE` của BE). */
const EDITABLE_SCHEDULE_STATUSES = new Set(['OPEN', 'CLOSED']);

interface ScheduleTableRowProps {
  schedule: TourSchedule;
  /** Chỉ truyền (màn Manager) nếu muốn hiện nút Sửa — Staff không có quyền này. */
  onEditClick?: (schedule: TourSchedule) => void;
  /** Chỉ truyền (màn Manager) nếu muốn hiện nút Xóa lịch — Staff không có quyền này. */
  onDeleteClick?: (schedule: TourSchedule) => void;
  /** Mở phiên vận hành 1-1 được tạo cùng lịch khởi hành. */
  onOperationsClick?: (schedule: TourSchedule) => void;
  isOpeningOperations?: boolean;
}

export function ScheduleTableRow({
  schedule,
  onEditClick,
  onDeleteClick,
  onOperationsClick,
  isOpeningOperations = false,
}: ScheduleTableRowProps) {
  const hasBookings = schedule.bookedSlots > 0;
  const isEditable = EDITABLE_SCHEDULE_STATUSES.has(schedule.status);
  // `availableSlots` là TỔNG số chỗ của lịch (đặt lúc tạo/sửa lịch), KHÔNG tự giảm khi có
  // khách đặt — số chỗ còn trống thực tế phải tự tính = tổng - đã đặt (khớp cách tính đang
  // dùng ở trang Trekker: `TourDetails.tsx`/`BookTour.tsx`). Kẹp về 0 để phòng dữ liệu lệch
  // (vd tổng bị sửa thấp hơn số đã đặt) không hiện số âm.
  const remainingSlots = Math.max(0, schedule.availableSlots - schedule.bookedSlots);

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
          {schedule.bookedSlots}/{schedule.availableSlots} chỗ
        </span>
        <span className="block text-xs" style={{ color: '#6F7B75' }}>
          Còn trống {remainingSlots} chỗ
        </span>
      </td>

      <td className="px-6 py-4" style={{ verticalAlign: 'middle' }}>
        <ScheduleStatusBadge status={schedule.status} />
      </td>

      <td className="px-6 py-4" style={{ verticalAlign: 'middle' }}>
        <div className="flex items-center gap-3">
          {onOperationsClick && (
            <button
              type="button"
              onClick={() => onOperationsClick(schedule)}
              disabled={isOpeningOperations}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-opacity hover:opacity-75 disabled:cursor-wait disabled:opacity-50"
              style={{ backgroundColor: '#E5F4ED', color: '#06261D' }}
              title="Mở phiên vận hành"
            >
              <ClipboardList className="h-3.5 w-3.5" />
              {isOpeningOperations ? 'Đang mở...' : 'Vận hành'}
            </button>
          )}
          {onEditClick && (
            <button
              type="button"
              onClick={() => onEditClick(schedule)}
              disabled={!isEditable}
              className="transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-30"
              style={{ color: '#06261D' }}
              title={
                isEditable
                  ? 'Sửa lịch khởi hành'
                  : 'Lịch đã hoàn thành hoặc đã hủy, không thể chỉnh sửa'
              }
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          {onDeleteClick && (
            <button
              type="button"
              onClick={() => onDeleteClick(schedule)}
              disabled={hasBookings || !isEditable}
              aria-label="Xóa lịch khởi hành"
              className="transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-30"
              style={{ color: '#DC2626' }}
              title={
                hasBookings
                  ? 'Không thể xóa lịch đã có khách đặt'
                  : !isEditable
                    ? 'Lịch đã hoàn thành hoặc đã hủy, không thể xóa'
                    : 'Xóa lịch khởi hành'
              }
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
