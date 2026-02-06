import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Unlock Me',
        short_name: 'UnlockMe',
        description: 'Find your perfect match',
        theme_color: '#6366f1',
        background_color: '#020617',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  build: {
    // Code splitting برای بهبود Performance
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React vendor chunk
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router')) {
            return 'react-vendor';
          }
          // Framer Motion chunk
          if (id.includes('node_modules/framer-motion')) {
            return 'framer-motion';
          }
          // Lucide React chunk (icons)
          if (id.includes('node_modules/lucide-react')) {
            return 'lucide-react';
          }
          // Socket.io chunk
          if (id.includes('node_modules/socket.io-client')) {
            return 'socket-io';
          }
          // Other large vendor chunks
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        // بهینه‌سازی نام فایل‌ها
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // بهینه‌سازی bundle size
    chunkSizeWarningLimit: 500,
    // Minification با esbuild (سریع‌تر از terser)
    minify: 'esbuild',
    // Tree shaking
    treeshake: {
      moduleSideEffects: false,
    },
    // Source maps فقط در development
    sourcemap: false,
    // CSS code splitting
    cssCodeSplit: true,
    // بهینه‌سازی assets
    assetsInlineLimit: 4096, // inline assets کوچکتر از 4KB
  },
  server: {
    host: true, // 👈 این خط حیاتی است: اجازه دسترسی به موبایل را می‌دهد
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://192.168.8.124:5000', // استفاده از IP به جای localhost
        changeOrigin: true,
        secure: false,
      },
    },
  },
});