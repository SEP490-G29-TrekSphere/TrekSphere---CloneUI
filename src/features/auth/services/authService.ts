import { ApiService } from '@/config/apiClient';
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
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
   */
  login: (data: LoginFormValues) =>
    ApiService<AuthResponse>('/auth/login', 'POST', data as unknown as LoginPayload),

  /**
   * Đăng ký tài khoản mới.
   */
  register: (data: RegisterFormValues) => {
    const payload: RegisterPayload = {
      name: data.fullName,
      email: data.email,
      password: data.password,
    };
    return ApiService<AuthResponse>('/auth/register', 'POST', payload);
  },

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
};
