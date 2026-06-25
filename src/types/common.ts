/**
 * Common types dùng chung trong toàn project.
 *
 * Quy ước:
 * - Mỗi entity là 1 interface export riêng.
 * - Type riêng của feature KHÔNG đặt ở đây — đặt trong feature đó (features/<feature>/types.ts).
 */

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  role: import('@/constants').Role;
}

/**
 * Chuẩn response trả về từ Backend.
 * Đã được normalize qua `apiClient.handleResponse`.
 */
export interface ApiSuccess<T> {
  data: T;
  status: number;
  message?: string;
}

export interface ApiFailure {
  error: string;
  status: number;
  message?: string;
}

export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
