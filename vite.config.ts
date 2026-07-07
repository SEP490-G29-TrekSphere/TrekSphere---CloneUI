import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import svgr from 'vite-plugin-svgr';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.VITE_API_URL ?? 'http://localhost:3000';

  return {
    plugins: [react(), tailwindcss(), svgr()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: true,
          // Rewrite happens on Vite side; FE should call relative '/api/...'
          // so /api/v1/auth/register -> apiTarget/v1/auth/register
          rewrite: (originPath) => originPath.replace(/^\/api/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (_proxyReq, req) => {
              // eslint-disable-next-line no-console
              const targetUrl = `${apiTarget}${req.url?.replace(/^\/api/, '')}`;
              console.log(`[proxy] ${req.method} ${req.url} -> ${targetUrl}`);
            });
          },
        },
      },
    },
  };
});
