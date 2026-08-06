import { type ApiResponse, ApiService, ApiUpload } from '@/config/apiClient';
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
 *   PUT    /vendor/tours/{id}/approve                — Manager duyệt tour đang PENDING_APPROVAL
 *   PUT    /vendor/tours/{id}/reject                 — Manager từ chối tour PENDING_APPROVAL (kèm reason)
 *   PUT    /vendor/tours/{id}/hide                   — Manager ẩn tour APPROVED nếu vi phạm (kèm reason)
 *   POST   /vendor/tours/{id}/revert-to-draft         — chuyển REJECTED về DRAFT (Staff) hoặc
 *                                                        PENDING_APPROVAL (Manager), BE tự quyết theo role
 *   PUT    /vendor/tours/{id}/unhide                  — Manager mở lại tour HIDDEN, đưa về APPROVED
 *   POST   /vendor/tours/{id}/restore                 — Manager khôi phục tour đã xóa mềm, đưa về
 *                                                        PENDING_APPROVAL (chưa có UI gọi, xem ghi chú
 *                                                        tại định nghĩa hàm `restoreTour` bên dưới)
 *
 * LƯU Ý: `/vendor/tours/{id}` KHÔNG có method GET (đã xác nhận qua OpenAPI spec —
 * path đó chỉ khai báo `put`/`delete`). Muốn lấy chi tiết 1 tour để đổ vào form
 * Sửa phải dùng endpoint public `GET /tours/{id}` (tag `Tour`, không cần đăng
 * nhập) — response cùng schema `TourDetailResponse`. Tương tự, danh sách checkpoint
 * của tour cũng chỉ có bản public `GET /tours/{tourId}/checkpoints` (không có bản
 * `/vendor/...`), dùng chung cho cả 2 role.
 *
 * LƯU Ý QUAN TRỌNG: `createTour`/`updateTour`/`createCheckpoint`/`updateCheckpoint`
 * bắt buộc `Content-Type: multipart/form-data` (đã xác nhận qua `/v3/api-docs` — cả
 * 4 request này khai báo `requestBody.content["multipart/form-data"]`, KHÔNG phải
 * JSON — gửi JSON thẳng sẽ bị BE từ chối 415/400, đây chính là lỗi tạo tour trước đây).
 *
 * ẢNH BÌA — vì sao gửi CẢ `coverImage` (file) LẪN `coverImageUrl` (string):
 * Hai nguồn tài liệu của BE đang mâu thuẫn nhau.
 *   - Tài liệu tích hợp FE (BE gửi) ghi form tạo tour gồm `coverImage` + `tourImages` dạng file.
 *   - Nhưng `/v3/api-docs` thì `CreateTourRequest`/`UpdateTourRequest` KHÔNG có field ảnh nào,
 *     kể cả `coverImageUrl` — trong khi springdoc rõ ràng ghi nhận được field file ở các DTO
 *     khác (`UpdateProfileRequest.avatar`, `VendorProfileUpdateRequest.logo`,
 *     `PorterProfileRequest.avatarFile` đều có `format: binary`).
 * Thực tế: tour tạo ngày 01/08 lưu được ảnh qua `coverImageUrl`, tour tạo ngày 04/08 thì mất ảnh.
 * Spring bỏ qua part lạ mà không báo lỗi, nên gửi cả hai là an toàn: BE đọc field nào cũng chạy.
 * Khi BE xác nhận tên field thật thì bỏ field thừa đi.
 */

