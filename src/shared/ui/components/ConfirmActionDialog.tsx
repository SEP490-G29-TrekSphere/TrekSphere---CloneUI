export interface ConfirmActionDialogProps {
  title: string;
  description: string;
  /** Nội dung phụ hiển thị dưới description, thường là tên/tiêu đề đối tượng bị tác động. */
  detail?: string;
  confirmLabel: string;
  cancelLabel?: string;
  isPending?: boolean;
  /** `destructive` dùng cho hành động không thể hoàn tác (vd: xóa vĩnh viễn). */
  variant?: 'default' | 'destructive';
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Modal xác nhận hành động dùng chung (ẩn/hiện, xóa...).
 * Tái sử dụng cho trang "Bài viết của tôi" (trekker) và "Quản lý Blog" (admin).
 */
export function ConfirmActionDialog({
  title,
  description,
  detail,
  confirmLabel,
  cancelLabel = 'Hủy',
  isPending = false,
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmActionDialogProps) {
  const confirmColor = variant === 'destructive' ? '#EF4444' : '#06261D';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
    >
      <div
        className="mx-4 w-full max-w-md rounded-3xl p-6 shadow-xl"
        style={{ backgroundColor: '#FFFFFF' }}
      >
        <h3 className="mb-2 text-center text-lg font-bold" style={{ color: '#06261D' }}>
          {title}
        </h3>

        <p className="mb-1 text-center text-sm" style={{ color: '#6F7B75' }}>
          {description}
        </p>
        {detail && (
          <p className="mb-6 text-center text-xs font-medium" style={{ color: '#6F7B75' }}>
            "{detail.length > 60 ? `${detail.slice(0, 60)}...` : detail}"
          </p>
        )}

        <div className="flex gap-3" style={{ marginTop: detail ? undefined : '24px' }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="flex-1 rounded-full border px-4 py-3 text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{ borderColor: '#E6E2D1', color: '#6F7B75' }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 rounded-full px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: confirmColor }}
          >
            {isPending ? 'Đang xử lý...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
