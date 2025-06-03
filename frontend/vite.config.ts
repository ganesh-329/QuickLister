import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  // Enable client-side routing support for production builds
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})
