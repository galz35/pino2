import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const appBase = process.env.VITE_APP_BASENAME || '/dev/';
const backendOrigin = process.env.VITE_DEV_BACKEND_ORIGIN || 'http://127.0.0.1:3010';

export default defineConfig({
  base: appBase,
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api-dev/socket.io': {
        target: backendOrigin,
        changeOrigin: true,
        ws: true,
        rewrite: (path) => path.replace(/^\/api-dev\/socket\.io/, '/socket.io'),
      },
      '/api-dev': {
        target: backendOrigin,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-dev/, '/api'),
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined;
          }

          if (
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('/react-router-dom/')
          ) {
            return 'vendor-react';
          }

          if (id.includes('/recharts/')) {
            return 'vendor-charts';
          }

          if (
            id.includes('/axios/') ||
            id.includes('/lucide-react/') ||
            id.includes('/date-fns/')
          ) {
            return 'vendor-utils';
          }

          return undefined;
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
