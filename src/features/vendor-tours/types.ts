// src/features/vendor-tours/types.ts
/**
 * Types cho khu vực quản lý Tour — dùng chung cho Vendor Manager và Vendor Staff.
 * BE tag "Vendor Tour Management" ghi rõ: "Các API quản lý Tour dành cho Vendor
 * Manager và Vendor Staff" — cùng 1 bộ endpoint cho cả 2 role, chỉ khác UI/route.
 */
import type { ApiDifficulty, ApiStatus, TourDetailFromApi } from '@/features/tours/types';

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
  coverImageUrl?: string;
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
  checkpointImageUrl?: string;
}

/** Checkpoint đầy đủ trả về từ BE (GET danh sách / POST / PUT). */
export interface VendorTourCheckpoint extends TourCheckpointPayload {
  checkpointId: string;
  tourId: string;
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
