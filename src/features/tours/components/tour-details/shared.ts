/**
 * Hằng số & helper dùng chung cho các section của trang chi tiết tour.
 *
 * Tách riêng khỏi component để mọi section nói cùng một "ngôn ngữ" (ảnh fallback,
 * nhãn độ khó, cách tách chuỗi CSV từ API) mà không import chéo lẫn nhau.
 */

import type { SyntheticEvent } from 'react';
import type { ApiDifficulty, TourCheckpoint, TourDetailScheduleApi } from '@/features/tours/types';

export const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80';

/** Nhãn tiếng Việt cho enum `difficulty` của API. */
export const DIFFICULTY_LABELS: Record<ApiDifficulty | string, string> = {
  BEGINNER: 'Mới bắt đầu',
  EASY: 'Dễ',
  MODERATE: 'Trung bình',
  HARD: 'Khó',
  EXPERT: 'Chuyên gia',
};

/**
 * Thang điểm 1-5 cho độ khó — dùng để vẽ meter ở khối thông số.
 * Là thang thứ tự (ordinal) nên chỉ tô đậm dần trên cùng một hue, không đổi màu.
 */
export const DIFFICULTY_LEVEL: Record<ApiDifficulty | string, number> = {
  BEGINNER: 1,
  EASY: 2,
  MODERATE: 3,
  HARD: 4,
  EXPERT: 5,
};

/** Nhãn ngắn hiển thị dạng chip trên hero. */
export const DIFFICULTY_TAGS: Record<ApiDifficulty | string, string> = {
  BEGINNER: 'Cung đường khám phá',
  EASY: 'Cung đường dễ',
  MODERATE: 'Cung đường trung bình',
  HARD: 'Cung đường thách thức',
  EXPERT: 'Cung đường chuyên gia',
};

/**
 * API trả `highlights` / `includes` / `excludes` dưới dạng chuỗi ngăn cách bởi dấu
 * phẩy. Tách thành mảng, bỏ khoảng trắng thừa và phần tử rỗng.
 */
export function splitField(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * Chuẩn hóa ảnh checkpoint từ API.
 *
 * API mới trả `checkpointImageUrls`; dữ liệu/response cũ chỉ có một chuỗi URL phân tách bằng
 * dấu phẩy trong `checkpointImageUrl`. Ưu tiên mảng đã tách để không đưa cả chuỗi nhiều URL
 * vào thuộc tính `src` của một thẻ ảnh.
 */
export function getCheckpointImageUrls(
  checkpoint: Pick<TourCheckpoint, 'checkpointImageUrl' | 'checkpointImageUrls'>
): string[] {
  const urls =
    checkpoint.checkpointImageUrls && checkpoint.checkpointImageUrls.length > 0
      ? checkpoint.checkpointImageUrls
      : splitField(checkpoint.checkpointImageUrl);

  return [...new Set(urls.map((url) => url.trim()).filter(Boolean))];
}

/** Gắn vào `onError` của `<img>` để rơi về ảnh mặc định đúng một lần. */
export function handleImageFallback(event: SyntheticEvent<HTMLImageElement>): void {
  const img = event.currentTarget;
  if (img.src !== FALLBACK_IMAGE) img.src = FALLBACK_IMAGE;
}

/** Số chỗ còn trống của một lịch khởi hành (kẹp về 0 phòng dữ liệu lệch). */
export function remainingSlots(schedule: TourDetailScheduleApi): number {
  return Math.max(0, schedule.availableSlots - schedule.bookedSlots);
}

/** Lịch còn nhận khách: trạng thái OPEN và vẫn còn chỗ. */
export function isBookableSchedule(schedule: TourDetailScheduleApi): boolean {
  return schedule.status === 'OPEN' && remainingSlots(schedule) > 0;
}

/** Sắp xếp lịch theo ngày khởi hành tăng dần. */
export function sortSchedulesByDeparture(
  schedules: TourDetailScheduleApi[]
): TourDetailScheduleApi[] {
  return [...schedules].sort(
    (a, b) => new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime()
  );
}

/** Một mục trong thanh điều hướng dính của trang. */
export interface TourSection {
  id: string;
  label: string;
}

/**
 * ID của các section — dùng chung giữa thanh nav và chính các section, nên khai báo
 * một chỗ duy nhất để không lệch anchor.
 */
export const SECTION_IDS = {
  overview: 'tong-quan',
  schedules: 'lich-khoi-hanh',
  route: 'lo-trinh',
  inclusions: 'bao-gom',
  gallery: 'hinh-anh',
  requirements: 'dieu-kien-tham-gia',
  policy: 'chinh-sach',
  reviews: 'danh-gia',
} as const;

/**
 * Khoảng trừ hao khi cuộn tới một section: header cố định (64px) + thanh nav dính
 * (~56px) + một chút thở. Dùng cả cho `scroll-mt` lẫn scrollspy để hai bên khớp nhau.
 */
export const SECTION_SCROLL_OFFSET = 140;
