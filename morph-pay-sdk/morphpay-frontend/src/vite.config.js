import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import nodePolyfills from 'rollup-plugin-node-polyfills';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Polyfill Node.js core modules
      buffer: 'buffer',
      process: 'process/browser',
      stream: 'stream-browserify',
    },
  },
  define: {
    global: 'globalThis', // Fix "global is not defined"
  },
  optimizeDeps: {
    include: ['buffer', 'process'],
  },
  build: {
    rollupOptions: {
      plugins: [
        nodePolyfills(),
      ],
    },
  },
});
