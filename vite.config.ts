import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load .env files
  const env = loadEnv(mode, process.cwd(), '');

  return {
    port: parseInt(env.VITE_PORT),
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
    // server: {
    //   origin: process.env.VITE_API_BASE_URL,
    //   proxy: {
    //     '/api': {
    //       target: 'http://localhost:12000',
    //       changeOrigin: true,
    //       rewrite: (path) => path.replace(/^\/api/, '')
    //     }
    //   }
    // }
  };
});
