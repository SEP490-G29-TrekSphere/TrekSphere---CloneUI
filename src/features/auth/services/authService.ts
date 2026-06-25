import { ApiService } from '@/config/apiClient';
import type { AuthResponse, LoginPayload, RegisterPayload } from '../types';
import type { LoginFormValues, RegisterFormValues } from '../validations/auth.schema';

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
   * Đăng xuất khỏi hệ thống.
   */
  logout: () => ApiService('/auth/logout', 'POST'),

  /**
   * Làm mới token khi hết hạn.
   */
  refreshToken: (token: string) =>
    ApiService<AuthResponse>('/auth/refresh', 'POST', { refreshToken: token }),
};
