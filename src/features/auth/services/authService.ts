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
  register: (data: RegisterFormValues): Promise<ApiResponse<RegisterResponseData>> =>
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
   * Endpoint: GET /api/v1/users/me
   */
  getProfile: () => ApiService<UserProfile>('/users/me', 'GET'),

  /**
   * Cập nhật hồ sơ của user đang đăng nhập.
   */
  updateProfile: (data: UpdateProfilePayload) =>
    ApiService<UserProfile>('/users/profile', 'PUT', data),

  /**
   * Xác thực email qua token từ link trong mail.
   * Dùng axios trực tiếp (không qua interceptors) để tránh gắn accessToken
   * vào verify request — token verify ≠ access token.
   * BE: GET /api/v1/auth/verify?token=xxx → trả về cùng shape với /auth/login:
   *      { user, access_token, refresh_token } để FE đăng nhập thẳng vào Home.
   *      Nếu BE chỉ trả `{ success, message }` thì vẫn chấp nhận — FE xử lý fallback
   *      trong component (chỉ show success, đi user phải login lại).
   */
  verifyEmail: async (
    token: string
  ): Promise<ApiResponse<Partial<AuthResponse> & { success?: boolean; message?: string }>> => {
    // Dev dùng relative path để qua Vite proxy (same-origin → cookie work).
    // Prod dùng absolute URL (cross-origin → BE cần CORS allow).
    const isDev = import.meta.env.DEV;
    const verifyURL = isDev
      ? `/api/v1/auth/verify?token=${token}`
      : `${
          import.meta.env.VITE_API_URL ?? 'https://api.treksphere.io.vn/api/v1'
        }/auth/verify?token=${token}`;
    try {
      const response = await axios.get<
        Partial<AuthResponse> & { success?: boolean; message?: string }
      >(verifyURL, {
        timeout: 60_000,
        // Bỏ qua interceptor để không gắn accessToken vào verify request
        __skipAuth: true,
        __skipRefresh: true,
      } as never);
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
