import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isChunkLoadError: boolean;
}

/**
 * Key dùng chung cho mọi cơ chế auto-reload (vite:preload-error, ErrorBoundary).
 * Lưu JSON `{ ts: number, count: number }` trong sessionStorage để chống reload loop.
 */
export const CHUNK_RELOAD_KEY = 'treksphere_chunk_reload';
const MAX_AUTO_RELOADS = 2;

export function getReloadInfo(): { ts: number; count: number } {
  try {
    const raw = sessionStorage.getItem(CHUNK_RELOAD_KEY);
    if (!raw) return { ts: 0, count: 0 };
    return JSON.parse(raw);
  } catch {
    return { ts: 0, count: 0 };
  }
}

export function canAutoReload(): boolean {
  const info = getReloadInfo();
  const now = Date.now();
  // Reset counter nếu lần reload cuối cách đây > 30s (session cũ, không phải loop)
  if (now - info.ts > 30_000) return true;
  return info.count < MAX_AUTO_RELOADS;
}

export function recordReloadAndGo(): void {
  const info = getReloadInfo();
  const now = Date.now();
  const newCount = now - info.ts > 30_000 ? 1 : info.count + 1;
  sessionStorage.setItem(CHUNK_RELOAD_KEY, JSON.stringify({ ts: now, count: newCount }));
  window.location.reload();
}

function isChunkError(error: Error | null): boolean {
  if (!error) return false;
  const message = error.message?.toLowerCase() || '';
  const name = error.name?.toLowerCase() || '';
  return (
    message.includes('failed to fetch dynamically imported module') ||
    message.includes('importing a module script failed') ||
    message.includes('loading chunk') ||
    name.includes('chunkloaderror')
  );
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    isChunkLoadError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      isChunkLoadError: isChunkError(error),
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught rendering error:', error, errorInfo);

    // Chunk error + chưa vượt giới hạn reload → tự reload lấy asset mới
    if (isChunkError(error) && canAutoReload()) {
      recordReloadAndGo();
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleClearCacheAndReload = async () => {
    try {
      // Chỉ xoá các key reload-tracking, GIỮ NGUYÊN auth/user data trong localStorage
      sessionStorage.removeItem(CHUNK_RELOAD_KEY);

      // Xoá Service Worker caches (nếu có)
      if ('caches' in window) {
        const names = await caches.keys();
        await Promise.all(names.map((n) => caches.delete(n)));
      }
    } catch (e) {
      console.error('Failed to clear caches:', e);
    }
    // Sau khi cache đã xoá xong → navigate với cache-bust param
    window.location.href = `${window.location.origin}?nocache=${Date.now()}`;
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background px-4 text-center">
          <div className="mx-auto max-w-md rounded-2xl border border-border/50 bg-card p-8 shadow-xl backdrop-blur-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>

            <h2 className="mb-2 text-xl font-bold text-foreground">
              {this.state.isChunkLoadError
                ? 'Đã có phiên bản mới của ứng dụng'
                : 'Đã xảy ra lỗi không mong muốn'}
            </h2>

            <p className="mb-6 text-sm text-muted-foreground">
              {this.state.isChunkLoadError
                ? 'Hệ thống vừa cập nhật dữ liệu. Vui lòng tải lại trang để trải nghiệm phiên bản mới nhất.'
                : 'Trình duyệt đang lưu bản cache cũ hoặc xảy ra sự cố tải tài nguyên. Vui lòng thử tải lại trang.'}
            </p>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 sm:w-auto"
              >
                Tải lại trang
              </button>
              <button
                type="button"
                onClick={this.handleClearCacheAndReload}
                className="w-full rounded-xl border border-input bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-accent sm:w-auto"
              >
                Xóa cache &amp; Tải lại
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
