import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Update the target URL to your backend server
const BACKEND_URL = 'https://searchmystudy.com';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: BACKEND_URL,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
