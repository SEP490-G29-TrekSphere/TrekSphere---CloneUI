import axios from 'axios';
import { type ApiResponse, ApiService } from '@/config/apiClient';
import type {
  AuthResponse,
  AuthUser,
  LoginPayload,
  RegisterPayload,
  RegisterResponseData,
  UpdateProfilePayload,
  UserProfile,
} from '../types';
import type {
  ChangePasswordFormValues,
  LoginFormValues,
  RegisterFormValues,
} from '../validations/auth.schema';

export const authService = {
  /**
   * Đăng nhập hệ thống.
   * BE: POST /api/v1/auth/login → trả về `{ user, access_token, refresh_token }`.
   */
  login: (data: LoginFormValues) =>
    ApiService<AuthResponse>('/auth/login', 'POST', data as unknown as LoginPayload),

  /**
   * Đăng ký tài khoản mới.
   * BE: POST /api/v1/auth/register → chỉ trả về `{ userId, email, fullName }`,
   * KHÔNG kèm token — FE phải gọi tiếp /auth/login nếu muốn vào hệ thống luôn.
   */
  register: (
    data: RegisterFormValues
  ): Promise<{ data?: RegisterResponseData } & Record<string, unknown>> =>
    ApiService<RegisterResponseData>('/auth/register', 'POST', {
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
    } as unknown as RegisterPayload),

  /**
   * Gửi yêu cầu khôi phục mật khẩu.
   */
  forgotPassword: (email: string) => ApiService('/auth/forgot-password', 'POST', { email }),

  /**
   * Đăng xuất khỏi hệ thống.
   */
  logout: () => ApiService('/auth/logout', 'POST'),

  /**
   * Làm mới token khi hết hạn.
   */
  refreshToken: (token: string) =>
    ApiService<AuthResponse>('/auth/refresh', 'POST', { refreshToken: token }),

  /**
   * Đổi mật khẩu.
   */
  changePassword: (data: ChangePasswordFormValues) =>
    ApiService('/auth/change-password', 'POST', data),

  /**
   * Lấy thông tin hồ sơ của user đang đăng nhập.
   */
  getProfile: () => ApiService<UserProfile>('/users/profile', 'GET'),

  /**
   * Cập nhật hồ sơ của user đang đăng nhập.
   */
  updateProfile: (data: UpdateProfilePayload) =>
    ApiService<UserProfile>('/users/profile', 'PUT', data),

  /**
   * Xác thực email qua token từ link trong mail.
   * Dùng axios trực tiếp (không qua interceptors) để tránh gắn accessToken
   * vào verify request — token verify ≠ access token.
   * BE: GET /api/v1/auth/verify?token=xxx → trả về 200 JSON body.
   */
  verifyEmail: async (
    token: string
  ): Promise<ApiResponse<{ success: boolean; message: string }>> => {
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    try {
      const response = await axios.get<{ success: boolean; message: string }>(
        `${baseURL}/auth/verify?token=${token}`,
        { timeout: 60_000 }
      );
      return { data: response.data, status: response.status };
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return {
          error: (err.response?.data as { message?: string })?.message || err.message,
          status: err.response?.status,
        };
      }
      return { error: 'An unknown error occurred' };
    }
  },
};

/** Helper chuyển user từ BE (snake_case) sang shape mà `useAppStore` đang lưu. */
export function toAppStoreUser(user: AuthUser): {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  roles: string[];
} {
  return {
    id: user.id,
    name: user.fullName,
    email: user.email,
    avatarUrl: user.avatarUrl,
    roles: user.roles,
  };
}
