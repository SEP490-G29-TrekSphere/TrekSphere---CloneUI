import { useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import type { GalleryImage } from '../../types';

interface TourGalleryProps {
  images: GalleryImage[];
  className?: string;
}

/**
 * Image gallery with grid layout and lightbox potential
 * Shows primary image large with thumbnails below
 */
export function TourGallery({ images, className }: TourGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const openLightbox = useCallback((index: number) => {
    setSelectedIndex(index);
    setIsLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
  }, []);

  const goToNext = useCallback(() => {
    setSelectedIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goToPrev = useCallback(() => {
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        goToPrev();
      }
    },
    [closeLightbox, goToNext, goToPrev]
  );

  if (images.length === 0) {
    return null;
  }

  return (
    <section className={cn('flex flex-col gap-4', className)} aria-label="Bộ sưu tập hình ảnh">
      <h2 className="font-heading-section text-xl font-bold text-foreground md:text-2xl">
        Hình ảnh tour
      </h2>

      {/* Main image */}
      <button
        type="button"
        onClick={() => openLightbox(0)}
        className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`Xem hình ảnh lớn: ${images[0]?.alt}`}
      >
        <img
          src={images[0]?.src}
          alt={images[0]?.alt || 'Hình ảnh tour'}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
        {/* Overlay hint */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors hover:bg-black/20">
          <div className="flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-white opacity-0 transition-opacity hover:opacity-100">
            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
              />
            </svg>
            <span className="text-sm font-medium">Phóng to</span>
          </div>
        </div>
      </button>

      {/* Thumbnail grid */}
      <div className="grid grid-cols-4 gap-3">
        {images.slice(1, 5).map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => openLightbox(index + 1)}
            className={cn(
              'relative aspect-square overflow-hidden rounded-lg bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              index === 3 && images.length > 5 && 'relative'
            )}
            aria-label={`Xem hình ảnh: ${image.alt}`}
          >
            <img
              src={image.src}
              alt={image.alt || `Hình ảnh ${index + 2}`}
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
            />
            {/* More photos overlay */}
            {index === 3 && images.length > 5 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <span className="font-heading-section text-lg font-bold text-white">
                  +{images.length - 5}
                </span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* View all button */}
      {images.length > 5 && (
        <button
          type="button"
          onClick={() => openLightbox(0)}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          Xem tất cả {images.length} hình ảnh
        </button>
      )}

      {/* Lightbox */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
          role="dialog"
          aria-modal="true"
          aria-label="Bộ sưu tập hình ảnh"
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Đóng"
          >
            <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Navigation buttons */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={goToPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label="Hình ảnh trước"
              >
                <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label="Hình ảnh tiếp theo"
              >
                <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </>
          )}

          {/* Main image */}
          <img
            src={images[selectedIndex]?.src}
            alt={images[selectedIndex]?.alt || 'Hình ảnh'}
            className="max-h-[80vh] max-w-[90vw] object-contain"
          />

          {/* Image counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-sm text-white">
            {selectedIndex + 1} / {images.length}
          </div>

          {/* Thumbnail strip */}
          <div className="absolute bottom-16 left-1/2 flex max-w-full -translate-x-1/2 gap-2 overflow-x-auto px-4">
            {images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className={cn(
                  'size-16 shrink-0 overflow-hidden rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white',
                  index === selectedIndex ? 'ring-2 ring-white' : 'opacity-60 hover:opacity-100'
                )}
                aria-label={`Xem hình ảnh ${index + 1}`}
                aria-current={index === selectedIndex ? 'true' : undefined}
              >
                <img src={image.src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default TourGallery;
