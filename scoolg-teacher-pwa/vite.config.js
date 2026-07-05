import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      // Take control immediately so a new deploy applies on next open (auto-reload)
      // instead of serving the stale cached app until a manual refresh.
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        cleanupOutdatedCaches: true,
      },
      devOptions: { enabled: true }, // make the PWA installable during `npm run dev`
      includeAssets: ['favicon.svg', 'scoolg-logo.png'],
      manifest: {
        name: 'ScoolG Teacher',
        short_name: 'ScoolG Teacher',
        description: 'Mark attendance, assign homework and manage your classes.',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: 'teacher-icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'teacher-icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'teacher-icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
