// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    port: 3000,           // frontend usually runs here
    open: true,           // auto-open browser (optional but helpful)

    // ← This is the important part – the proxy
    proxy: {
      // All requests starting with /api will be forwarded to the backend
      '/api': {
        target: 'http://localhost:3001',   // ← your Express backend port
        changeOrigin: true,                // needed when proxying to different origin
        secure: false,                     // for local http → http
        // Optional: rewrite if your backend expects paths without /api prefix
        // rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})