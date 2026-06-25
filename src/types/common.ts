/**
 * Common types dÃ¹ng chung trong toÃ n project.
 *
 * Quy Æ°á»›c:
 * - Má»—i entity lÃ  1 interface export riÃªng.
 * - Type riÃªng cá»§a feature KHÃ”NG Ä‘áº·t á»Ÿ Ä‘Ã¢y â€” Ä‘áº·t trong feature Ä‘Ã³ (features/<feature>/types.ts).
 */

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  role: import('@/constants').Role;
}

/**
 * Chuáº©n response tráº£ vá» tá»« Backend.
 * ÄÃ£ Ä‘Æ°á»£c normalize qua `apiClient.handleResponse`.
 */
export interface ApiSuccess<T> {
  data: T;
  status: number;
  message?: string;
}

export interface ApiFailure {
  error: string;
  status: number;
  message?: string;
}

export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
