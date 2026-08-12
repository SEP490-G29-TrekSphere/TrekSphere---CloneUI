import { CalendarClock, Eye, EyeOff, Pencil, RefreshCw, Send, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '@/utils/format';
import type { ApiStatus, VendorTourListItem } from '../types';
import { TourDifficultyBadge } from './TourDifficultyBadge';
import { TourStatusBadge } from './TourStatusBadge';

const FALLBACK_COVER =
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=120&h=120&fit=crop';

/** Chỉ tour đang bản nháp hoặc bị từ chối mới gửi kiểm duyệt được (khớp mô tả API). */
const SUBMITTABLE_STATUSES = new Set(['DRAFT', 'REJECTED']);

/**
 * Chỉ tour đã duyệt hoặc đang ẩn mới tạo được lịch khởi hành — gửi lịch cho tour ở trạng
 * thái khác sẽ bị BE chặn bằng mã lỗi `TOUR_NOT_APPROVED_FOR_SCHEDULE (4206)`.
 */
export const SCHEDULABLE_STATUSES = new Set<ApiStatus>(['APPROVED', 'HIDDEN']);

/** Câu giải thích khi tour chưa đủ điều kiện mở lịch — dùng chung cho tooltip ở mọi màn. */
export const NOT_SCHEDULABLE_REASON = 'Tour cần được duyệt trước khi tạo lịch khởi hành';

/** "Chuyển trạng thái / Sửa lại" (revert-to-draft) chỉ áp dụng cho tour bị từ chối, cả 2 role. */
const REVERTABLE_STATUSES = new Set(['REJECTED']);

/**
 * Staff chỉ sửa được tour của chính mình lúc còn là bản nháp.
 * Tour bị REJECTED KHÔNG sửa trực tiếp được — phải bấm "Chuyển trạng thái / Sửa lại"
 * (revert-to-draft) đưa về DRAFT trước, theo đúng tài liệu tích hợp của BE.
 */
export const STAFF_EDITABLE_STATUSES = new Set<ApiStatus>(['DRAFT']);
/** Manager được cập nhật cả tour đang bán; booking cũ vẫn dùng policy snapshot. */
export const MANAGER_EDITABLE_STATUSES = new Set<ApiStatus>([
  'PENDING_APPROVAL',
  'APPROVED',
  'HIDDEN',
]);

interface TourTableRowProps {
  tour: VendorTourListItem;
  /** Đường dẫn màn Sửa cho đúng tour này — do trang cha tính sẵn (khác nhau giữa Manager/Staff). */
  editPath: string;
  /** Đường dẫn màn Lịch khởi hành cho đúng tour này — do trang cha tính sẵn (khác nhau giữa Manager/Staff). */
  schedulesPath: string;
  /** Set trạng thái được phép Sửa — page cha truyền đúng bộ theo role của mình. */
  editableStatuses: Set<ApiStatus>;
  /** Chỉ Manager truyền — Staff không còn quyền xóa tour. */
  onDeleteClick?: (tour: VendorTourListItem) => void;
  /** Chỉ Staff truyền — hiện nút "Gửi kiểm duyệt". */
  onSubmitApprovalClick?: (tour: VendorTourListItem) => void;
  /** Cả 2 role đều truyền — hiện trên tour REJECTED, copy dialog xác nhận khác nhau theo trang gọi. */
  onRevertClick?: (tour: VendorTourListItem) => void;
  /** Chỉ Manager truyền — hiện khi tour đang APPROVED. */
  onHideClick?: (tour: VendorTourListItem) => void;
  /** Chỉ Manager truyền — hiện khi tour đang HIDDEN. */
  onUnhideClick?: (tour: VendorTourListItem) => void;
}

export function TourTableRow({
  tour,
  editPath,
  schedulesPath,
  editableStatuses,
  onDeleteClick,
  onSubmitApprovalClick,
  onRevertClick,
  onHideClick,
  onUnhideClick,
}: TourTableRowProps) {
  const navigate = useNavigate();
  const canEdit = editableStatuses.has(tour.status);
  const canSubmitApproval = onSubmitApprovalClick && SUBMITTABLE_STATUSES.has(tour.status);
  const canSchedule = SCHEDULABLE_STATUSES.has(tour.status);
  const canRevert = onRevertClick && REVERTABLE_STATUSES.has(tour.status);
  const canHide = onHideClick && tour.status === 'APPROVED';
  const canUnhide = onUnhideClick && tour.status === 'HIDDEN';

  return (
    <tr className="border-b transition-colors last:border-b-0" style={{ borderColor: '#E6E2D1' }}>
      <td className="px-6 py-4" style={{ verticalAlign: 'middle' }}>
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 shrink-0 overflow-hidden rounded-full"
            style={{ backgroundColor: '#F0EEE6' }}
          >
            <img
              src={tour.coverImageUrl ?? FALLBACK_COVER}
              alt={tour.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <span className="font-semibold" style={{ color: '#06261D' }}>
            {tour.name}
          </span>
        </div>
      </td>

      <td className="px-6 py-4" style={{ verticalAlign: 'middle' }}>
        <span className="font-semibold" style={{ color: '#06261D' }}>
          {formatPrice(tour.basePrice)}đ
        </span>
      </td>

      <td className="px-6 py-4" style={{ verticalAlign: 'middle' }}>
        <TourDifficultyBadge difficulty={tour.difficulty} />
      </td>

      <td className="px-6 py-4" style={{ verticalAlign: 'middle' }}>
        <div className="space-y-1.5">
          <TourStatusBadge status={tour.status} />
          {tour.status === 'APPROVED' && (
            <p
              className={`text-[11px] font-semibold ${
                tour.onlineBookingEnabled ? 'text-emerald-700' : 'text-amber-700'
              }`}
              title={tour.onlineBookingDisabledReason ?? undefined}
            >
              {tour.onlineBookingEnabled ? 'Đang nhận đặt online' : 'Chưa sẵn sàng đặt online'}
            </p>
          )}
        </div>
      </td>

      <td className="px-6 py-4" style={{ verticalAlign: 'middle' }}>
        <div className="flex items-center gap-3">
          {canEdit && (
            <button
              type="button"
              onClick={() => navigate(editPath)}
              className="transition-opacity hover:opacity-70"
              style={{ color: '#06261D' }}
              title="Sửa tour"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          {canSubmitApproval && (
            <button
              type="button"
              onClick={() => onSubmitApprovalClick(tour)}
              className="transition-opacity hover:opacity-70"
              style={{ color: '#0E7C6B' }}
              title="Gửi yêu cầu kiểm duyệt"
            >
              <Send className="h-4 w-4" />
            </button>
          )}
          {canRevert && (
            <button
              type="button"
              onClick={() => onRevertClick(tour)}
              className="transition-opacity hover:opacity-70"
              style={{ color: '#0E7C6B' }}
              title="Chuyển trạng thái / Sửa lại"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
          {canHide && (
            <button
              type="button"
              onClick={() => onHideClick(tour)}
              className="transition-opacity hover:opacity-70"
              style={{ color: '#EA580C' }}
              title="Ẩn tour"
            >
              <EyeOff className="h-4 w-4" />
            </button>
          )}
          {canUnhide && (
            <button
              type="button"
              onClick={() => onUnhideClick(tour)}
              className="transition-opacity hover:opacity-70"
              style={{ color: '#16A34A' }}
              title="Mở lại tour"
            >
              <Eye className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate(schedulesPath)}
            disabled={!canSchedule}
            className="transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-30"
            style={{ color: '#0E7C6B' }}
            title={canSchedule ? 'Lịch khởi hành' : NOT_SCHEDULABLE_REASON}
          >
            <CalendarClock className="h-4 w-4" />
          </button>
          {onDeleteClick && (
            <button
              type="button"
              onClick={() => onDeleteClick(tour)}
              className="text-red-500 transition-colors hover:text-red-600"
              title="Xóa tour"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
