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

export interface ForgotPasswordResponse {
  message: string;
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

/**
 * Hồ sơ người dùng chi tiết (dùng cho màn hình View/Edit profile).
 */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  username?: string;
  gender?: 'male' | 'female' | 'other';
  dateOfBirth?: string;
  address?: string;
  bio?: string;
  interests?: string[];
  stats?: {
    toursCount: number;
    postsCount: number;
    followersCount: number;
  };
  joinedAt?: string;
  role: Role;
}

/**
 * Payload cập nhật hồ sơ (mọi field optional vì update từng phần).
 */
export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  avatar?: string;
  gender?: 'male' | 'female' | 'other';
  dateOfBirth?: string;
  address?: string;
  bio?: string;
  interests?: string[];
}
