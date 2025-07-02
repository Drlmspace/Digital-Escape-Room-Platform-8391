import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild', // Use esbuild instead of terser for faster builds
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Create vendor chunks based on node_modules
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('react-router')) {
              return 'router';
            }
            if (id.includes('lucide-react') || id.includes('react-icons')) {
              return 'icons';
            }
            if (id.includes('framer-motion')) {
              return 'animation';
            }
            if (id.includes('echarts')) {
              return 'charts';
            }
            if (id.includes('canvas-confetti') || id.includes('date-fns')) {
              return 'utils';
            }
            // All other vendor dependencies
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 600,
    assetsInlineLimit: 4096
  },
  server: {
    port: 3000,
    host: true
  },
  preview: {
    port: 3000,
    host: true
  },
  define: {
    global: 'globalThis'
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'lucide-react'
    ]
  }
});