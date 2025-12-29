import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Increase the warning limit to 2000kb (2MB) to stop the annoying warning
    chunkSizeWarningLimit: 2000, 
    rollupOptions: {
      output: {
        // This splits the code into smaller pieces to load faster
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
});