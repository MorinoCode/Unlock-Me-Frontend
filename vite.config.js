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
        theme_color: '#ffffff',
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