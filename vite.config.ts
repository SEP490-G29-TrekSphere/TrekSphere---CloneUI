import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import svgr from 'vite-plugin-svgr';

// https://vite.dev/config/
//
// IMPORTANT — DEV-ONLY PROXY (không commit lên main nếu chỉ phục vụ local debug):
//   Khi chạy `pnpm dev` tại http://localhost:3000, browser sẽ gọi request tới
//   đường dẫn tương đối `/api/...`. Vite proxy sẽ forward sang BE production,
//   giúp request là same-origin từ góc nhìn browser → cookie (nếu BE dùng
//   Set-Cookie) sẽ được lưu và gửi kèm — tránh SameSite block khi FE ở
//   localhost gọi sang domain api.treksphere.io.vn.
//
//   Khi deploy production, proxy này KHÔNG hoạt động. FE phải build với
//   VITE_API_URL trỏ thẳng BE domain (đã được CORS allow) và bỏ qua proxy.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // FE dùng VITE_API_URL có dạng https://api.treksphere.io.vn/api/v1.
  // Proxy cần origin của BE (không bao gồm /api/v1) để forward đúng path.
  const apiTarget = (env.VITE_API_URL ?? 'https://api.treksphere.io.vn')
    .replace(/\/api\/v\d+$/, '')
    .replace(/\/api$/, '');

  return {
    plugins: [react(), tailwindcss(), svgr()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3000,
      strictPort: true,
      proxy: {
        // Forward mọi request bắt đầu bằng `/api` sang BE production,
        // GIỮ NGUYÊN path. VD:
        //   FE gọi           POST /api/v1/auth/login
        //   BE nhận          POST https://api.treksphere.io.vn/api/v1/auth/login
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: true,
          // KHÔNG rewrite — BE mount ở /api/v1, giữ nguyên để BE nhận đúng route.
          configure: (proxy) => {
            proxy.on('proxyReq', (_proxyReq, req) => {
              // eslint-disable-next-line no-console
              console.log(`[proxy] ${req.method} ${req.url} -> ${apiTarget}${req.url}`);
            });
          },
        },
      },
    },
  };
});
