import { X } from 'lucide-react';
import { getSafeImageUrl, sanitizeHtml, stripHtml } from '@/utils/sanitize';

export interface BlogPreviewModalProps {
  title: string;
  content: string;
  coverPreview?: string;
  authorName: string;
  authorAvatarUrl?: string;
  onClose: () => void;
}

/** Modal xem trước — mô phỏng cách bài viết hiển thị trên trang đọc công khai. */
export function BlogPreviewModal({
  title,
  content,
  coverPreview,
  authorName,
  authorAvatarUrl,
  onClose,
}: BlogPreviewModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-3xl p-6 sm:p-8 bg-white">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-[#6F7B75]">
            Xem trước
          </span>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted text-[#6F7B75]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {getSafeImageUrl(coverPreview) && (
          <img
            src={getSafeImageUrl(coverPreview) as string}
            alt="Cover"
            className="mb-6 h-48 sm:h-56 w-full rounded-2xl object-cover"
          />
        )}

        <h1 className="mb-3 text-xl sm:text-2xl font-bold text-[#06261D]">{title}</h1>

        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full text-xs font-bold text-white bg-[#06261D]">
            {getSafeImageUrl(authorAvatarUrl) ? (
              <img
                src={getSafeImageUrl(authorAvatarUrl) as string}
                alt={authorName}
                className="h-full w-full object-cover"
              />
            ) : (
              <span>{authorName.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <span className="text-sm font-medium text-[#6F7B75]">{authorName}</span>
        </div>

        <article className="flex flex-col gap-4 p-0 text-sm leading-relaxed text-[#06261D] ql-editor sm:text-base [&_img]:mx-auto [&_img]:block [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-xl">
          {stripHtml(content).trim().length === 0 ? (
            <p className="italic text-[#9E9A92]">Nội dung đang được cập nhật.</p>
          ) : (
            // biome-ignore lint/security/noDangerouslySetInnerHtml: The content is sanitized on the backend before being rendered here.
            <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} />
          )}
        </article>
      </div>
    </div>
  );
}
