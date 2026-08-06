// src/features/vendor-tours/types.ts
/**
 * Types cho khu vực quản lý Tour — dùng chung cho Vendor Manager và Vendor Staff.
 * BE tag "Vendor Tour Management" ghi rõ: "Các API quản lý Tour dành cho Vendor
 * Manager và Vendor Staff" — cùng 1 bộ endpoint cho cả 2 role, chỉ khác UI/route.
 */
import type {
  ApiDifficulty,
  ApiStatus,
  TourDetailFromApi,
  TourDetailScheduleApi,
} from '@/features/tours/types';

export type { ApiDifficulty, ApiStatus };

/**
 * Chi tiết đầy đủ 1 tour — dùng để đổ dữ liệu vào form Sửa.
 * Lấy qua `GET /tours/{id}` (public — `/vendor/tours/{id}` không có method GET).
 */
export type VendorTourDetail = TourDetailFromApi;

export interface VendorTourListItem {
  id: string;
  name: string;
  coverImageUrl?: string;
  basePrice: number;
  difficulty: ApiDifficulty;
  status: ApiStatus;
  createdAt: string;
}

/**
 * `GET /vendor/tours` chỉ hỗ trợ lọc theo `keyword` phía server (xác nhận qua
 * OpenAPI spec — params chỉ có `keyword, page, size, sortBy, sortDir`, KHÔNG có
 * `difficulty`/`status`). Lọc theo 2 tiêu chí đó phải làm ở phía client.
 */
export interface VendorTourFilter {
  search?: string;
}

export interface VendorTourListResponse {
  tours: VendorTourListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateTourPayload {
  tourName: string;
  description: string;
  difficulty: ApiDifficulty;
  location: string;
  durationDays: number;
  basePrice: number;
  minCapacity: number;
  maxCapacity: number;
  /**
   * URL ảnh bìa đã upload sẵn qua `POST /files/upload`. Gửi kèm song song với `coverImage`
   * — xem ghi chú "ẢNH BÌA" ở đầu `vendorTourService.ts` để biết vì sao gửi cả hai.
   */
  coverImageUrl?: string;
  /** File ảnh bìa thô, chỉ có khi user vừa chọn ảnh mới ở form. */
  coverImage?: File;
}

/** `PUT /vendor/tours/{id}` nhận đúng cùng shape với tạo tour (đã test qua Swagger). */
export type UpdateTourPayload = CreateTourPayload;

export interface TourCheckpointPayload {
  checkpointName: string;
  description?: string;
  checkpointOrder: number;
  latitude?: number;
  longitude?: number;
  altitude?: number;
  /**
   * TOÀN BỘ ảnh của checkpoint gộp trong 1 chuỗi, phân tách bởi dấu phẩy — BE lưu vào đúng
   * 1 cột TEXT `tour_checkpoint.checkpoint_image_url` chứ không có bảng ảnh riêng.
   * Vd: `"https://.../img1.jpg,https://.../img2.jpg"`.
   */
  checkpointImageUrl?: string;
}

/** Checkpoint đầy đủ trả về từ BE (GET danh sách / POST / PUT). */
export interface VendorTourCheckpoint extends TourCheckpointPayload {
  checkpointId: string;
  tourId: string;
  /** Bản đã tách sẵn của `checkpointImageUrl` — chỉ có ở response, không gửi lên khi ghi. */
  checkpointImageUrls?: string[];
}

/**
 * 1 checkpoint chuẩn bị gửi lên khi submit form — `checkpointId` có giá trị nếu
 * đây là checkpoint đã tồn tại trên server (dùng PUT), không có thì là mới (dùng POST).
 */
export interface CheckpointSubmitItem {
  checkpointId?: string;
  payload: TourCheckpointPayload;
}

export interface CreatedTour {
  id: string;
  status: ApiStatus;
}

/**
 * Types cho "Lịch khởi hành" (Tour Schedule) — BE tag "Vendor Tour Schedule
 * Management": "Các API quản lý lịch khởi hành dành cho Vendor Manager và
 * Vendor Staff". Danh sách lịch của 1 tour lấy qua `TourDetailFromApi.schedules`
 * (không có endpoint list riêng cho vendor) — chỉ create/update/delete là API
 * riêng theo `scheduleId`/`tourId`.
 */
export type ApiScheduleStatus = TourDetailScheduleApi['status'];

export type TourSchedule = TourDetailScheduleApi;

export interface CreateSchedulePayload {
  departureDate: string;
  returnDate: string;
  price: number;
  availableSlots: number;
}

/** `PUT /vendor/tours/schedules/{scheduleId}` — mọi field đều optional trên BE, nhưng FE luôn gửi đủ. */
export interface UpdateSchedulePayload {
  departureDate: string;
  returnDate: string;
  price: number;
  availableSlots: number;
  status: ApiScheduleStatus;
  /** Bắt buộc khi lịch đã có khách đặt (`bookedSlots > 0`) — BE gửi notification cho khách dựa vào đây. */
  reason?: string;
}
