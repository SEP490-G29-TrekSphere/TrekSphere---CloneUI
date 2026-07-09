import axios from 'axios';
import { type ApiResponse, ApiService } from '@/config/apiClient';
import type {
  AuthActionResponse,
  AuthResponse,
  AuthUser,
  LoginPayload,
  RegisterPayload,
  RegisterResponseData,
  ResetPasswordPayload,
  UpdateProfilePayload,
  UserProfile,
  VerifyEmailResponse,
} from '../types';
import type {
  ChangePasswordFormValues,
  LoginFormValues,
  RegisterFormValues,
} from '../validations/auth.schema';

export const authService = {
  /**
   * Log in to the system.
   * BE: POST /api/v1/auth/login -> returns `{ user, access_token, refresh_token }`.
   */
  login: (data: LoginFormValues) =>
    ApiService<AuthResponse>('/auth/login', 'POST', data as unknown as LoginPayload),

  /**
   * Register a new user account.
   * BE: POST /api/v1/auth/register -> only returns `{ userId, email, fullName }`,
   * NO token included - FE must then call /auth/login if they want to enter the system immediately.
   */
  register: (data: RegisterFormValues): Promise<ApiResponse<RegisterResponseData>> =>
    ApiService<RegisterResponseData>('/auth/register', 'POST', {
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
    } as unknown as RegisterPayload),

  /**
   * Send a password reset request.
   */
  forgotPassword: (email: string) => ApiService('/auth/forgot-password', 'POST', { email }),

  /**
   * Reset the password using a verification token.
   */
  resetPassword: (data: ResetPasswordPayload) =>
    ApiService<AuthActionResponse>('/auth/reset-password', 'POST', data),

  /**
   * Log out of the system.
   */
  logout: () => ApiService('/auth/logout', 'POST'),

  /**
   * Refresh the token when expired.
   */
  refreshToken: (token: string) =>
    ApiService<AuthResponse>('/auth/refresh', 'POST', { refreshToken: token }),

  /**
   * Change the current password.
   */
  changePassword: (data: ChangePasswordFormValues) =>
    ApiService('/auth/change-password', 'POST', data),

  /**
   * Get the profile of the currently logged-in user.
   */
  getProfile: () => ApiService<UserProfile>('/users/me', 'GET'),

  /**
   * Update the profile of the currently logged-in user.
   */
  updateProfile: (data: UpdateProfilePayload) =>
    ApiService<UserProfile>('/users/profile', 'PUT', data),

  /**
   * Verify email via the token from the email link.
   * Uses axios directly (without interceptors) to avoid attaching accessToken
   * to verify request - token verify !== access token.
   * BE: GET /api/v1/auth/verify?token=xxx -> returns 200 JSON body.
   */
  verifyEmail: async (token: string): Promise<ApiResponse<VerifyEmailResponse>> => {
    const isDev = import.meta.env.DEV;
    const verifyURL = isDev
      ? `/api/v1/auth/verify?token=${token}`
      : `${
          import.meta.env.VITE_API_URL ?? 'https://api.treksphere.io.vn/api/v1'
        }/auth/verify?token=${token}`;
    try {
      const response = await axios.get<VerifyEmailResponse>(verifyURL, {
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

/** Helper to convert user from BE (snake_case) to the shape stored in `useAppStore`. */
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
