import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: ['es2020', 'safari14'],
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('recharts') || id.includes('leaflet') || id.includes('framer-motion')) {
            return 'vendor-heavy';
          }
          if (id.includes('@supabase')) return 'vendor-supabase';
          if (id.includes('react-dom') || id.includes('react-router') || id.includes('/react/')) {
            return 'vendor-react';
          }
        },
      },
    },
  },
  server: {
    host: true, // localhost + 127.0.0.1 (vermeidet ERR_CONNECTION_REFUSED)
    port: 5173,
    strictPort: false,
  },
})
