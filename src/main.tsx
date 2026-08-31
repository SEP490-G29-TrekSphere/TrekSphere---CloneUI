import { GoogleOAuthProvider } from '@react-oauth/google';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './assets/css/global.css';
import {
  canAutoReload,
  ErrorBoundary,
  recordReloadAndGo,
} from './shared/ui/feedback/ErrorBoundary';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

// Bắt lỗi preload chunk từ Vite (xảy ra khi deploy bản mới xoá các chunk cũ).
// Dùng chung key + counter với ErrorBoundary để chống reload loop.
window.addEventListener('vite:preload-error', (event) => {
  event.preventDefault();
  if (canAutoReload()) {
    recordReloadAndGo();
  }
});

// Always initialize light mode
try {
  document.documentElement.classList.remove('dark');
  document.documentElement.classList.add('light');
} catch (e) {
  console.error('Failed to initialize theme early:', e);
}

/**
 * Demo build: không có backend thật, mọi request API được MSW chặn ở tầng
 * network và trả mock data (xem `src/mocks/`). Set `VITE_ENABLE_MOCKS=false`
 * nếu sau này muốn nối lại backend thật.
 */
async function enableMocking() {
  if (import.meta.env.VITE_ENABLE_MOCKS === 'false') return;
  const { worker } = await import('./mocks/browser');
  await worker.start({
    onUnhandledRequest(request, print) {
      const url = new URL(request.url);
      if (
        url.pathname.includes('/node_modules/') ||
        url.pathname.includes('/@vite/') ||
        url.pathname.includes('/src/') ||
        url.pathname.endsWith('.tsx') ||
        url.pathname.endsWith('.ts') ||
        url.pathname.endsWith('.css') ||
        url.pathname.endsWith('.js') ||
        url.pathname.endsWith('.svg') ||
        url.pathname.endsWith('.png') ||
        url.pathname.endsWith('.jpg') ||
        url.pathname.endsWith('.jpeg') ||
        url.pathname.endsWith('.json') ||
        url.hostname.includes('google') ||
        url.hostname.includes('picsum')
      ) {
        return;
      }
      print.warning();
    },
    serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
  });
}

enableMocking()
  .catch((err) => {
    console.error('[mocks] Failed to start MSW worker:', err);
  })
  .finally(() => {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <ErrorBoundary>
          <BrowserRouter>
            <GoogleOAuthProvider clientId={googleClientId ?? ''}>
              <App />
            </GoogleOAuthProvider>
          </BrowserRouter>
        </ErrorBoundary>
      </StrictMode>
    );
  });
