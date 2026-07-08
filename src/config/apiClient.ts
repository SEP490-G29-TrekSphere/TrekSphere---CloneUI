import axios, { type AxiosError, type AxiosInstance, type AxiosResponse } from 'axios';
import { storage } from '@/utils/storage';

// Configuring Axios instance
const baseURL = import.meta.env.VITE_API_URL || 'https://api.treksphere.io.vn/api/v1';
const TIME_OUT = 60000;

const apiClient: AxiosInstance = axios.create({
  baseURL,
  timeout: TIME_OUT,
});

export type ApiResponse<T> = {
  data?: T;
  error?: string;
  status?: number;
  meta?: unknown;
  message?: string;
};

// Request interceptor for token
apiClient.interceptors.request.use(
  (config) => {
    const token = storage.get<string>('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    // Check for 401 status
    const status = error.response?.status;

    switch (status) {
      case 401:
        if (!window.location.href.includes('/login')) {
          storage.remove('accessToken');
          window.location.href = '/login';
        }
        break;
      case 403:
        // Handle forbidden
        // window.location.href = '/403';
        break;
      default:
        console.error('HTTP Error Status:', status);
    }

    return Promise.reject(error);
  }
);

// Centralized response handling
const handleResponse = <T>(response: AxiosResponse<unknown>): ApiResponse<T> => {
  // Extract custom fields if your API wrapper provides them, otherwise fallback to standard axios data
  const data = (response.data as { data?: T })?.data || (response.data as T);
  const status = (response.data as { status?: number })?.status || response.status;
  const message = (response.data as { message?: string })?.message;

  return { data, status, message };
};

// Error handling
const handleError = (error: unknown): ApiResponse<never> => {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as
      | { message?: string; errors?: Array<{ field?: string; message?: string }> }
      | undefined;
    const fieldErrors = responseData?.errors
      ?.map((e) => (e.field ? `${e.field}: ${e.message}` : e.message))
      .filter(Boolean)
      .join('; ');
    return {
      error: fieldErrors || responseData?.message || error.message,
      status: error.response?.status || 500,
    };
  }
  return { error: 'An unknown error occurred' };
};

// General API request function
export const ApiService = async <T>(
  path: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  data?: unknown
): Promise<ApiResponse<T>> => {
  try {
    const response = await apiClient.request({
      url: path,
      method,
      data,
    });

    return handleResponse<T>(response);
  } catch (error) {
    return handleError(error);
  }
};

export default apiClient;
