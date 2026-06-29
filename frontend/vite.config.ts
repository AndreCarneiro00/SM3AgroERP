import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          mui: [
            '@emotion/react',
            '@emotion/styled',
            '@mui/icons-material',
            '@mui/material',
          ],
          query: [
            '@tanstack/react-query',
            '@tanstack/react-query-devtools',
            'zustand',
          ],
          charts: ['recharts'],
        },
      },
    },
  },
});
