import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosProgressEvent,
  type AxiosResponse,
} from 'axios';
import {
  clearExpiredSession,
  getAccessToken,
  getRefreshToken,
  setSessionTokens,
} from '@/lib/session';
import { useAppStore } from '@/store/useAppStore';
import { isJwtExpired } from '@/utils/jwt';

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

// Dev without VITE_API_URL → use relative path so Vite proxy forwards to BE.
// Prod without VITE_API_URL → fail fast with a clear error rather than silently
// pointing at a hardcoded URL.
const getBaseURL = (): string => {
  if (envApiUrl) return deriveApiUrl(envApiUrl);
  if (isDev) return '/api/v1';
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

// Biến shared state cho refresh flow — đảm bảo nhiều request 401 đồng thời
// chỉ trigger 1 lần refresh, các request còn lại sẽ đợi token mới rồi retry.
let isRefreshing = false;

/**
 * Subscriber phải có CẢ nhánh thất bại. Trước đây chỉ có callback success nên
 * khi refresh fail, `onRefreshFailed` chỉ xoá mảng subscriber — các promise
 * đang `await` của những request 401 đến sau treo mãi mãi (spinner không bao
 * giờ tắt, `finally` của caller không chạy).
 */
interface RefreshSubscriber {
  onSuccess: (token: string) => void;
  onFailure: () => void;
}

let refreshSubscribers: RefreshSubscriber[] = [];

const subscribeTokenRefresh = (subscriber: RefreshSubscriber): void => {
  refreshSubscribers.push(subscriber);
};

// Lấy list ra trước rồi mới gọi callback — callback có thể retry request và
// đăng ký subscriber mới, không được để nó chen vào mảng đang duyệt.
const onTokenRefreshed = (token: string): void => {
  const subscribers = refreshSubscribers;
  refreshSubscribers = [];
  for (const subscriber of subscribers) subscriber.onSuccess(token);
};

const onRefreshFailed = (): void => {
  const subscribers = refreshSubscribers;
  refreshSubscribers = [];
  for (const subscriber of subscribers) subscriber.onFailure();
};

/**
 * Kết quả refresh — phân biệt rõ 3 trạng thái vì cách xử lý khác nhau hoàn toàn:
 *   - `success`      : có token mới, retry request.
 *   - `unauthorized` : BE nói refresh token không còn hợp lệ (401/403) → logout.
 *   - `error`        : network down / 5xx / timeout → CHỈ reject request đang
 *                      chờ, KHÔNG xoá session. Wifi rớt 1 nhịp không phải là
 *                      lý do để đá user ra khỏi hệ thống.
 */
type RefreshOutcome =
  | { status: 'success'; token: string }
  | { status: 'unauthorized' }
  | { status: 'error'; error: unknown };

/**
 * Gọi /auth/refresh-token để lấy access_token mới.
 *
 * Lưu ý: Vì không biết chính xác BE expect body shape nào, thử lần lượt các
 * shape phổ biến. Vì `apiClient` đã có `withCredentials: true` nên cookie
 * (nếu BE set) sẽ tự gửi kèm — không cần truyền thêm gì.
 */
async function performRefresh(): Promise<RefreshOutcome> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    console.warn(
      '[apiClient] performRefresh: no refreshToken in storage — trying cookie-based refresh'
    );
  }

  // Gọi bằng `axios` trần thay vì `apiClient`: request này KHÔNG được đi qua
  // interceptor 401, nếu không refresh fail sẽ tự trigger refresh → vòng lặp.
  const refreshURL = `${baseURL}/auth/refresh-token`;
  const bodyCandidates: Array<Record<string, unknown> | null> = [
    refreshToken ? { refreshToken } : null,
    refreshToken ? { refresh_token: refreshToken } : null,
    refreshToken ? { token: refreshToken } : null,
    null,
  ];

  let lastError: unknown = null;

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
      }>(refreshURL, _body ?? {}, { timeout: TIME_OUT, withCredentials });

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
        // Shape này không đúng → thử shape tiếp theo
        continue;
      }

      setSessionTokens(newAccess, newRefresh || refreshToken);
      return { status: 'success', token: newAccess };
    } catch (err) {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined;

      // 401/403 → BE nói rõ refresh token không dùng được nữa (sai/hết hạn/bị
      // thu hồi). KHÔNG thử shape khác, và đây là trường hợp DUY NHẤT được
      // phép logout user.
      if (status === 401 || status === 403) {
        console.error(`[apiClient] refresh token rejected by BE (${status})`);
        return { status: 'unauthorized' };
      }

      // Lỗi khác (network, timeout, 4xx do sai shape, 5xx) → thử shape tiếp theo
      lastError = err;
      console.warn('[apiClient] refresh attempt failed:', err);
    }
  }

  // Hết shape mà vẫn không có access token mới: có thể do BE lỗi hoặc shape
  // request/response đổi. Không kết luận được là refresh token hết hạn → giữ
  // session, chỉ báo lỗi cho request đang chờ.
  console.error('[apiClient] refresh token: all body shapes failed');
  return {
    status: 'error',
    error: lastError ?? new Error('[apiClient] refresh returned no access token'),
  };
}

