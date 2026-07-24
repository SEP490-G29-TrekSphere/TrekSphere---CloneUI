import type { AxiosResponse } from 'axios';
import axios from 'axios';
import type { ApiResponse } from '@/config/apiClient';
import apiClient, { handleResponse } from '@/config/apiClient';
import type { UserProfile } from '@/features/auth';
import { storage } from '@/utils/storage';

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
   */
  updateProfile: (data: FormData) => updateProfileMultipart<UserProfile>(data),
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
};

/**
 * Wrapper để dùng chung ApiService cho GET/POST/DELETE (body JSON).
 */
function ApiService<T>(
  path: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  data?: unknown
): Promise<ApiResponse<T>> {
  return apiClient
    .request({ url: path, method, data })
    .then((res: AxiosResponse) => handleResponse<T>(res))
    .catch((err: unknown) => {
      if (axios.isAxiosError(err)) {
        const responseData = err.response?.data as { message?: string; error?: string } | undefined;
        return {
          error: responseData?.message || responseData?.error || err.message,
          message: responseData?.message || responseData?.error || err.message,
          status: err.response?.status || 500,
        };
      }
      return { error: 'An unknown error occurred', message: 'An unknown error occurred' };
    });
}

/**
 * Hỗ trợ upload file (multipart/form-data) — gửi FormData trực tiếp qua axios.
 * KHÔNG set thủ công Content-Type vì axios sẽ tự thêm boundary.
 */
function ApiUpload<T>(path: string, formData: FormData): Promise<ApiResponse<T>> {
  return apiClient
    .request({ url: path, method: 'POST', data: formData })
    .then((res: AxiosResponse) => handleResponse<T>(res))
    .catch((err: unknown) => {
      if (axios.isAxiosError(err)) {
        const responseData = err.response?.data as { message?: string; error?: string } | undefined;
        return {
          error: responseData?.message || responseData?.error || err.message,
          message: responseData?.message || responseData?.error || err.message,
          status: err.response?.status || 500,
        };
      }
      return { error: 'An unknown error occurred', message: 'An unknown error occurred' };
    });
}

/**
 * Cập nhật profile bằng PUT với body là FormData (multipart/form-data).
 * Dùng trực tiếp axios thay vì ApiService vì body là FormData chứ không phải JSON.
 */
async function updateProfileMultipart<T>(formData: FormData): Promise<ApiResponse<T>> {
  try {
    const token = storage.get<string>('accessToken');
    const response = await axios.put<T>(`/api/v1/users/me`, formData, {
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
      withCredentials: true,
    });
    return handleResponse<T>(response as Parameters<typeof handleResponse<T>>[0]);
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const responseData = err.response?.data as { message?: string; error?: string } | undefined;
      return {
        error: responseData?.message || responseData?.error || err.message,
        message: responseData?.message || responseData?.error || err.message,
        status: err.response?.status || 500,
      };
    }
    return { error: 'An unknown error occurred', message: 'An unknown error occurred' };
  }
}
