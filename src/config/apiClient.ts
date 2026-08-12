import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosProgressEvent,
  type AxiosResponse,
} from 'axios';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';
import { storage } from '@/utils/storage';
import { queryClient } from './queryClient';

/**
 * baseURL cho môi trường dev vs prod.
 *
 * Dev (localhost:3000): dùng relative path `/api/v1` → Vite proxy trong
 *   `vite.config.ts` forward sang BE production. Với browser góc nhìn là
 *   same-origin → cookie (nếu BE set Set-Cookie) sẽ được lưu & gửi kèm,
 *   tránh bị SameSite block khi FE ở localhost gọi sang api.treksphere.io.vn.
 *
 * Prod (Vercel): dùng full URL trỏ thẳng BE (đã được CORS allow). Browser gọi
 *   cross-origin, không có proxy — nếu BE set cookie phải kèm SameSite=None;
 *   Secure=true, đồng thời axios có withCredentials=true.
 *
 * Có thể set `VITE_API_WITH_CREDENTIALS=false` trong env nếu muốn tắt
 * withCredentials ở môi trường nào đó (vd: prod BE không allow credentialed
 * CORS). Mặc định bật.
 */
const isDev = import.meta.env.DEV;
const envApiUrl = import.meta.env.VITE_API_URL;

const deriveApiUrl = (rawUrl?: string): string => {
  const url = rawUrl || 'https://api.treksphere.io.vn';
  const cleanUrl = url.replace(/\/+$/, '');

  if (cleanUrl.endsWith('/api/v1')) {
    return cleanUrl;
  }
  if (cleanUrl.endsWith('/api')) {
    return `${cleanUrl}/v1`;
  }
  return `${cleanUrl}/api/v1`;
};

// Development luôn đi qua Vite proxy để cookie HttpOnly của Backend trở thành
// same-origin với localhost. VITE_API_URL chỉ được dùng làm proxy target.
// Prod without VITE_API_URL → fail fast with a clear error rather than silently
// pointing at a hardcoded URL.
const getBaseURL = (): string => {
  if (isDev && import.meta.env.VITE_API_USE_PROXY !== 'false') return '/api/v1';
  if (envApiUrl) return deriveApiUrl(envApiUrl);
  throw new Error(
    '[apiClient] VITE_API_URL is not set. ' +
      'Set it in your .env file before running a production build.'
  );
};

const baseURL = getBaseURL();
const withCredentialsEnv = import.meta.env.VITE_API_WITH_CREDENTIALS;
const withCredentials = withCredentialsEnv !== 'false'; // default true

const TIME_OUT = 60000;

const apiClient: AxiosInstance = axios.create({
  baseURL,
  timeout: TIME_OUT,
  withCredentials,
});

export type ApiResponse<T> = {
  data?: T;
  error?: string;
  status?: number;
  meta?: unknown;
  message?: string;
};

// Đánh dấu request đã retry để tránh refresh vô hạn
type RetryableRequest = AxiosError['config'] & {
  __retried?: boolean;
  __skipAuth?: boolean;
  __skipRefresh?: boolean;
};

const COOKIE_AUTH = '__COOKIE_AUTH__';

// Mọi request 401 cùng chờ một Promise refresh; khi refresh lỗi không request
// nào bị treo trong hàng đợi.
let refreshPromise: Promise<string | null> | null = null;

/**
 * Dọn sạch session khi token hết hạn hẳn (không refresh được nữa) — không chỉ
 * xóa token trong storage mà còn phải reset `useAppStore.user` (vì
 * `useAuthCheck` coi `isAuthenticated = Boolean(user) || hasToken`, còn user
 * là còn coi như đã login) và clear cache React Query (nếu không, các trang
 * đang mount vẫn hiển thị dữ liệu cũ từ cache dù đã "mất" đăng nhập).
 *
 * Guard theo `accessToken` còn tồn tại không — tránh nhiều request 401 cùng
 * lúc (cùng 1 đợt hết hạn) gọi clear/toast lặp lại nhiều lần.
 */
const clearExpiredSession = (): void => {
  const hasSession = Boolean(
    storage.get<string>('accessToken') ||
      storage.get<string>('refreshToken') ||
      useAppStore.getState().user
  );
  if (!hasSession) return;
  storage.remove('accessToken');
  storage.remove('refreshToken');
  useAppStore.getState().setUser(null);
  queryClient.clear();
  toast.warning('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.');
};

function buildAbsoluteBaseURL(): string {
  if (isDev) {
    return baseURL;
  }
  return baseURL;
}

/**
 * Gọi /auth/refresh để lấy access_token mới.
 * Trả về access_token mới, hoặc null nếu thất bại.
 *
 * Lưu ý: Vì không biết chính xác BE expect body shape nào, thử lần lượt các
 * shape phổ biến. Vì `apiClient` đã có `withCredentials: true` nên cookie
 * (nếu BE set) sẽ tự gửi kèm — không cần truyền thêm gì.
 */
