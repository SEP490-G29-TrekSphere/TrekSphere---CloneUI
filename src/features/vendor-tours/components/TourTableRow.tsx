import { Check, Pencil, Send, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '@/utils/format';
import type { VendorTourListItem } from '../types';
import { TourDifficultyBadge } from './TourDifficultyBadge';
import { TourStatusBadge } from './TourStatusBadge';

const FALLBACK_COVER =
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=120&h=120&fit=crop';

/** Chỉ tour đang bản nháp hoặc bị từ chối mới gửi kiểm duyệt được (khớp mô tả API). */
const SUBMITTABLE_STATUSES = new Set(['DRAFT', 'REJECTED']);

interface TourTableRowProps {
  tour: VendorTourListItem;
  /** Đường dẫn màn Sửa cho đúng tour này — do trang cha tính sẵn (khác nhau giữa Manager/Staff). */
  editPath: string;
  onDeleteClick: (tour: VendorTourListItem) => void;
  /** Chỉ truyền prop này (vd: từ màn Staff) nếu muốn hiện nút "Gửi kiểm duyệt". */
  onSubmitApprovalClick?: (tour: VendorTourListItem) => void;
  /**
   * Chỉ truyền 2 prop này (vd: từ màn Manager) nếu muốn hiện nút Duyệt/Từ chối
   * cho tour đang PENDING_APPROVAL. BE chưa có API duyệt/từ chối tour — hiện
   * tại 2 handler này chỉ là placeholder (toast "đang phát triển").
   */
  onApproveClick?: (tour: VendorTourListItem) => void;
  onRejectClick?: (tour: VendorTourListItem) => void;
}

export function TourTableRow({
  tour,
  editPath,
  onDeleteClick,
  onSubmitApprovalClick,
  onApproveClick,
  onRejectClick,
}: TourTableRowProps) {
  const navigate = useNavigate();
  const canSubmitApproval = onSubmitApprovalClick && SUBMITTABLE_STATUSES.has(tour.status);
  const canReview = (onApproveClick || onRejectClick) && tour.status === 'PENDING_APPROVAL';

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
        <TourStatusBadge status={tour.status} />
      </td>

      <td className="px-6 py-4" style={{ verticalAlign: 'middle' }}>
        <div className="flex items-center gap-3">
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
          {canReview && onApproveClick && (
            <button
              type="button"
              onClick={() => onApproveClick(tour)}
              className="transition-opacity hover:opacity-70"
              style={{ color: '#16A34A' }}
              title="Duyệt tour"
            >
              <Check className="h-4 w-4" />
            </button>
          )}
          {canReview && onRejectClick && (
            <button
              type="button"
              onClick={() => onRejectClick(tour)}
              className="transition-opacity hover:opacity-70"
              style={{ color: '#DC2626' }}
              title="Từ chối tour"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate(editPath)}
            className="transition-opacity hover:opacity-70"
            style={{ color: '#06261D' }}
            title="Sửa tour"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDeleteClick(tour)}
            className="text-red-500 transition-colors hover:text-red-600"
            title="Xóa tour"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
