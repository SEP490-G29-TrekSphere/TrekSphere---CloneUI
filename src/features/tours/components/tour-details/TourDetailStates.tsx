import { ChevronLeft, Mountain, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PATHS } from '@/constants';

/**
 * Khung xương lúc tải trang — dựng đúng bố cục thật (hero, thanh nav, hai cột) để
 * nội dung không nhảy chỗ khi dữ liệu về.
 */
export function TourDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="h-[60vh] min-h-[420px] w-full animate-pulse bg-muted" />
      <div className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-[1200px] gap-6 px-4 py-4 sm:px-6">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-4 w-20 animate-pulse rounded bg-muted" />
          ))}
        </div>
      </div>
      <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-6">
            <div className="h-28 animate-pulse rounded-2xl bg-muted" />
            <div className="h-48 animate-pulse rounded-2xl bg-muted" />
            <div className="h-64 animate-pulse rounded-2xl bg-muted" />
          </div>
          <div className="flex flex-col gap-6">
            <div className="h-80 animate-pulse rounded-2xl bg-muted" />
            <div className="h-52 animate-pulse rounded-2xl bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}

interface TourDetailErrorProps {
  message: string;
  onRetry: () => void;
  isFetching?: boolean;
}

/** Lỗi tải dữ liệu — luôn kèm lối thoát là thử lại. */
export function TourDetailError({ message, onRetry, isFetching }: TourDetailErrorProps) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 pt-16">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
        <XCircle className="h-10 w-10 text-destructive" aria-hidden="true" />
      </div>
      <h1 className="mb-2 text-2xl font-bold text-foreground">Không thể tải tour</h1>
      <p className="mb-6 max-w-sm text-center text-muted-foreground">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        disabled={isFetching}
        className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50"
      >
        {isFetching ? 'Đang tải lại…' : 'Thử lại'}
      </button>
    </div>
  );
}

/** Tour không tồn tại hoặc đã bị gỡ. */
export function TourNotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 pt-16">
      <Mountain className="mb-4 h-16 w-16 text-muted-foreground/50" aria-hidden="true" />
      <h1 className="mb-2 text-2xl font-bold text-foreground">Không tìm thấy tour</h1>
      <p className="mb-6 text-center text-muted-foreground">
        Tour bạn đang tìm không tồn tại hoặc đã bị gỡ khỏi hệ thống.
      </p>
      <Link
        to={PATHS.TOURS}
        className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Quay lại danh sách tour
      </Link>
    </div>
  );
}