async function performRefresh(): Promise<string | null> {
  const refreshToken = storage.get<string>('refreshToken');
  if (!refreshToken) {
    console.warn(
      '[apiClient] performRefresh: no refreshToken in storage — trying cookie-based refresh'
    );
  }

  const absoluteURL = `${buildAbsoluteBaseURL()}/auth/refresh-token`;
  const bodyCandidates: Array<Record<string, unknown> | null> = refreshToken
    ? [{ refreshToken }, { refresh_token: refreshToken }, { token: refreshToken }, null]
    : [null];

  for (const _body of bodyCandidates) {
    try {
      const response = await axios.post<{
        access_token?: string;
        accessToken?: string;
        refresh_token?: string;
        refreshToken?: string;
        token?: string;
        data?: {
          access_token?: string;
          accessToken?: string;
          token?: string;
          refresh_token?: string;
          refreshToken?: string;
        };
      }>(absoluteURL, _body ?? {}, { timeout: TIME_OUT, withCredentials });

      const root = response.data as Record<string, unknown>;
      const inner = (root.data as Record<string, unknown> | undefined) ?? {};
      const newAccess =
        (inner.access_token as string | undefined) ??
        (inner.accessToken as string | undefined) ??
        (inner.token as string | undefined) ??
        (root.access_token as string | undefined) ??
        (root.accessToken as string | undefined) ??
        (root.token as string | undefined);
      const newRefresh =
        (inner.refresh_token as string | undefined) ??
        (inner.refreshToken as string | undefined) ??
        (root.refresh_token as string | undefined) ??
        (root.refreshToken as string | undefined) ??
        refreshToken ??
        '';

      if (!newAccess) {
        // Backend production cũ trả user trong body và rotate token hoàn toàn
        // bằng cookie HttpOnly. HTTP 2xx ở đây nghĩa là cookie mới đã được set.
        if (response.status >= 200 && response.status < 300 && inner) return COOKIE_AUTH;
        continue;
      }

      storage.set('accessToken', newAccess);
      if (newRefresh) storage.set('refreshToken', newRefresh);
      return newAccess;
    } catch (err) {
      // Nếu lỗi 401 → refresh token sai/hết hạn → KHÔNG thử shape khác nữa
      // (vì BE đã từ chối), trả về null để caller clear storage.
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        console.error('[apiClient] refresh token returned 401 — refresh token invalid/expired');
        return null;
      }
      // Lỗi khác (network, 5xx) → thử shape tiếp theo
      console.warn('[apiClient] refresh attempt failed:', err);
    }
  }

  console.error('[apiClient] refresh token: all body shapes failed');
  return null;
}

