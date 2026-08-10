import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { handleImageFallback } from '@/features/tours/components/tour-details/shared';
import type { TourDetailFromApi } from '@/features/tours/types';
import { cn } from '@/lib/utils';

interface TourGallerySectionProps {
  tour: TourDetailFromApi;
}

/**
 * Thư viện ảnh: lưới mosaic (1 ảnh lớn + các ảnh nhỏ) và lightbox toàn màn hình.
 *
 * Lightbox tự viết thay vì dùng `Dialog` của base-ui vì cần khung trong suốt tràn
 * viền và điều hướng bằng phím mũi tên — Dialog mặc định gói nội dung trong popup
 * có nền và giới hạn `max-w-sm`.
 */
export function TourGallerySection({ tour }: TourGallerySectionProps) {
  const images = [...tour.images].sort((a, b) => a.sortOrder - b.sortOrder);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const showPrevious = useCallback(() => {
    setLightboxIndex((current) =>
      current === null ? null : (current - 1 + images.length) % images.length
    );
  }, [images.length]);

  const showNext = useCallback(() => {
    setLightboxIndex((current) => (current === null ? null : (current + 1) % images.length));
  }, [images.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setLightboxIndex(null);
      if (event.key === 'ArrowLeft') showPrevious();
      if (event.key === 'ArrowRight') showNext();
    }

    document.addEventListener('keydown', handleKeyDown);
    // Khoá cuộn nền để bánh xe chuột không cuộn trang phía sau lightbox
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [lightboxIndex, showPrevious, showNext]);

  if (images.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">Tour này chưa có hình ảnh.</p>
      </div>
    );
  }

  const activeImage = lightboxIndex === null ? null : images[lightboxIndex];

  return (
    <>
      <div
        className={cn(
          'grid gap-2',
          images.length > 1 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1'
        )}
      >
        {images.map((image, index) => (
          <button
            key={image.imageId}
            type="button"
            onClick={() => setLightboxIndex(index)}
            aria-label={image.caption || `Xem ảnh ${index + 1} của ${tour.tourName}`}
            className={cn(
              'group relative overflow-hidden rounded-xl bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              // Ảnh đầu tiên chiếm ô đôi để lưới có điểm nhấn thay vì đều tăm tắp
              index === 0 && images.length > 1
                ? 'col-span-2 row-span-2 aspect-[4/3]'
                : 'aspect-square'
            )}
          >
            <img
              src={image.imageUrl}
              alt={image.caption || `Ảnh ${index + 1}`}
              onError={handleImageFallback}
              loading={index < 3 ? 'eager' : 'lazy'}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {image.caption && (
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-2 pt-8 text-left text-xs font-medium text-white">
                {image.caption}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Xem ảnh phóng to"
        >
          {/* Nền bấm để đóng — có nút đóng thật ở góc nên đây chỉ là lối tắt chuột */}
          <button
            type="button"
            aria-label="Đóng"
            onClick={() => setLightboxIndex(null)}
            className="absolute inset-0 cursor-zoom-out"
          />

          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            aria-label="Đóng"
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={showPrevious}
                aria-label="Ảnh trước"
                className="absolute left-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <ChevronLeft className="h-6 w-6" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={showNext}
                aria-label="Ảnh tiếp theo"
                className="absolute right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <ChevronRight className="h-6 w-6" aria-hidden="true" />
              </button>
            </>
          )}

          <figure className="pointer-events-none relative z-[1] flex max-h-full flex-col items-center gap-3">
            <img
              src={activeImage.imageUrl}
              alt={activeImage.caption || tour.tourName}
              onError={handleImageFallback}
              className="max-h-[80vh] max-w-full rounded-lg object-contain"
            />
            <figcaption className="text-center text-sm text-white/80">
              {activeImage.caption && <span className="mr-2">{activeImage.caption}</span>}
              <span className="text-white/50">
                {(lightboxIndex ?? 0) + 1} / {images.length}
              </span>
            </figcaption>
          </figure>
        </div>
      )}
    </>
  );
}