interface VendorTourResponseDto {
  tourId: string;
  tourName: string;
  basePrice: number;
  difficulty: ApiDifficulty;
  status: ApiStatus;
  coverImageUrl: string | null;
  createdAt: string;
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

/** Build FormData cho các request multipart/form-data — bỏ qua field undefined/null. */
function toFormData(
  fields: Record<string, string | number | boolean | File | undefined | null>
): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null) continue;
    formData.append(key, value instanceof File ? value : String(value));
  }
  return formData;
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
    createdAt: dto.createdAt,
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
    const formData = toFormData({
      tourName: payload.tourName,
      description: payload.description,
      difficulty: payload.difficulty,
      location: payload.location,
      durationDays: payload.durationDays,
      basePrice: payload.basePrice,
      minCapacity: payload.minCapacity,
      maxCapacity: payload.maxCapacity,
      coverImageUrl: payload.coverImageUrl,
      coverImage: payload.coverImage,
    });
    const response = await ApiUpload<TourDetailResponseDto>('/vendor/tours', formData);
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
    const formData = toFormData({
      tourName: payload.tourName,
      description: payload.description,
      difficulty: payload.difficulty,
      location: payload.location,
      durationDays: payload.durationDays,
      basePrice: payload.basePrice,
      minCapacity: payload.minCapacity,
      maxCapacity: payload.maxCapacity,
      coverImageUrl: payload.coverImageUrl,
      coverImage: payload.coverImage,
    });
    const response = await ApiUpload<TourDetailResponseDto>(
      `/vendor/tours/${tourId}`,
      formData,
      'PUT'
    );
    const data = unwrapResponse(response);
    return { id: data.tourId, status: data.status };
  },

  /** Thêm 1 checkpoint vào tour đã tồn tại. */
  async createCheckpoint(tourId: string, payload: TourCheckpointPayload): Promise<void> {
    const formData = toFormData({
      checkpointName: payload.checkpointName,
      description: payload.description,
      checkpointOrder: payload.checkpointOrder,
      latitude: payload.latitude,
      longitude: payload.longitude,
      altitude: payload.altitude,
      checkpointImageUrl: payload.checkpointImageUrl,
    });
    const response = await ApiUpload<TourCheckpointResponseDto>(
      `/vendor/tours/${tourId}/checkpoints`,
      formData
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
    const formData = toFormData({
      checkpointName: payload.checkpointName,
      description: payload.description,
      checkpointOrder: payload.checkpointOrder,
      latitude: payload.latitude,
      longitude: payload.longitude,
      altitude: payload.altitude,
      checkpointImageUrl: payload.checkpointImageUrl,
    });
    const response = await ApiUpload<TourCheckpointResponseDto>(
      `/vendor/tours/checkpoints/${checkpointId}`,
      formData,
      'PUT'
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

  /** Duyệt tour đang PENDING_APPROVAL — không cần body. */
  async approveTour(tourId: string): Promise<CreatedTour> {
    const response = await ApiService<TourDetailResponseDto>(
      `/vendor/tours/${tourId}/approve`,
      'PUT'
    );
    const data = unwrapResponse(response);
    return { id: data.tourId, status: data.status };
  },

  /** Từ chối tour đang PENDING_APPROVAL — bắt buộc kèm lý do. */
  async rejectTour(tourId: string, reason: string): Promise<CreatedTour> {
    const response = await ApiService<TourDetailResponseDto>(
      `/vendor/tours/${tourId}/reject`,
      'PUT',
      { reason }
    );
    const data = unwrapResponse(response);
    return { id: data.tourId, status: data.status };
  },

  /** Ẩn tour đã APPROVED nếu phát hiện vi phạm — bắt buộc kèm lý do. */
  async hideTour(tourId: string, reason: string): Promise<CreatedTour> {
    const response = await ApiService<TourDetailResponseDto>(
      `/vendor/tours/${tourId}/hide`,
      'PUT',
      { reason }
    );
    const data = unwrapResponse(response);
    return { id: data.tourId, status: data.status };
  },

  /**
   * Chuyển tour REJECTED về DRAFT (Staff) hoặc PENDING_APPROVAL (Manager) — BE tự quyết định
   * trạng thái đích theo role của người gọi, FE gọi chung 1 API cho cả 2 role, không cần body.
   */
  async revertTourToDraft(tourId: string): Promise<CreatedTour> {
    const response = await ApiService<TourDetailResponseDto>(
      `/vendor/tours/${tourId}/revert-to-draft`,
      'POST'
    );
    const data = unwrapResponse(response);
    return { id: data.tourId, status: data.status };
  },

  /** Mở lại tour đang HIDDEN — đưa về APPROVED. Chỉ Manager. */
  async unhideTour(tourId: string): Promise<CreatedTour> {
    const response = await ApiService<TourDetailResponseDto>(
      `/vendor/tours/${tourId}/unhide`,
      'PUT'
    );
    const data = unwrapResponse(response);
    return { id: data.tourId, status: data.status };
  },

  /**
   * Khôi phục 1 tour đã xóa mềm — đưa về PENDING_APPROVAL. Chỉ Manager.
   * LƯU Ý: chưa có UI nào gọi hàm này — BE chưa xác nhận cách FE xem được danh sách tour đã
   * xóa mềm (không có param lọc hay field đánh dấu trên `GET /vendor/tours`). Thêm sẵn để dùng
   * ngay khi có entry point.
   */
  async restoreTour(tourId: string): Promise<CreatedTour> {
    const response = await ApiService<TourDetailResponseDto>(
      `/vendor/tours/${tourId}/restore`,
      'POST'
    );
    const data = unwrapResponse(response);
    return { id: data.tourId, status: data.status };
  },
};
