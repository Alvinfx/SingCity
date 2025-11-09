import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import componentTagger from './plugins/component-tagger';

export default defineConfig({
  plugins: [
    react(),
    componentTagger(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      buffer: 'buffer/',
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
      util: 'util/',
    },
  },
  define: {
    global: 'globalThis',
    'process.env': {},
    'process.version': JSON.stringify('v18.0.0'),
    'process.browser': true,
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
    include: ['buffer', 'crypto-browserify', 'stream-browserify', 'util'],
  },
  server: {
    hmr: {
      overlay: false,
      timeout: 15000,
    },
    watch: {
      // Use polling instead of native file system events (more reliable for some environments)
      usePolling: true,
      // Wait 500ms before triggering a rebuild (gives time for all files to be flushed)
      interval: 500,
      // Additional delay between file change detection and reload
      binaryInterval: 500,
    },
  },
});
