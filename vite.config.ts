import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Read the Room',
        short_name: 'ReadTheRoom',
        description: 'Diagnostic selling training game',
        theme_color: '#0F1419',
        background_color: '#0F1419',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,json,png,svg,ico}'],
        runtimeCaching: [
          {
            urlPattern: /\/cards(\?.*)?$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'cards-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 86400 },
            },
          },
          {
            urlPattern: /\/progress$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'progress-cache',
              networkTimeoutSeconds: 5,
            },
          },
        ],
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
    exclude: ['server/**', 'node_modules/**'],
  },
})
