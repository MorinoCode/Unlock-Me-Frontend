import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  resolve: {
    dedupe: ['react', 'react-dom', 'react/jsx-runtime'],
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Unlock Me',
        short_name: 'UnlockMe',
        description: 'Find your perfect match',
        theme_color: '#6366f1',
        background_color: '#020617',
        display: 'standalone',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any'
          }
        ]
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        // manualChunks خاموش تا ترتیب لود درست باشه و خطای "setting 'Activity'" (lucide-react) و مشابهش نیاد
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