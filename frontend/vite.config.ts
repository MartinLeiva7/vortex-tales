import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 800, // Increase warning threshold slightly
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Put Lucide icons into a separate chunk since they take up the most space
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            // Put React core libraries into a dedicated core chunk
            if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
              return 'vendor-react';
            }
            // General dependencies chunk
            return 'vendor-libs';
          }
        }
      }
    }
  }
})
