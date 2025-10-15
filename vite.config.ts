import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load .env files
  const env = loadEnv(mode, process.cwd(), '');

  return {
    port: parseInt(env.VITE_PORT || "2000"),
    allowedHosts: env.ALLOWED_ORIGINS
      ? env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
      : ["*"],     // allow ALL hosts
    host: true,
    cors: {
      origin: '*',
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    server: {
      allowedHosts: env.ALLOWED_ORIGINS
        ? env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
        : ["*"], // allow ALL hosts
      port: parseInt(env.VITE_PORT || "2000"),
      host: true,
      cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      },
      origin: process.env.VITE_API_BASE_URL,
      proxy: {
        '/api': {
          target: 'http://localhost:2000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    }
  };
});
