import { ApiService, ApiUpload } from '@/config/apiClient';
import type { UserProfile } from '@/features/auth';

/**
 * Service gọi API liên quan tới profile.
 * Tách riêng khỏi authService để dễ mở rộng (upload avatar, change password, ...).
 */
export const profileService = {
  /** Lấy thông tin cá nhân. */
  getProfile: () => ApiService<UserProfile>('/users/me', 'GET'),
  /**
   * Cập nhật thông tin cá nhân bằng multipart/form-data.
   * API PUT /users/me yêu cầu Content-Type: multipart/form-data với các fields:
   * - fullName: string
   * - phone: string
   * - dateOfBirth: string (format "yyyy-MM-dd")
   * - gender: string (ví dụ "MALE")
   * - avatar: File (binary) - optional, chỉ gửi khi user đổi ảnh
   *
   * KHÔNG set Content-Type header thủ công - axios sẽ tự set multipart boundary.
   *
   * Đi qua `ApiUpload` (apiClient) để hưởng đủ interceptor: gắn Bearer token,
   * auto-refresh khi 401, dọn phiên khi refresh token hết hạn. Bản cũ gọi
   * `axios.put` trần với URL hard-code `/api/v1/users/me` nên vừa 404 trên
   * production (không có Vite proxy), vừa không bao giờ được refresh token.
   */
  updateProfile: (data: FormData) => ApiUpload<UserProfile>('/users/me', data, 'PUT'),
  /**
   * Upload 1 file (ảnh) lên BE → trả về URL string.
   * Endpoint: POST /files/upload?folder=<folder>
   * Body: FormData với field `file`.
   *
   * BE endpoint này KHÔNG theo đúng convention envelope chung (field `data`) —
   * nó trả URL qua field `message`: `{ success, code, message: "<url>", timestamp }`,
   * không có `data`. `handleResponse` không tìm thấy `data` nên rơi vào nhánh
   * "phẳng", trả nguyên cả envelope làm `data`. Unwrap thủ công lại ở đây.
   */
  uploadFile: async (file: File, folder = 'avatars') => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await ApiUpload<string>(
      `/files/upload?folder=${encodeURIComponent(folder)}`,
      formData
    );
    if (typeof res.data === 'string' && res.data) return res;
    if (typeof res.message === 'string' && res.message) return { ...res, data: res.message };
    return res;
  },
  /**
   * Upload nhiều file trong 1 request → trả về mảng URL theo đúng thứ tự file gửi lên.
   * Endpoint: POST /files/upload/batch?folder=<folder>, body FormData với field `files` lặp lại.
   *
   * Khác với `/files/upload` (trả URL qua `message`), endpoint này theo đúng envelope chuẩn
   * (`ApiResponseListString`) nên `handleResponse` unwrap được `data` — không cần fallback.
   */
  uploadFiles: async (files: File[], folder = 'general') => {
    const formData = new FormData();
    for (const file of files) formData.append('files', file);
    return ApiUpload<string[]>(
      `/files/upload/batch?folder=${encodeURIComponent(folder)}`,
      formData
    );
  },
};
