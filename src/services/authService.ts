import { ApiService } from '@/config/apiClient';
import type { LoginFormValues, RegisterFormValues } from '@/validations/auth.schema';

// Khai báo kiểu dữ liệu trả về từ Backend
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export const authService = {
  /**
   * Đăng nhập hệ thống
   * @param data Dữ liệu email, password từ form
   */
  login: async (data: LoginFormValues) => {
    return ApiService<AuthResponse>('/auth/login', 'POST', data);
  },

  /**
   * Đăng xuất khỏi hệ thống
   */
  logout: async () => {
    return ApiService('/auth/logout', 'POST');
  },

  /**
   * Làm mới token khi hết hạn (nếu có dùng Refresh Token)
   */
  refreshToken: async (token: string) => {
    return ApiService<AuthResponse>('/auth/refresh', 'POST', { refreshToken: token });
  },

  /**
   * Đăng ký tài khoản mới
   */
  register: async (data: RegisterFormValues) => {
    return ApiService<AuthResponse>('/auth/register', 'POST', {
      name: data.fullName,
      email: data.email,
      password: data.password,
    });
  },
};
