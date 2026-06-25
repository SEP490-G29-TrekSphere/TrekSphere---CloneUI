/**
 * Types riêng cho feature auth.
 * Chỉ những type thuộc về login/register/forgot-password mới đặt ở đây.
 */
import type { Role } from '@/constants';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: Role;
  };
}
