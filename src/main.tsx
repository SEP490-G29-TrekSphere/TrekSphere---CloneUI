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