// Request interceptor for token
apiClient.interceptors.request.use(
  (config) => {
    const retryable = config as RetryableRequest;
    // Bỏ qua nếu request được đánh dấu skipAuth (vd: login, register, verify)
    if (retryable.__skipAuth) return config;

    const token = storage.get<string>('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 bằng auto-refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const originalConfig = error.config as RetryableRequest | undefined;

    // Chỉ xử lý 401 cho request có Authorization (không phải login/register/verify)
    if (
      status !== 401 ||
      !originalConfig ||
      originalConfig.__retried ||
      originalConfig.__skipRefresh
    ) {
      if (status === 401) {
        console.warn('[apiClient] 401 received (no refresh):', originalConfig?.url);
      } else if (status) {
        console.error('[apiClient] HTTP error:', status, originalConfig?.url);
      }
      return Promise.reject(error);
    }

    // Endpoint /auth/refresh-token tự nó cũng có thể 401 khi refresh token hết hạn —
    // trong trường hợp đó axios.post trong `performRefresh` đã xử lý rồi, không
    // cần chạy vào flow này. Cờ __skipRefresh được set cho request /auth/refresh-token
    // qua `performRefresh` rồi, nên logic ở đây an toàn.
    if (originalConfig.url?.includes('/auth/refresh-token')) {
      return Promise.reject(error);
    }

    originalConfig.__retried = true;

    refreshPromise ??= performRefresh().finally(() => {
      refreshPromise = null;
    });
    const newToken = await refreshPromise;

    if (!newToken) {
      clearExpiredSession();
      return Promise.reject(error);
    }

    originalConfig.headers = originalConfig.headers ?? new axios.AxiosHeaders();
    if (newToken === COOKIE_AUTH) {
      originalConfig.headers.delete('Authorization');
    } else {
      originalConfig.headers.Authorization = `Bearer ${newToken}`;
    }
    return apiClient.request(originalConfig);
  }
);

// Centralized response handling
export const handleResponse = <T>(response: AxiosResponse<unknown>): ApiResponse<T> => {
  // BE có thể trả về response ở nhiều dạng:
  //   (a) phẳng: { user, access_token, refresh_token, ... }
  //   (b) envelope 1 lớp: { success, message, data: { user, access_token, refresh_token } }
  //   (c) envelope 2 lớp: { data: { success, data: <actual T> } }
  // Thử unwrap từ trong ra ngoài: cấp sâu nhất → nông nhất.
  const raw = response.data as unknown;
  let data: unknown;

  // Trường hợp (c): unwrap 2 lớp
  const envelopeOuter = raw as { data?: unknown } | undefined;
  const envelopeInner = envelopeOuter?.data as { data?: unknown } | undefined;
  if (envelopeInner && typeof envelopeInner === 'object' && 'data' in envelopeInner) {
    data = (envelopeInner as { data: T }).data;
  }
  // Trường hợp (b): unwrap 1 lớp — nhận diện envelope qua field `success` (boolean),
  // field này luôn có mặt trong mọi `ApiResponseXxx` thật của BE (xem `/v3/api-docs`).
  // KHÔNG đoán qua kiểu của `data` như trước — vì `data` có thể là string (vd
  // `ApiResponseString` của `/files/upload`), không chỉ object, và đoán sai khiến
  // các endpoint trả `data` dạng string bị rơi xuống nhánh "phẳng" ở dưới, trả về
  // nguyên cả envelope thay vì unwrap.
  else if (
    envelopeOuter &&
    typeof envelopeOuter === 'object' &&
    'data' in envelopeOuter &&
    typeof (envelopeOuter as { success?: unknown }).success === 'boolean'
  ) {
    data = (envelopeOuter as { data: T }).data;
  }
  // Trường hợp (a): phẳng — dùng nguyên response.data
  else {
    data = raw as T;
  }

  // Lấy message an toàn từ bất kỳ lớp nào
  const message =
    (envelopeInner as { message?: string } | undefined)?.message ??
    (envelopeOuter as { message?: string } | undefined)?.message ??
    (raw as { message?: string } | undefined)?.message;

  return { data: data as T, status: response.status, message };
};

// Error handling
const handleError = (error: unknown): ApiResponse<never> => {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as
      | {
          message?: string;
          error?: string;
          detail?: string;
          title?: string;
          error_name?: string;
          errors?: Array<{ field?: string; message?: string }>;
        }
      | undefined;
    const fieldErrors = responseData?.errors
      ?.map((e) => e.message)
      .filter(Boolean)
      .join('; ');
    const cloudflareOriginError = responseData?.error_name === 'origin_bad_gateway';
    const message =
      fieldErrors ||
      responseData?.message ||
      responseData?.error ||
      (cloudflareOriginError
        ? 'Backend không nhận được phản hồi hợp lệ từ payOS. Vui lòng thử lại sau.'
        : responseData?.detail || responseData?.title || error.message);
    return {
      error: message,
      message,
      status: error.response?.status || 500,
    };
  }
  return { error: 'An unknown error occurred', message: 'An unknown error occurred' };
};

// Hỗ trợ upload file (multipart/form-data) — gửi FormData trực tiếp qua axios.
// Trả về `data: T` là response BE trả về (đã qua envelope unwrap giống ApiService).
// `onUploadProgress` dùng để component vẽ thanh tiến trình (optional).
//
// Lưu ý: KHÔNG set thủ công `Content-Type: multipart/form-data`. Axios sẽ tự
// set header đó kèm `boundary=...` khi phát hiện body là FormData — nếu set
// thủ công sẽ thiếu boundary, BE sẽ không parse được file.
export const ApiUpload = async <T>(
  path: string,
  formData: FormData,
  methodOrProgress?: 'POST' | 'PUT' | 'PATCH' | ((progressEvent: AxiosProgressEvent) => void),
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
): Promise<ApiResponse<T>> => {
  let method: 'POST' | 'PUT' | 'PATCH' = 'POST';
  let progress = onUploadProgress;

  if (typeof methodOrProgress === 'string') {
    method = methodOrProgress;
  } else if (typeof methodOrProgress === 'function') {
    progress = methodOrProgress;
  }

  try {
    const response = await apiClient.request({
      url: path,
      method,
      data: formData,
      onUploadProgress: progress,
    });
    return handleResponse<T>(response);
  } catch (error) {
    return handleError(error);
  }
};

// General API request function
export const ApiService = async <T>(
  path: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  data?: unknown,
  params?: Record<string, string>,
  headers?: Record<string, string>
): Promise<ApiResponse<T>> => {
  try {
    const response = await apiClient.request({
      url: path,
      method,
      data,
      params,
      headers,
    });

    return handleResponse<T>(response);
  } catch (error) {
    return handleError(error);
  }
};

export default apiClient;
