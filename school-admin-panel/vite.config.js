import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Served at the domain root on Vercel (admin.scoolg.com). For path-based
  // hosting (scoolg.com/admin/) set this back to '/admin/'.
  base: '/',
  server: {
    port: 5174
  }
})