/**
 * Đảm bảo trong storage có access token còn hạn — dùng cho lúc app vừa khởi
 * động (F5 / mở lại tab) khi access token đã hết hạn nhưng refresh token vẫn
 * còn: refresh im lặng 1 lần thay vì đá user về `/login`.
 *
 * Trả `true` nếu sau khi chạy đã có token hợp lệ. Dùng chung state
 * `isRefreshing`/`refreshSubscribers` với response interceptor nên nhiều nơi
 * gọi cùng lúc vẫn chỉ có 1 request refresh thật sự.
 */
export async function ensureFreshSession(): Promise<boolean> {
  const accessToken = getAccessToken();
  if (accessToken && !isJwtExpired(accessToken)) return true;
  if (!getRefreshToken()) return false;

  if (isRefreshing) {
    return new Promise<boolean>((resolve) => {
      subscribeTokenRefresh({
        onSuccess: () => resolve(true),
        onFailure: () => resolve(false),
      });
    });
  }

  isRefreshing = true;
  let outcome: RefreshOutcome;
  try {
    outcome = await performRefresh();
  } finally {
    isRefreshing = false;
  }

  if (outcome.status === 'success') {
    onTokenRefreshed(outcome.token);
    return true;
  }

  onRefreshFailed();
  if (outcome.status === 'unauthorized') clearExpiredSession('refresh-failed');
  return false;
}

// Request interceptor for token
apiClient.interceptors.request.use(
  (config) => {
    const retryable = config as RetryableRequest;
    // Bỏ qua nếu request được đánh dấu skipAuth (vd: login, register, verify)
    if (retryable.__skipAuth) return config;

    const token = getAccessToken();
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

    // `performRefresh` gọi bằng `axios.post` trần (không qua `apiClient`) nên
    // 401 của chính /auth/refresh-token không chạy vào interceptor này. Giữ
    // check như một chốt chặn phòng khi sau này ai đó đổi sang dùng apiClient —
    // nếu không, refresh fail sẽ tự gọi refresh lại thành vòng lặp.
    if (originalConfig.url?.includes('/auth/refresh-token')) {
      return Promise.reject(error);
    }

    // Guest (chưa từng đăng nhập) cũng có thể ăn 401 khi vào endpoint yêu cầu
    // auth. Trường hợp đó không có "phiên" nào để hết hạn — chỉ reject, không
    // toast, không điều hướng về /login.
    const hasSession = Boolean(
      getAccessToken() || getRefreshToken() || useAppStore.getState().user
    );
    if (!hasSession) {
      console.warn('[apiClient] 401 for request without session:', originalConfig?.url);
      return Promise.reject(error);
    }

    // Có refresh token trong storage không?
    if (!getRefreshToken()) {
      console.warn('[apiClient] 401 received, no refresh token available:', originalConfig?.url);
      clearExpiredSession('refresh-token-missing');
      return Promise.reject(error);
    }

    originalConfig.__retried = true;

    if (!isRefreshing) {
      isRefreshing = true;
      let outcome: RefreshOutcome;
      try {
        outcome = await performRefresh();
      } finally {
        // Phải nằm trong `finally`: nếu `performRefresh` throw (bug ngoài dự
        // kiến), cờ này kẹt ở `true` vĩnh viễn và MỌI request 401 sau đó sẽ
        // rơi vào nhánh "đợi token mới" — không ai gọi refresh nữa nên tất cả
        // treo mãi.
        isRefreshing = false;
      }

      if (outcome.status === 'success') {
        onTokenRefreshed(outcome.token);
        // Retry request hiện tại với token mới
        originalConfig.headers = originalConfig.headers ?? new axios.AxiosHeaders();
        originalConfig.headers.Authorization = `Bearer ${outcome.token}`;
        return apiClient.request(originalConfig);
      }

      // Chỉ dọn session khi BE khẳng định refresh token không còn hợp lệ.
      // Lỗi network/5xx (`status === 'error'`) → giữ nguyên session để user
      // thử lại được, không bắt đăng nhập lại vì mạng lỗi.
      if (outcome.status === 'unauthorized') {
        clearExpiredSession('refresh-failed');
      }
      onRefreshFailed();
      return Promise.reject(error);
    }

    // Đang refresh rồi → đợi token mới rồi retry. Nếu refresh fail thì reject
    // bằng chính lỗi 401 của request này (trước đây promise bị bỏ treo).
    return new Promise<AxiosResponse>((resolve, reject) => {
      subscribeTokenRefresh({
        onSuccess: (token) => {
          originalConfig.headers = originalConfig.headers ?? new axios.AxiosHeaders();
          originalConfig.headers.Authorization = `Bearer ${token}`;
          apiClient.request(originalConfig).then(resolve).catch(reject);
        },
        onFailure: () => reject(error),
      });
    });
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
          errors?: Array<{ field?: string; message?: string }>;
        }
      | undefined;
    const fieldErrors = responseData?.errors
      ?.map((e) => e.message)
      .filter(Boolean)
      .join('; ');
    const message = fieldErrors || responseData?.message || responseData?.error || error.message;
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
  params?: Record<string, string>
): Promise<ApiResponse<T>> => {
  try {
    const response = await apiClient.request({
      url: path,
      method,
      data,
      params,
    });

    return handleResponse<T>(response);
  } catch (error) {
    return handleError(error);
  }
};

export default apiClient;
