import { ApiService } from '@/config/apiClient';
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
   * BE: GET /api/v1/auth/verify?token=xxx → chuyển về login nếu thành công.
   */
  verifyEmail: (token: string) =>
    ApiService<{ success: boolean; message: string }>(`/auth/verify?token=${token}`, 'GET'),
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
