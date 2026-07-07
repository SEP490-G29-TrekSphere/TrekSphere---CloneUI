/**
 * Types riêng cho feature auth.
 * Chỉ những type thuộc về login/register/forgot-password mới đặt ở đây.
 */

/** Payload FE gửi lên endpoint /auth/login. */
export interface LoginPayload {
  email: string;
  password: string;
}

/** Payload FE gửi lên endpoint /auth/register. */
export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

/** User object trả về trong response của BE (snake_case, dùng `fullName`/`avatarUrl`/`roles[]`). */
export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  roles: string[];
}

/** Response envelope của `/auth/login`. BE trả token dạng snake_case. */
export interface AuthResponse {
  user: AuthUser;
  access_token: string;
  refresh_token: string;
}

/** Response.data của `/auth/register` — BE chỉ trả thông tin user, không kèm token. */
export interface RegisterResponseData {
  userId: string;
  email: string;
  fullName: string;
}

/**
 * Hồ sơ người dùng chi tiết (dùng cho màn hình View/Edit profile).
 * Giữ nguyên cấu trúc cũ để không vỡ các feature khác.
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
  role: string;
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
