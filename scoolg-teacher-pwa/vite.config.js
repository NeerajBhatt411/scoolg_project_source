import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'scoolg-logo.png'],
      manifest: {
        name: 'ScoolG Teacher',
        short_name: 'ScoolG',
        description: 'Mark attendance, assign homework and manage your classes.',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: 'scoolg-logo.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'scoolg-logo.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'scoolg-logo.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
