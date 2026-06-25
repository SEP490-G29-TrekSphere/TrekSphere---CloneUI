import { ApiService } from '@/config/apiClient';
import type { AuthResponse, LoginPayload, RegisterPayload } from '../types';
import type { LoginFormValues, RegisterFormValues } from '../validations/auth.schema';

export const authService = {
  /**
   * ÄÄƒng nháº­p há»‡ thá»‘ng.
   */
  login: (data: LoginFormValues) =>
    ApiService<AuthResponse>('/auth/login', 'POST', data as unknown as LoginPayload),

  /**
   * ÄÄƒng kÃ½ tÃ i khoáº£n má»›i.
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
   * ÄÄƒng xuáº¥t khá»i há»‡ thá»‘ng.
   */
  logout: () => ApiService('/auth/logout', 'POST'),

  /**
   * LÃ m má»›i token khi háº¿t háº¡n.
   */
  refreshToken: (token: string) =>
    ApiService<AuthResponse>('/auth/refresh', 'POST', { refreshToken: token }),
};
