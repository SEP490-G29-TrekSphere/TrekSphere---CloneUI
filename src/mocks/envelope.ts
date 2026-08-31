import { HttpResponse } from 'msw';

/**
 * apiClient.handleResponse() unwraps envelope (b) khi phát hiện field `success`
 * (boolean) ở top-level cùng với `data`. Mọi mock handler PHẢI trả đúng shape
 * này để FE unwrap được giống hệt response thật từ BE.
 */
export function ok<T>(data: T, message = 'OK', status = 200) {
  return HttpResponse.json(
    {
      success: true,
      code: status,
      message,
      data,
      errors: [],
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

export function created<T>(data: T, message = 'Created') {
  return ok(data, message, 201);
}

export function fail(
  message: string,
  status = 400,
  errors: Array<{ field?: string; message?: string }> = []
) {
  return HttpResponse.json(
    {
      success: false,
      code: status,
      message,
      data: null,
      errors,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/** Trả một trang dữ liệu theo shape Page<T> kiểu Spring (content/totalElements/...). */
export function page<T>(items: T[], pageParam = 0, size = 10) {
  const start = pageParam * size;
  const content = items.slice(start, start + size);
  return {
    content,
    totalElements: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / size)),
    number: pageParam,
    size,
    first: pageParam === 0,
    last: start + size >= items.length,
  };
}
