import { Check, EyeOff, X } from 'lucide-react';
import { formatDate, formatPrice } from '@/utils/format';
import type { VendorTourListItem } from '../types';
import { TourDifficultyBadge } from './TourDifficultyBadge';

const FALLBACK_COVER =
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=120&h=120&fit=crop';

interface TourApprovalTableRowProps {
  tour: VendorTourListItem;
  /** Chỉ truyền (tab "Chờ duyệt") nếu muốn hiện nút Duyệt. */
  onApproveClick?: (tour: VendorTourListItem) => void;
  /** Chỉ truyền (tab "Chờ duyệt") nếu muốn hiện nút Từ chối. */
  onRejectClick?: (tour: VendorTourListItem) => void;
  /** Chỉ truyền (tab "Đã duyệt") nếu muốn hiện nút Ẩn. */
  onHideClick?: (tour: VendorTourListItem) => void;
}

export function TourApprovalTableRow({
  tour,
  onApproveClick,
  onRejectClick,
  onHideClick,
}: TourApprovalTableRowProps) {
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
        <span className="text-sm font-medium" style={{ color: '#6F7B75' }}>
          {formatDate(tour.createdAt)}
        </span>
      </td>

      <td className="px-6 py-4" style={{ verticalAlign: 'middle' }}>
        <div className="flex items-center gap-3">
          {onApproveClick && (
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
          {onRejectClick && (
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
          {onHideClick && (
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
        </div>
      </td>
    </tr>
  );
}
