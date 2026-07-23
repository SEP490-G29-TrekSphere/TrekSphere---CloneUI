import { type ApiResponse, ApiService } from '@/config/apiClient';
import type {
  ApiDifficulty,
  ApiStatus,
  CreatedTour,
  CreateTourPayload,
  TourCheckpointPayload,
  UpdateTourPayload,
  VendorTourCheckpoint,
  VendorTourDetail,
  VendorTourFilter,
  VendorTourListItem,
  VendorTourListResponse,
} from '../types';

/**
 * Service gọi API "Vendor Tour Management" (BE tag `Vendor Tour Management` +
 * `Tour & Schedule`) — dùng chung cho cả Vendor Manager và Vendor Staff.
 * Nguồn tham chiếu: `https://api.treksphere.io.vn/v3/api-docs`.
 *
 *   GET    /vendor/tours                      — danh sách tour do vendor hiện tại quản lý,
 *                                                bao gồm cả bản nháp. Chỉ hỗ trợ lọc `keyword`
 *                                                phía server — KHÔNG có param difficulty/status.
 *   POST   /vendor/tours                      — tạo tour mới (mặc định status DRAFT)
 *   PUT    /vendor/tours/{id}                 — cập nhật tour, cùng payload shape với POST
 *                                                (đã test qua Swagger)
 *   DELETE /vendor/tours/{id}                 — xóa mềm tour
 *   POST   /vendor/tours/{tourId}/checkpoints          — thêm 1 checkpoint (tour phải tồn tại trước)
 *   PUT    /vendor/tours/checkpoints/{checkpointId}     — sửa 1 checkpoint đã tồn tại
 *   DELETE /vendor/tours/checkpoints/{checkpointId}     — xóa 1 checkpoint
 *   POST   /vendor/tours/{id}/submit-approval           — gửi tour (DRAFT/REJECTED) lên cho Manager duyệt
 *
 * LƯU Ý: `/vendor/tours/{id}` KHÔNG có method GET (đã xác nhận qua OpenAPI spec —
 * path đó chỉ khai báo `put`/`delete`). Muốn lấy chi tiết 1 tour để đổ vào form
 * Sửa phải dùng endpoint public `GET /tours/{id}` (tag `Tour`, không cần đăng
 * nhập) — response cùng schema `TourDetailResponse`. Tương tự, danh sách checkpoint
 * của tour cũng chỉ có bản public `GET /tours/{tourId}/checkpoints` (không có bản
 * `/vendor/...`), dùng chung cho cả 2 role.
 */

interface VendorTourResponseDto {
  tourId: string;
  tourName: string;
  basePrice: number;
  difficulty: ApiDifficulty;
  status: ApiStatus;
  coverImageUrl: string | null;
}

interface TourDetailResponseDto {
  tourId: string;
  status: ApiStatus;
}

interface TourCheckpointResponseDto {
  checkpointId: string;
}

interface PaginationResponseDto<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

function unwrapResponse<T>(response: ApiResponse<T>): T {
  if (response.error) {
    throw new Error(response.error);
  }
  if (response.data === undefined) {
    throw new Error('Không nhận được dữ liệu từ máy chủ');
  }
  return response.data;
}

function mapVendorTour(dto: VendorTourResponseDto): VendorTourListItem {
  return {
    id: dto.tourId,
    name: dto.tourName,
    coverImageUrl: dto.coverImageUrl ?? undefined,
    basePrice: dto.basePrice,
    difficulty: dto.difficulty,
    status: dto.status,
  };
}

export const vendorTourService = {
  /** Lấy danh sách tour của vendor hiện tại (chỉ lọc `keyword` + phân trang phía server). */
  async listMyTours(
    filter: VendorTourFilter = {},
    page = 1,
    pageSize = 10
  ): Promise<VendorTourListResponse> {
    const params: Record<string, string> = {
      page: String(page - 1), // BE dùng page 0-based
      size: String(pageSize),
    };
    if (filter.search) {
      params.keyword = filter.search;
    }

    const response = await ApiService<PaginationResponseDto<VendorTourResponseDto>>(
      '/vendor/tours',
      'GET',
      undefined,
      params
    );
    const data = unwrapResponse(response);

    return {
      tours: data.content.map(mapVendorTour),
      total: data.totalElements,
      page,
      pageSize,
    };
  },

  /** Tạo tour mới — BE trả về status mặc định DRAFT. */
  async createTour(payload: CreateTourPayload): Promise<CreatedTour> {
    const response = await ApiService<TourDetailResponseDto>('/vendor/tours', 'POST', payload);
    const data = unwrapResponse(response);
    return { id: data.tourId, status: data.status };
  },

  /**
   * Lấy chi tiết đầy đủ 1 tour — dùng để đổ vào form Sửa.
   * `/vendor/tours/{id}` không có GET nên phải gọi endpoint public `/tours/{id}`.
   */
  async getTourDetail(tourId: string): Promise<VendorTourDetail> {
    const response = await ApiService<VendorTourDetail>(`/tours/${tourId}`, 'GET');
    return unwrapResponse(response);
  },

  /** Cập nhật tour đã tồn tại — gửi nguyên payload hiện tại của form (không diff field). */
  async updateTour(tourId: string, payload: UpdateTourPayload): Promise<CreatedTour> {
    const response = await ApiService<TourDetailResponseDto>(
      `/vendor/tours/${tourId}`,
      'PUT',
      payload
    );
    const data = unwrapResponse(response);
    return { id: data.tourId, status: data.status };
  },

  /** Thêm 1 checkpoint vào tour đã tồn tại. */
  async createCheckpoint(tourId: string, payload: TourCheckpointPayload): Promise<void> {
    const response = await ApiService<TourCheckpointResponseDto>(
      `/vendor/tours/${tourId}/checkpoints`,
      'POST',
      payload
    );
    unwrapResponse(response);
  },

  /** Lấy danh sách checkpoint hiện có của 1 tour — dùng public endpoint (không có bản `/vendor/...`). */
  async getCheckpoints(tourId: string): Promise<VendorTourCheckpoint[]> {
    const response = await ApiService<VendorTourCheckpoint[]>(
      `/tours/${tourId}/checkpoints`,
      'GET'
    );
    return unwrapResponse(response);
  },

  /** Sửa 1 checkpoint đã tồn tại. */
  async updateCheckpoint(checkpointId: string, payload: TourCheckpointPayload): Promise<void> {
    const response = await ApiService<TourCheckpointResponseDto>(
      `/vendor/tours/checkpoints/${checkpointId}`,
      'PUT',
      payload
    );
    unwrapResponse(response);
  },

  /** Xóa 1 checkpoint khỏi lộ trình. */
  async deleteCheckpoint(checkpointId: string): Promise<void> {
    const response = await ApiService<void>(`/vendor/tours/checkpoints/${checkpointId}`, 'DELETE');
    if (response.error) {
      throw new Error(response.error);
    }
  },

  /** Xóa mềm tour khỏi hệ thống. */
  async deleteTour(tourId: string): Promise<void> {
    const response = await ApiService<void>(`/vendor/tours/${tourId}`, 'DELETE');
    if (response.error) {
      throw new Error(response.error);
    }
  },

  /** Gửi tour (đang DRAFT hoặc REJECTED) lên hệ thống cho Manager duyệt. */
  async submitTourForApproval(tourId: string): Promise<CreatedTour> {
    const response = await ApiService<TourDetailResponseDto>(
      `/vendor/tours/${tourId}/submit-approval`,
      'POST'
    );
    const data = unwrapResponse(response);
    return { id: data.tourId, status: data.status };
  },
};
