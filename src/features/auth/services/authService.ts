import axios from 'axios';
import { type ApiResponse, ApiService } from '@/config/apiClient';
import type {
  AuthActionResponse,
  AuthResponse,
  AuthUser,
  ChangePasswordPayload,
  LoginPayload,
  RegisterPayload,
  RegisterResponseData,
  ResetPasswordPayload,
  UpdateProfilePayload,
  UserProfile,
  VerifyEmailResponse,
} from '../types';
import type { LoginFormValues, RegisterFormValues } from '../validations/auth.schema';

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
   * BE: POST /api/v1/auth/refresh-token -> returns envelope `{ success, code, message, data: UserResponse }`.
   * Trong TH token nằm trong HttpOnly cookie thì body có thể rỗng.
   */
  refreshToken: (token: string) =>
    ApiService<AuthResponse>('/auth/refresh-token', 'POST', { refreshToken: token }),

  /**
   * Change the current password.
   */
  changePassword: (data: ChangePasswordPayload) => {
    return ApiService('/auth/change-password', 'POST', data);
  },

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
   * Verify email qua token từ link trong email.
   * Dùng `axios` trực tiếp (không qua `ApiService`) để bypass interceptors.
   *
   * BE spec thật (theo swagger):
   *   GET /api/v1/auth/verify?token=xxx
   *   -> 200:
   *   {
   *     success: boolean,
   *     code: number,
   *     message: string,
   *     data: string,   // CHỈ STRING (vd "Email verified successfully"),
   *                     // KHÔNG chứa user/access_token/refresh_token ở đây.
   *     errors: FieldErrorDetail[],
   *     timestamp: string
   *   }
   *
   * Lưu ý quan trọng:
   *   1. Token trong query string KHÁC accessToken — KHÔNG gắn Bearer ở đây.
   *   2. BE verify xong không cấp token trong body — user phải /auth/login lại
   *      (token thường được set qua HttpOnly cookie bởi Spring Security).
   *   3. Giữ các field optional (`access_token`, `refresh_token`, `user`) để
   *      backward-compat nếu sau này BE có thay đổi; đồng thời nếu BE trả
   *      `code !== 200` thì vẫn coi là failure.
   */
  verifyEmail: async (token: string): Promise<ApiResponse<VerifyEmailResponse>> => {
    // Luôn có fallback cứng: không để env rỗng/undefined/blank làm hỏng URL.
    // Dùng trim() để catch cả trường hợp VITE_API_URL chỉ chứa khoảng trắng.
    const rawApiUrl = import.meta.env.VITE_API_URL;
    const apiBase = rawApiUrl?.trim() ? rawApiUrl.trim() : 'https://api.treksphere.io.vn/api/v1';
    const cleanBase = apiBase.replace(/\/+$/, '');
    const verifyURL = `${cleanBase}/auth/verify?token=${encodeURIComponent(token)}`;

    // ── Debug-only logging (giúp truy response shape thật của BE) ─────────────
    // Có thể tắt sau khi đã ổn định bằng cách đổi flag này về false.
    const DEBUG = true;
    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.group('[verifyEmail] Request');
      // eslint-disable-next-line no-console
      console.log('URL:', verifyURL);
      // eslint-disable-next-line no-console
      console.log('token (preview):', `${token.slice(0, 20)}...`);
      // eslint-disable-next-line no-console
      console.log('VITE_API_URL env:', import.meta.env.VITE_API_URL ?? '(using fallback)');
      // eslint-disable-next-line no-console
      console.groupEnd();
    }

    try {
      const response = await axios.get<unknown>(verifyURL, {
        timeout: 60_000,
        // Dùng raw axios (không qua apiClient), nên không có interceptor để skip.
        // Giữ 2 cờ này để dễ hiểu ý đồ cho người đọc.
        __skipAuth: true,
        __skipRefresh: true,
      } as never);

      if (DEBUG) {
        // eslint-disable-next-line no-console
        console.group('[verifyEmail] Response');
        // eslint-disable-next-line no-console
        console.log('HTTP status:', response.status);
        // eslint-disable-next-line no-console
        console.log('Raw body:', JSON.stringify(response.data, null, 2));
        // eslint-disable-next-line no-console
        console.groupEnd();
      }

      // ── Unwrap envelope theo đúng spec ApiResponseString ───────────────────
      // BE trả { success, code, message, data: <unknown>, errors, timestamp }.
      // Field `data` thường là string (vd "Email verified successfully") hoặc
      // có thể là object tùy BE. Ta cố gắng unwrap robust:
      const envelope = response.data as {
        success?: boolean;
        code?: number;
        message?: string;
        data?: unknown;
        errors?: Array<{ field?: string; message?: string }>;
      } | null;

      // Trường hợp BE trả phẳng (không envelope, hiếm gặp) — fallback.
      const innerData = envelope && typeof envelope === 'object' ? envelope.data : undefined;

      // Thử parse innerData thành VerifyEmailResponse (nếu là object có user+token).
      // Nếu innerData là string → unwrapped = { message: <string>, success: true }.
      let unwrapped: VerifyEmailResponse;
      if (innerData && typeof innerData === 'object') {
        unwrapped = innerData as VerifyEmailResponse;
      } else if (typeof innerData === 'string') {
        unwrapped = { message: innerData, success: true };
      } else {
        unwrapped = {};
      }

      // Quy ước "thành công":
      //   1. HTTP 200-299
      //   2. envelope.success !== false (mặc định true nếu BE không set)
      //   3. envelope.code không ở trạng thái error (mặc định 200)
      const httpOk = response.status >= 200 && response.status < 300;
      const apiSuccess = envelope?.success !== false;
      const codeOk = !envelope?.code || envelope.code >= 200;
      const isOk = httpOk && apiSuccess && codeOk;

      if (!isOk) {
        return {
          error: envelope?.message || 'Xác thực thất bại. Vui lòng thử lại.',
          message: envelope?.message,
          status: response.status,
        };
      }

      return {
        data: unwrapped,
        status: response.status,
        message: envelope?.message ?? unwrapped.message,
      };
    } catch (err) {
      if (DEBUG) {
        // eslint-disable-next-line no-console
        console.group('[verifyEmail] Error');
        // eslint-disable-next-line no-console
        console.error('AxiosError:', err);
        // eslint-disable-next-line no-console
        console.error(
          'Response body:',
          axios.isAxiosError(err) ? JSON.stringify(err.response?.data, null, 2) : '(no axios err)'
        );
        // eslint-disable-next-line no-console
        console.error('HTTP status:', axios.isAxiosError(err) ? err.response?.status : '(n/a)');
        // eslint-disable-next-line no-console
        console.groupEnd();
      }
      if (axios.isAxiosError(err)) {
        const responseData = err.response?.data as { message?: string; error?: string } | undefined;
        return {
          error: responseData?.message || responseData?.error || err.message,
          message: responseData?.message || err.message,
          status: err.response?.status,
        };
      }
      return { error: 'An unknown error occurred', message: 'An unknown error occurred' };
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
